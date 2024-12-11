"use client";

import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as faceapi from 'face-api.js';

const WebcamWithFaceDetection = ({ onFaceDetectionStatus }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [noFace, setNoFace] = useState(true);
  const [faceOutOfFrame, setFaceOutOfFrame] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const detectorRef = useRef(null);

  // Load face-api.js models
  useEffect(() => {
    let isMounted = true;

    const loadModels = async () => {
      try {
        setDebugInfo('Loading face detection models...');
        
        // Configure face-api.js
        faceapi.env.monkeyPatch({
          Canvas: HTMLCanvasElement,
          Image: HTMLImageElement,
          ImageData: ImageData,
          Video: HTMLVideoElement,
          createCanvasElement: () => document.createElement('canvas'),
          createImageElement: () => document.createElement('img')
        });

        // Load models sequentially
        await faceapi.nets.tinyFaceDetector.load('/models');
        if (!isMounted) return;
        setDebugInfo('Loaded face detector...');
        
        await faceapi.nets.faceLandmark68TinyNet.load('/models');
        if (!isMounted) return;
        setDebugInfo('Loaded landmarks detector...');

        // Initialize detector with optimized settings
        detectorRef.current = new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.3
        });

        setDebugInfo('All models loaded successfully');
        setIsModelLoading(false);
      } catch (error) {
        console.error('Error loading models:', error);
        setDebugInfo(`Error: ${error.message}`);
        toast.error('Failed to load face detection models. Please refresh the page.');
      }
    };

    loadModels();
    return () => { isMounted = false; };
  }, []);

  // Run face detection
  useEffect(() => {
    if (!detectorRef.current || !webcamRef.current?.video || isModelLoading) return;

    let animationFrame;
    let isProcessing = false;

    const detectFaces = async () => {
      if (isProcessing || webcamRef.current?.video?.readyState !== 4) return;

      try {
        isProcessing = true;
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        const displaySize = { width: video.videoWidth, height: video.videoHeight };

        // Match canvas size to video
        if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
          faceapi.matchDimensions(canvas, displaySize);
        }

        // Detect faces with optimized settings
        const detections = await faceapi
          .detectAllFaces(video, detectorRef.current)
          .withFaceLandmarks(true);

        // Clear previous drawings
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detections && detections.length > 0) {
          // Draw detections
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

          // Update status
          setNoFace(false);
          setMultipleFaces(detections.length > 1);

          // Check face position for single face
          if (detections.length === 1) {
            const face = detections[0];
            const { x, y, width, height } = face.detection.box;
            
            // Calculate if face is properly centered
            const isInFrame = 
              x > 0.1 * canvas.width && 
              (x + width) < 0.9 * canvas.width &&
              y > 0.1 * canvas.height && 
              (y + height) < 0.9 * canvas.height;

            setFaceOutOfFrame(!isInFrame);
          }

          setDebugInfo(`Found ${detections.length} face(s)`);
        } else {
          setMultipleFaces(false);
          setNoFace(true);
          setFaceOutOfFrame(false);
          setDebugInfo('No faces detected');
        }

        // Update parent component
        onFaceDetectionStatus?.({
          isValid: detections && detections.length === 1 && !faceOutOfFrame,
          multipleFaces: detections && detections.length > 1,
          noFace: !detections || detections.length === 0,
          faceOutOfFrame
        });

      } catch (error) {
        console.error('Detection error:', error);
        setDebugInfo(`Error: ${error.message}`);
      } finally {
        isProcessing = false;
      }
    };

    const runDetection = () => {
      detectFaces();
      animationFrame = requestAnimationFrame(runDetection);
    };

    runDetection();
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isModelLoading]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Webcam
          ref={webcamRef}
          mirrored={true}
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "user",
            frameRate: 30
          }}
          className="w-full rounded-lg"
          onUserMedia={() => setDebugInfo('Camera ready')}
          onUserMediaError={(err) => {
            setDebugInfo(`Camera error: ${err.message}`);
            toast.error('Failed to access camera');
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{ zIndex: 1 }}
        />
      </div>

      {/* Status Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        {multipleFaces && (
          <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm shadow-lg">
            <AlertCircle className="w-4 h-4" />
            Multiple faces detected
          </div>
        )}
        {noFace && (
          <div className="flex items-center gap-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm shadow-lg">
            <AlertCircle className="w-4 h-4" />
            No face detected
          </div>
        )}
        {faceOutOfFrame && (
          <div className="flex items-center gap-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm shadow-lg">
            <AlertCircle className="w-4 h-4" />
            Center your face
          </div>
        )}
        {!multipleFaces && !noFace && !faceOutOfFrame && (
          <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm shadow-lg">
            <CheckCircle2 className="w-4 h-4" />
            Face detected
          </div>
        )}
      </div>

      {/* Loading State */}
      {isModelLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-20">
          <div className="flex flex-col items-center gap-2 text-white">
            <Loader2 className="w-8 h-8 animate-spin" />
            <div>Loading face detection...</div>
            <div className="text-sm opacity-75">{debugInfo}</div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="absolute bottom-4 left-4 text-xs text-white bg-black/50 px-2 py-1 rounded">
        {debugInfo}
      </div>
    </div>
  );
};

export default WebcamWithFaceDetection;

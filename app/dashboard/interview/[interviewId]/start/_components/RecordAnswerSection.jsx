"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useContext, useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import { Mic } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAiModel";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { WebCamContext } from "@/app/dashboard/layout";
import { GoogleGenerativeAI } from "@google/generative-ai";
import RobotAvatar from "./RobotAvatar";
import WebcamWithFaceDetection from './WebcamWithFaceDetection';

const RecordAnswerSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [shouldProcessAnswer, setShouldProcessAnswer] = useState(false);
  const { webCamEnabled, setWebCamEnabled } = useContext(WebCamContext);
  const [faceDetectionStatus, setFaceDetectionStatus] = useState({
    isValid: false,
    multipleFaces: false,
    noFace: true,
    faceOutOfFrame: false
  });
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

  useEffect(() => {
    let timeoutId;
    if (shouldProcessAnswer && userAnswer.length > 10 && !isRecording) {
      timeoutId = setTimeout(() => {
        updateUserAnswer();
        setShouldProcessAnswer(false);
      }, 500);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [shouldProcessAnswer, userAnswer, isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setShouldProcessAnswer(false);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast("Error starting recording. Please check your microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setShouldProcessAnswer(true);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      setLoading(true);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];
        
        const result = await model.generateContent([
          "Transcribe the following audio:",
          { inlineData: { data: base64Audio, mimeType: "audio/webm" } },
        ]);

        const transcription = result.response.text();
        setUserAnswer((prevAnswer) => prevAnswer + " " + transcription);
        setLoading(false);
      };
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast("Error transcribing audio. Please try again.");
      setLoading(false);
    }
  };

  const updateUserAnswer = async () => {
    if (loading) return;
    
    try {
      setLoading(true);

      if (!mockInterviewQuestion || !mockInterviewQuestion[activeQuestionIndex]) {
        throw new Error("No active question found");
      }

      const currentQuestion = mockInterviewQuestion[activeQuestionIndex];
      
      if (!currentQuestion.Question || !currentQuestion.Answer) {
        throw new Error("Question or answer is missing");
      }

      if (!userAnswer || userAnswer.trim().length === 0) {
        throw new Error("User answer is required");
      }

      if (!interviewData?.mockId) {
        throw new Error("Interview ID is missing");
      }

      const feedbackPrompt = `Analyze this interview response and provide feedback:
Question: "${currentQuestion.Question}"
User's Answer: "${userAnswer.trim()}"
Expected Answer: "${currentQuestion.Answer}"

Rate the answer on a scale of 1-10 and provide constructive feedback.
Remember to respond with ONLY a JSON object in this exact format:
{
  "rating": <number 1-10>,
  "feedback": "<constructive feedback>"
}`;

      const result = await chatSession.sendMessage(feedbackPrompt);
      const response = result.response.text();
      
      // Clean and validate the response
      const cleanResponse = response
        .trim()
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .replace(/^json\s*/, '')
        .trim();

      let jsonFeedbackResp;
      try {
        jsonFeedbackResp = JSON.parse(cleanResponse);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        console.log("Raw response:", response);
        console.log("Cleaned response:", cleanResponse);
        throw new Error("Failed to parse AI response");
      }

      // Validate the feedback format
      if (typeof jsonFeedbackResp !== 'object') {
        throw new Error("Invalid response format: not an object");
      }

      if (!('rating' in jsonFeedbackResp) || !('feedback' in jsonFeedbackResp)) {
        throw new Error("Invalid response format: missing required fields");
      }

      const rating = Number(jsonFeedbackResp.rating);
      if (isNaN(rating) || rating < 1 || rating > 10) {
        throw new Error("Invalid rating: must be a number between 1 and 10");
      }

      if (typeof jsonFeedbackResp.feedback !== 'string' || jsonFeedbackResp.feedback.trim().length === 0) {
        throw new Error("Invalid feedback: must be a non-empty string");
      }

      await db.insert(UserAnswer).values({
        mockIdRef: interviewData.mockId,
        question: currentQuestion.Question,
        correctAns: currentQuestion.Answer,
        userAns: userAnswer.trim(),
        feedback: jsonFeedbackResp.feedback.trim(),
        rating: rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("YYYY-MM-DD"),
      });

      toast.success("Answer recorded successfully!");
      setUserAnswer("");
      setShouldProcessAnswer(false);
    } catch (error) {
      console.error("Error in updateUserAnswer:", error);
      toast.error(error.message || "Failed to process answer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full max-w-3xl mx-auto p-4">
      <div className="w-full bg-[#0A0F1C] rounded-lg p-6">
        <RobotAvatar
          question={mockInterviewQuestion?.[activeQuestionIndex]?.Question}
          isRecording={isRecording}
          onStartRecording={startRecording}
        />
      </div>

      <div className="w-full bg-black rounded-lg p-4">
        {webCamEnabled ? (
          <WebcamWithFaceDetection
            onFaceDetectionStatus={setFaceDetectionStatus}
          />
        ) : (
          <div className="flex justify-center items-center h-[300px] bg-gray-900 rounded-lg">
            <Image src={"/camera.jpg"} width={200} height={200} alt="Camera placeholder" className="rounded-lg" />
          </div>
        )}
      </div>

      <div className="flex gap-4 justify-center w-full">
        <Button 
          onClick={() => setWebCamEnabled((prev) => !prev)}
          className="min-w-[150px]"
        >
          {webCamEnabled ? "Close WebCam" : "Enable WebCam"}
        </Button>
        <Button
          variant="outline"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={loading || (webCamEnabled && !faceDetectionStatus.isValid)}
          className="min-w-[150px]"
        >
          {isRecording ? (
            <span className="text-red-400 flex items-center gap-2">
              <Mic className="w-4 h-4" /> Stop Recording...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Mic className="w-4 h-4" /> Record Answer
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RecordAnswerSection;

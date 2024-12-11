"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RobotAvatar = ({ question, isRecording }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (question) {
      utteranceRef.current = new SpeechSynthesisUtterance(question);
      utteranceRef.current.onend = () => {
        setIsSpeaking(false);
      };
      setIsSpeaking(true);
      synth.speak(utteranceRef.current);
    }

    return () => {
      if (utteranceRef.current) {
        synth.cancel();
      }
    };
  }, [question]);

  return (
    <div className="relative w-full aspect-video bg-[#0A0F1C] rounded-lg overflow-hidden flex flex-col items-center justify-center p-8">
      <motion.div
        className="w-32 h-32 relative"
        animate={isSpeaking ? {
          scale: [1, 1.05, 1],
          transition: { repeat: Infinity, duration: 2 }
        } : {}}
      >
        {/* Robot Head */}
        <motion.div
          className="absolute inset-0 border-4 border-blue-500 rounded-full"
          animate={isSpeaking ? {
            borderColor: ['#3B82F6', '#60A5FA', '#3B82F6'],
            transition: { repeat: Infinity, duration: 1.5 }
          } : {}}
        />
        
        {/* Robot Eyes */}
        <motion.div 
          className="absolute top-1/3 left-1/4 w-3 h-3 bg-blue-500 rounded-full"
          animate={isSpeaking ? {
            scale: [1, 1.2, 1],
            transition: { repeat: Infinity, duration: 1 }
          } : {}}
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-3 h-3 bg-blue-500 rounded-full"
          animate={isSpeaking ? {
            scale: [1, 1.2, 1],
            transition: { repeat: Infinity, duration: 1 }
          } : {}}
        />
        
        {/* Robot Mouth */}
        <motion.div 
          className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-500 rounded"
          animate={isSpeaking ? {
            scaleX: [1, 1.2, 1],
            transition: { repeat: Infinity, duration: 0.5 }
          } : {}}
        />
      </motion.div>

      {/* Question Text */}
      <motion.div 
        className="mt-8 text-center text-white max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-lg">{question}</p>
      </motion.div>
    </div>
  );
};

export default RobotAvatar;

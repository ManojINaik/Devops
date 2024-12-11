"use client";
import { Lightbulb, Volume2, VolumeX, Pause, Play } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const QuestionSection = ({ 
  question, 
  expectedAnswer, 
  timeLimit,
  avatarUrl,
  audioUrl,
  useFallback 
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Reset states when question changes
    setIsSpeaking(false);
    setIsPaused(false);
    setShowAnswer(false);
  }, [question]);

  const handlePlayAudio = async () => {
    try {
      if (!audioUrl) {
        toast.error("Audio not available for this question");
        return;
      }

      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.addEventListener('ended', () => {
          setIsSpeaking(false);
          setIsPaused(false);
        });
      }

      if (isPaused) {
        audioRef.current.play();
        setIsPaused(false);
      } else if (isSpeaking) {
        audioRef.current.pause();
        setIsPaused(true);
      } else {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      
      setIsSpeaking(!isPaused);
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error("Failed to play audio");
      setIsSpeaking(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex flex-col space-y-6">
        {/* Question Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Question</h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayAudio}
                disabled={!audioUrl}
                className="hover:bg-gray-100"
              >
                {isSpeaking ? (
                  isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnswer(!showAnswer)}
                className="hover:bg-gray-100"
              >
                <Lightbulb className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-6 bg-[#0A0F1C] rounded-lg text-white">
            <p className="text-lg">{question}</p>
            <div className="mt-4 text-sm text-gray-400">
              Time Limit: {timeLimit} seconds
            </div>
          </div>

          <AnimatePresence>
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-medium mb-3 text-blue-900">Expected Answer Points:</h4>
                  <p className="text-gray-800 leading-relaxed">{expectedAnswer}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default QuestionSection;

"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function HumanAvatar({ isSpeaking, text }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isSpeaking && text) {
      speakWithAvatar(text);
    }
  }, [isSpeaking, text]);

  const speakWithAvatar = async (text) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Sending request to create talk with text:", text);

      const response = await fetch("/api/clips", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create talk");
      }

      const data = await response.json();
      console.log("Received response:", data);

      if (!data.result_url) {
        throw new Error("No result URL in the response");
      }

      setVideoUrl(data.result_url);
    } catch (error) {
      console.error("Error in avatar speech:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full max-w-2xl mx-auto rounded-lg overflow-hidden bg-gray-100"
      style={{ 
        aspectRatio: "16/9",
        maxHeight: "400px"
      }}
    >
      {videoUrl ? (
        <video
          key={videoUrl}
          src={videoUrl}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
          style={{
            background: "#F3F4F6"
          }}
        >
          <track kind="captions" />
        </video>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          {isLoading ? (
            "Generating response..."
          ) : error ? (
            `Error: ${error}`
          ) : (
            "Ready to speak"
          )}
        </div>
      )}
    </motion.div>
  );
}

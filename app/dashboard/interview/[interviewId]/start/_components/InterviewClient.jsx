"use client";

import React, { useState, useCallback, useEffect } from "react";
import QuestionSection from "./QuestionSection";
import RecordAnswerSection from "./RecordAnswerSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function InterviewClient({ interview }) {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const handlePrevQuestion = useCallback(() => {
    setActiveQuestionIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (!interview?.questions) return;
    setActiveQuestionIndex(prev => 
      Math.min(interview.questions.length - 1, prev + 1)
    );
  }, [interview?.questions]);

  if (!interview || !interview.questions || interview.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <div className="text-destructive mb-4">⚠️ No questions available for this interview</div>
        <Link href="/dashboard">
          <Button variant="outline">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const currentQuestion = interview.questions[activeQuestionIndex];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">
          Question {activeQuestionIndex + 1} of {interview.questions.length}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <QuestionSection
          question={currentQuestion.Question}
          expectedAnswer={currentQuestion.Answer}
          timeLimit={60}
        />
        <RecordAnswerSection
          mockInterviewQuestion={interview.questions}
          activeQuestionIndex={activeQuestionIndex}
          interviewData={interview}
        />
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <Button
          onClick={handlePrevQuestion}
          disabled={activeQuestionIndex === 0}
          variant="outline"
          size="lg"
          className="min-w-[200px]"
        >
          ← Previous Question
        </Button>
        {activeQuestionIndex === interview.questions.length - 1 ? (
          <Link href={`/dashboard/interview/${interview.mockId}/feedback`}>
            <Button variant="default" size="lg" className="min-w-[200px]">
              End Interview
            </Button>
          </Link>
        ) : (
          <Button
            onClick={handleNextQuestion}
            variant="default"
            size="lg"
            className="min-w-[200px]"
          >
            Next Question →
          </Button>
        )}
      </div>
    </div>
  );
}

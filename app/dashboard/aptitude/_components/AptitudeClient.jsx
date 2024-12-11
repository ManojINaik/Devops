"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Brain, Calculator, Code, BookOpen } from "lucide-react";
import ScoreBoard from "./ScoreBoard";

const TOPICS = [
  { 
    id: 'reasoning', 
    name: 'Logical Reasoning', 
    description: 'Test your analytical and logical thinking skills',
    icon: Brain
  },
  { 
    id: 'math', 
    name: 'Mathematical Aptitude', 
    description: 'Evaluate your mathematical and numerical abilities',
    icon: Calculator
  },
  { 
    id: 'technical', 
    name: 'Technical Knowledge', 
    description: 'Assess your technical and programming concepts',
    icon: Code
  },
  { 
    id: 'verbal', 
    name: 'Verbal Ability', 
    description: 'Test your English language and comprehension skills',
    icon: BookOpen
  }
];

const AptitudeClient = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [topicSelectionLoading, setTopicSelectionLoading] = useState(false);
  const [scores, setScores] = useState({});
  const [showResults, setShowResults] = useState(false);

  const fetchQuestions = async (topic) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/aptitude/questions?topic=${topic}`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions received');
      }

      setQuestions(data.questions);
      setTestStarted(true);
      setShowResults(false);
    } catch (error) {
      toast.error(error.message || "Failed to load questions");
      console.error(error);
      setTestStarted(false);
      setSelectedTopic(null);
    } finally {
      setLoading(false);
      setTopicSelectionLoading(false);
    }
  };

  const handleStartTest = async (topic) => {
    try {
      setTopicSelectionLoading(true);
      setSelectedTopic(topic);
      await fetchQuestions(topic);
    } catch (error) {
      toast.error("Failed to start test");
      setSelectedTopic(null);
      setTopicSelectionLoading(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const answeredQuestions = Object.keys(answers).length;
    if (answeredQuestions < questions.length) {
      toast.error(`Please answer all questions (${answeredQuestions}/${questions.length} completed)`);
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/aptitude/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          answers,
          topic: selectedTopic 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit test');
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Update scores with the new score
      setScores(prev => ({
        ...prev,
        [selectedTopic]: {
          correct: data.score.correct,
          total: data.score.total,
          percentage: data.score.percentage
        }
      }));

      toast.success("Test submitted successfully!");
      setShowResults(true);
      setTestStarted(false);
      setQuestions([]);
      setAnswers({});
      setCurrentQuestion(0);
    } catch (error) {
      toast.error(error.message || "Failed to submit test");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartNewTest = () => {
    setSelectedTopic(null);
    setShowResults(false);
    setTestStarted(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="container max-w-3xl mx-auto py-8">
        <ScoreBoard scores={scores} />
        <div className="mt-6 text-center">
          <Button onClick={handleStartNewTest}>
            Take Another Test
          </Button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <ScoreBoard scores={scores} />
        </div>
        <h1 className="text-2xl font-bold mb-6">Choose Your Aptitude Test</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <Button
                key={topic.id}
                variant="outline"
                className={`h-auto p-6 hover:border-primary ${
                  topicSelectionLoading && selectedTopic === topic.id
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-primary/5'
                }`}
                onClick={() => !topicSelectionLoading && handleStartTest(topic.id)}
                disabled={topicSelectionLoading}
              >
                <div className="flex flex-col items-center text-left w-full">
                  <Icon className="h-8 w-8 mb-4 text-primary" />
                  <h2 className="text-xl font-semibold mb-2">{topic.name}</h2>
                  <p className="text-muted-foreground text-sm">{topic.description}</p>
                  {topicSelectionLoading && selectedTopic === topic.id && (
                    <Loader2 className="h-4 w-4 animate-spin mt-2" />
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              Aptitude Test: {TOPICS.find(t => t.id === selectedTopic)?.name}
            </h1>
            <span className="text-sm text-muted-foreground">
              {Object.keys(answers).length}/{questions.length} Answered
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        {currentQ && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{currentQ.question}</h2>
              <div className="space-y-2">
                {currentQ.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={answers[currentQ.id] === option ? "default" : "outline"}
                    className="w-full justify-start text-left"
                    onClick={() => handleAnswer(currentQ.id, option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Test"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!answers[currentQ.id]}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AptitudeClient;

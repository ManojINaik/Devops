"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";
import { Loader2, Brain, Code2, CheckCircle2, AlertCircle } from "lucide-react";

const FOCUS_AREAS = [
  'Code Quality',
  'Performance',
  'Security',
  'Best Practices',
  'Design Patterns',
  'Testing',
  'Documentation',
  'Error Handling'
];

const SKILL_LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' }
];

export const SkillsAssessment = () => {
  const [code, setCode] = useState('');
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [question, setQuestion] = useState(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAreaToggle = (area) => {
    setSelectedAreas(prev => 
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleAssessment = async () => {
    if (selectedAreas.length === 0) {
      toast.error("Please select at least one focus area");
      return;
    }

    try {
      setIsAssessing(true);
      setLoading(true);
      // Reset previous results
      setResult(null);
      setAnalysis(null);
      setCode('');
      
      const questionResponse = await fetch("/api/skills/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          focusAreas: selectedAreas,
          skillLevel,
        }),
      });

      if (!questionResponse.ok) {
        const errorData = await questionResponse.json();
        throw new Error(errorData.details || "Failed to generate question");
      }

      const questionData = await questionResponse.json();
      if (!questionData.question) {
        throw new Error("No question received from the API");
      }

      setQuestion(questionData.question);
      toast.success("Question generated! Please write your solution in the editor.");
    } catch (error) {
      console.error("Question generation error:", error);
      toast.error(error.message || "Failed to generate question");
    } finally {
      setIsAssessing(false);
      setLoading(false);
    }
  };

  const handleSubmitSolution = async () => {
    if (isAssessing) {
      toast.error("Please wait for question generation to complete");
      return;
    }

    if (!code.trim()) {
      toast.error("Please write your solution before submitting");
      return;
    }

    if (!question) {
      toast.error("Please generate a question first");
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);
      const response = await fetch("/api/skills/assess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          question,
          focusAreas: selectedAreas,
          skillLevel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to assess code");
      }

      const data = await response.json();
      
      if (!data.result || !data.analysis) {
        throw new Error("Invalid response format from assessment");
      }

      // Save the assessment result
      await fetch("/api/skills/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          focusAreas: selectedAreas,
          skillLevel,
          overallScore: data.result.overallScore,
          categoryScores: data.result.categories,
          correctness: data.result.correctness || false
        }),
      });

      setResult(data.result);
      setAnalysis(data.analysis);
      toast.success("Assessment completed!");
    } catch (error) {
      console.error("Assessment error:", error);
      toast.error(error.message || "Failed to assess code");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Skills Assessment</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Coding Challenge</h2>
                {question ? (
                  <div className="mb-4 p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">Question:</h3>
                    <p className="text-sm whitespace-pre-wrap">{question}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mb-4">
                    Select focus areas and click "Start Assessment" to get a question
                  </p>
                )}
                <Editor
                  height="400px"
                  defaultLanguage="javascript"
                  value={code}
                  onChange={setCode}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    wordWrap: "on",
                  }}
                />
              </div>
              {question && (
                <Button
                  className="w-full"
                  onClick={handleSubmitSolution}
                  disabled={loading || !code.trim() || isAssessing}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Evaluating Solution...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Submit Solution
                    </>
                  )}
                </Button>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Assessment Options</h2>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Skill Level</h3>
                <div className="grid grid-cols-1 gap-2">
                  {SKILL_LEVELS.map((level) => (
                    <Button
                      key={level.id}
                      variant={skillLevel === level.id ? "default" : "outline"}
                      onClick={() => setSkillLevel(level.id)}
                      className="justify-start"
                    >
                      {level.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Focus Areas</h3>
                <div className="grid grid-cols-1 gap-2">
                  {FOCUS_AREAS.map((area) => (
                    <Button
                      key={area}
                      variant={selectedAreas.includes(area) ? "default" : "outline"}
                      onClick={() => handleAreaToggle(area)}
                      className="justify-start"
                    >
                      {area}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            <div className="flex justify-between gap-4 mt-4">
              <Button
                className="flex-1"
                onClick={handleAssessment}
                disabled={loading || selectedAreas.length === 0 || isSubmitting}
              >
                {isAssessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Question...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Start Assessment
                  </>
                )}
              </Button>
              
              {question && (
                <Button
                  className="flex-1"
                  onClick={handleSubmitSolution}
                  disabled={loading || !code.trim() || isAssessing}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Evaluating Solution...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Submit Solution
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {result && (
          <div className="mt-8 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Assessment Results</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Overall Score</span>
                    <span className="font-bold">{result.overallScore}%</span>
                  </div>
                  <Progress value={result.overallScore} className="h-2" />
                </div>

                {result.categories?.map((category) => (
                  <div key={category.name}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{category.name}</span>
                      <span>{category.score}%</span>
                    </div>
                    <Progress value={category.score} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>

            {analysis && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Detailed Analysis</h2>
                <div className="space-y-4">
                  {analysis.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      {item.type === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      )}
                      <p className="text-sm">{item.message}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

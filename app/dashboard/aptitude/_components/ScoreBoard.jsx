"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Calculator, Code, BookOpen } from "lucide-react";

const TOPIC_ICONS = {
  reasoning: Brain,
  math: Calculator,
  technical: Code,
  verbal: BookOpen,
};

const ScoreBoard = ({ scores }) => {
  if (!scores || Object.keys(scores).length === 0) {
    return null;
  }

  const getTopicIcon = (topicId) => {
    const Icon = TOPIC_ICONS[topicId];
    return Icon ? <Icon className="h-5 w-5 text-primary" /> : null;
  };

  const calculatePercentage = (correct, total) => {
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Your Test Results</h2>
      <div className="space-y-4">
        {Object.entries(scores).map(([topic, score]) => {
          const percentage = calculatePercentage(score.correct, score.total);
          return (
            <div key={topic} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTopicIcon(topic)}
                  <span className="font-medium capitalize">
                    {topic.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {score.correct}/{score.total} ({percentage}%)
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
              <div className="text-sm text-muted-foreground">
                {percentage >= 70 ? (
                  <span className="text-green-600">Excellent performance!</span>
                ) : percentage >= 50 ? (
                  <span className="text-yellow-600">Good effort!</span>
                ) : (
                  <span className="text-red-600">Needs improvement</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ScoreBoard;

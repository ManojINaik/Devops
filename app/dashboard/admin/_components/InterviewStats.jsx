"use client";

import { Card } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const InterviewStats = ({ interviews }) => {
  const processInterviewData = () => {
    const scoresByDifficulty = {
      easy: [],
      medium: [],
      hard: []
    };

    interviews.forEach(interview => {
      if (interview.score) {
        scoresByDifficulty[interview.difficulty].push(interview.score);
      }
    });

    return {
      easy: calculateAverage(scoresByDifficulty.easy),
      medium: calculateAverage(scoresByDifficulty.medium),
      hard: calculateAverage(scoresByDifficulty.hard)
    };
  };

  const calculateAverage = (scores) => {
    return scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b) / scores.length) 
      : 0;
  };

  const averageScores = processInterviewData();

  const chartData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        label: 'Average Score by Difficulty',
        data: Object.values(averageScores),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Interview Performance by Difficulty'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  const getStats = () => {
    const total = interviews.length;
    const passed = interviews.filter(i => i.score >= 70).length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    return {
      total,
      passed,
      passRate,
      averageScore: calculateAverage(interviews.map(i => i.score))
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Interviews</h3>
          <p className="text-3xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Passed</h3>
          <p className="text-3xl font-bold">{stats.passed}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Pass Rate</h3>
          <p className="text-3xl font-bold">{stats.passRate}%</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Average Score</h3>
          <p className="text-3xl font-bold">{stats.averageScore}%</p>
        </Card>
      </div>

      <Card className="p-6">
        <Line data={chartData} options={options} />
      </Card>
    </div>
  );
};

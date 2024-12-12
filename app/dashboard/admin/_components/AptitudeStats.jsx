"use client";

import { Card } from "@/components/ui/card";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export const AptitudeStats = ({ tests }) => {
  const processTestData = () => {
    const scoresByTopic = {
      reasoning: [],
      math: [],
      technical: [],
      verbal: []
    };

    tests.forEach(test => {
      if (test.score && test.topic) {
        scoresByTopic[test.topic].push(test.score);
      }
    });

    return Object.entries(scoresByTopic).reduce((acc, [topic, scores]) => {
      acc[topic] = calculateAverage(scores);
      return acc;
    }, {});
  };

  const calculateAverage = (scores) => {
    return scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b) / scores.length) 
      : 0;
  };

  const averageScores = processTestData();

  const chartData = {
    labels: [
      'Logical Reasoning',
      'Mathematical Aptitude',
      'Technical Knowledge',
      'Verbal Ability'
    ],
    datasets: [{
      data: Object.values(averageScores),
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Average Scores by Topic'
      }
    }
  };

  const getStats = () => {
    const total = tests.length;
    const passed = tests.filter(t => t.score >= 70).length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    const topicDistribution = tests.reduce((acc, test) => {
      acc[test.topic] = (acc[test.topic] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      passed,
      passRate,
      averageScore: calculateAverage(tests.map(t => t.score)),
      topicDistribution
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Tests</h3>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <Doughnut data={chartData} options={options} />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Topic Distribution</h3>
          <div className="space-y-4">
            {Object.entries(stats.topicDistribution).map(([topic, count]) => (
              <div key={topic} className="flex justify-between items-center">
                <span className="capitalize">{topic}</span>
                <span className="font-semibold">{count} tests</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

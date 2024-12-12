"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const Overview = ({ overview }) => {
  if (!overview) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Overview</h2>
        <p>No data available</p>
      </Card>
    );
  }

  const {
    totalUsers = 0,
    totalInterviews = 0,
    totalAptitudeTests = 0,
    totalAssessments = 0,
    passRate = 0,
    averageScore = 0,
    skillsAverageScore = 0
  } = overview;

  const chartData = {
    labels: ['Users', 'Interviews', 'Aptitude Tests', 'Skills Assessments'],
    datasets: [
      {
        label: 'Total Count',
        data: [totalUsers, totalInterviews, totalAptitudeTests, totalAssessments],
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(16, 185, 129, 0.5)',
          'rgba(245, 158, 11, 0.5)',
          'rgba(255, 99, 132, 0.5)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(255, 99, 132)'
        ],
        borderWidth: 1
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
        text: 'Platform Overview'
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Total Interviews</h3>
            <p className="text-2xl font-bold">{totalInterviews}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Total Aptitude Tests</h3>
            <p className="text-2xl font-bold">{totalAptitudeTests}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Total Skills Assessments</h3>
            <p className="text-2xl font-bold">{totalAssessments}</p>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Pass Rate</h3>
            <div className="flex items-center gap-2">
              <Progress value={passRate} className="flex-1" />
              <span className="text-sm font-medium">{passRate}%</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Average Score</h3>
            <div className="flex items-center gap-2">
              <Progress value={averageScore} className="flex-1" />
              <span className="text-sm font-medium">{averageScore}%</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Skills Average</h3>
            <div className="flex items-center gap-2">
              <Progress value={skillsAverageScore} className="flex-1" />
              <span className="text-sm font-medium">{skillsAverageScore}%</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <Bar data={chartData} options={options} />
      </Card>
    </div>
  );
};

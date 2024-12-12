"use client";

import { Card } from "@/components/ui/card";
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

export const Overview = ({ data }) => {
  const chartData = {
    labels: ['Users', 'Interviews', 'Aptitude Tests'],
    datasets: [
      {
        label: 'Total Count',
        data: [data.totalUsers, data.totalInterviews, data.totalAptitudeTests],
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(16, 185, 129, 0.5)',
          'rgba(245, 158, 11, 0.5)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)'
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{data.totalUsers}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Interviews</h3>
          <p className="text-3xl font-bold">{data.totalInterviews}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Tests</h3>
          <p className="text-3xl font-bold">{data.totalAptitudeTests}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Pass Rate</h3>
          <p className="text-3xl font-bold">{data.passRate}%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <Bar data={chartData} options={options} />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Average Score</span>
                <span className="font-semibold">{data.averageScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${data.averageScore}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Pass Rate</span>
                <span className="font-semibold">{data.passRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${data.passRate}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

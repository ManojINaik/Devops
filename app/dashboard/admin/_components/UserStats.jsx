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

export const UserStats = ({ users }) => {
  const usersByMonth = users.reduce((acc, user) => {
    const date = new Date(user.createdAt);
    const month = date.toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(usersByMonth),
    datasets: [
      {
        label: 'New Users',
        data: Object.values(usersByMonth),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'User Registration Trends',
      },
    },
  };

  const calculateStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    const completedInterviews = users.reduce((acc, user) => 
      acc + (user.interviews?.length || 0), 0
    );

    return { totalUsers, activeUsers, completedInterviews };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Active Users</h3>
          <p className="text-3xl font-bold">{stats.activeUsers}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Interviews</h3>
          <p className="text-3xl font-bold">{stats.completedInterviews}</p>
        </Card>
      </div>

      <Card className="p-6">
        <Bar data={chartData} options={options} />
      </Card>
    </div>
  );
};

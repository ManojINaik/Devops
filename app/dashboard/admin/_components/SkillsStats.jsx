"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

export const SkillsStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch skills stats");
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching skills stats:", error);
        toast.error("Failed to load skills statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading skills statistics...</div>;
  }

  if (!stats || !stats.skillAssessments || stats.skillAssessments.length === 0) {
    return (
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Skills Assessment Statistics</h2>
        <p>No skills assessment records found.</p>
      </Card>
    );
  }

  const skillLevelData = stats.skillAssessments.reduce((acc, assessment) => {
    const level = assessment.skillLevel || "Unknown";
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(skillLevelData).map(([name, value]) => ({
    name,
    count: value,
  }));

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Skills Assessment Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4">
          <h3 className="text-sm font-medium">Total Assessments</h3>
          <p className="text-2xl font-bold">{stats.overview.totalAssessments}</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium">Average Score</h3>
          <p className="text-2xl font-bold">{stats.overview.skillsAverageScore}%</p>
        </Card>
      </div>

      <div className="h-[300px] mt-4">
        <h3 className="text-lg font-medium mb-2">Skill Level Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

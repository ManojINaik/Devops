"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const SkillsStats = () => {
  const [stats, setStats] = useState({
    totalAssessments: 0,
    averageScore: 0,
    skillLevelDistribution: [],
    focusAreaPerformance: [],
    recentTrend: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/skills-stats");
        if (!response.ok) throw new Error("Failed to fetch skills stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching skills stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Skills Assessment Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Overview</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Assessments</p>
              <p className="text-2xl font-bold">{stats.totalAssessments}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <div className="flex items-center gap-2">
                <Progress value={stats.averageScore} className="flex-1" />
                <span className="text-sm font-medium">{stats.averageScore}%</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Skill Level Distribution</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.skillLevelDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Focus Area Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.focusAreaPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="averageScore" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
};

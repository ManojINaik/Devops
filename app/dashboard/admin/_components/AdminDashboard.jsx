"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserStats } from "./UserStats";
import { InterviewStats } from "./InterviewStats";
import { AptitudeStats } from "./AptitudeStats";
import { UserTable } from "./UserTable";
import { Overview } from "./Overview";
import { SkillsStats } from "./SkillsStats";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: [],
    interviews: [],
    aptitudeTests: [],
    overview: {
      totalUsers: 0,
      totalInterviews: 0,
      totalAptitudeTests: 0,
      averageScore: 0,
      passRate: 0,
    },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error);
        
        setStats(data);
      } catch (error) {
        toast.error("Failed to load admin statistics");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{stats.overview.totalUsers}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Interviews</h3>
          <p className="text-3xl font-bold">{stats.overview.totalInterviews}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Pass Rate</h3>
          <p className="text-3xl font-bold">{stats.overview.passRate}%</p>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="aptitude">Aptitude Tests</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Overview data={stats.overview} />
        </TabsContent>

        <TabsContent value="users">
          <UserStats users={stats.users} />
          <div className="mt-8">
            <UserTable users={stats.users} />
          </div>
        </TabsContent>

        <TabsContent value="interviews">
          <InterviewStats interviews={stats.interviews} />
        </TabsContent>

        <TabsContent value="aptitude">
          <AptitudeStats tests={stats.aptitudeTests} />
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <SkillsStats />
        </TabsContent>
      </Tabs>
    </div>
  );
};

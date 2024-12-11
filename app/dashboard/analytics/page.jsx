"use client";
import { useEffect, useState } from 'react';
import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq, desc } from "drizzle-orm";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';
import Header from "../_components/Header";
import { motion } from "framer-motion";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.5 }
};

const StatCard = ({ title, value, trend }) => (
  <motion.div
    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    whileHover={{ scale: 1.02 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <div className="mt-2 flex items-baseline">
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
      {trend && (
        <p className={`ml-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </p>
      )}
    </div>
  </motion.div>
);

export default function AnalyticsPage() {
  const { user } = useUser();
  const [data, setData] = useState({
    performanceData: [],
    interviewsByDay: [],
    loading: true,
    error: null,
    stats: {
      totalInterviews: 0,
      averageScore: 0,
      improvement: 0
    }
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) return;

      try {
        // Fetch user answers for performance data
        const answers = await db
          .select()
          .from(UserAnswer)
          .where(eq(UserAnswer.userEmail, user.emailAddresses[0].emailAddress))
          .orderBy(desc(UserAnswer.createdAt));

        // Process performance data
        const performanceByInterview = new Map();
        answers.forEach(answer => {
          if (!answer.rating || !answer.createdAt) return;
          
          const score = parseInt(answer.rating, 10);
          if (isNaN(score)) return;

          if (!performanceByInterview.has(answer.mockIdRef)) {
            performanceByInterview.set(answer.mockIdRef, {
              date: answer.createdAt,
              scores: []
            });
          }
          performanceByInterview.get(answer.mockIdRef).scores.push(score);
        });

        // Calculate average scores and format data for charts
        const performanceData = Array.from(performanceByInterview.entries())
          .map(([mockId, data]) => ({
            date: formatDate(data.date),
            score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
            mockId
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Calculate interviews by day
        const interviewsByDay = performanceData.reduce((acc, curr) => {
          const existingDay = acc.find(day => day.date === curr.date);
          if (existingDay) {
            existingDay.count += 1;
          } else {
            acc.push({ date: curr.date, count: 1 });
          }
          return acc;
        }, []);

        // Calculate stats
        const totalInterviews = performanceData.length;
        const averageScore = Math.round(
          performanceData.reduce((acc, curr) => acc + curr.score, 0) / totalInterviews
        );
        const improvement = performanceData.length >= 2 
          ? Math.round(((performanceData[performanceData.length - 1].score - performanceData[0].score) / performanceData[0].score) * 100)
          : 0;

        setData({
          performanceData,
          interviewsByDay,
          loading: false,
          error: null,
          stats: {
            totalInterviews,
            averageScore,
            improvement
          }
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load analytics data'
        }));
      }
    };

    fetchAnalytics();
  }, [user]);

  if (data.loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Header />
        <main className="pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-[400px] bg-gray-200 rounded-xl"></div>
            <div className="h-[300px] bg-gray-200 rounded-xl"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <main className="pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Performance Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Track your interview performance and progress over time
          </p>
        </motion.div>

        {data.error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-red-500 p-4 bg-red-50 rounded-xl"
          >
            {data.error}
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Interviews"
                value={data.stats.totalInterviews}
              />
              <StatCard
                title="Average Score"
                value={`${data.stats.averageScore}%`}
              />
              <StatCard
                title="Overall Improvement"
                value={`${Math.abs(data.stats.improvement)}%`}
                trend={data.stats.improvement}
              />
            </div>

            {/* Performance Over Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-4">Performance Over Time</h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.performanceData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis domain={[0, 100]} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#colorScore)"
                      name="Score (%)"
                      dot={{ r: 4, fill: "#6366f1" }}
                      activeDot={{ r: 6, fill: "#4f46e5" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Interviews by Day */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-4">Interviews by Day</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.interviewsByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis allowDecimals={false} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#6366f1"
                      name="Number of Interviews"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}

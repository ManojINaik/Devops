"use client";

import { motion } from "framer-motion";
import { Brain, Sparkles, Bot, ArrowRight, Activity } from "lucide-react";
import Header from "./_components/Header";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
import DashboardAnalytics from "./_components/DashboardAnalytics";

const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.5 }
};

function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <main className="pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-600/5 rounded-3xl" />
          <div className="relative p-8">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Welcome to AI-Cruit
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl">
              Enhance your interview skills with our AI-powered platform. Practice, learn, and improve with personalized feedback.
            </p>
            <div className="flex gap-4 mt-6">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium"
              >
                <Sparkles className="h-4 w-4" />
                AI-Powered Feedback
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-sm font-medium"
              >
                <Bot className="h-4 w-4" />
                Smart Analytics
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <DashboardAnalytics />
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* New Interview Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Start New Interview</h2>
                </div>
                <AddNewInterview />
              </div>
            </div>
          </motion.div>

          {/* Interview List */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Recent Interviews</h2>
                  </div>
                  <motion.button 
                    whileHover={{ x: 5 }}
                    className="text-primary flex items-center gap-2 text-sm font-medium"
                  >
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>
                <InterviewList />
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
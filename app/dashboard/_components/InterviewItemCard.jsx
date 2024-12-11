"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MessageSquare } from "lucide-react";
import moment from "moment";

export const InterviewItemCard = ({ interview }) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="relative group cursor-pointer"
      onClick={() => router.push(`/dashboard/interview/${interview.mockId}/start`)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {interview.jobPosition || "Mock Interview"}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {interview.jobDesc || "Practice interview session"}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{moment(interview.createdAt).format("MMM DD, YYYY")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{moment(interview.createdAt).format("hh:mm A")}</span>
            </div>
          </div>

          {/* Experience Level */}
          <div className="flex items-center gap-1.5 text-sm text-primary font-medium">
            <MessageSquare className="w-4 h-4" />
            <span>Experience: {interview.jobExperience}</span>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Ready to Start
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InterviewItemCard;
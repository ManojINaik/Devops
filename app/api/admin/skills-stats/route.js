import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = getAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all assessments
    const assessments = await prisma.skillAssessment.findMany({
      orderBy: { timestamp: 'desc' }
    });

    // Calculate total assessments
    const totalAssessments = assessments.length;

    // Calculate average score
    const averageScore = Math.round(
      assessments.reduce((acc, curr) => acc + curr.overallScore, 0) / totalAssessments
    );

    // Calculate skill level distribution
    const skillLevelCounts = assessments.reduce((acc, curr) => {
      acc[curr.skillLevel] = (acc[curr.skillLevel] || 0) + 1;
      return acc;
    }, {});

    const skillLevelDistribution = Object.entries(skillLevelCounts).map(([name, count]) => ({
      name,
      count
    }));

    // Calculate focus area performance
    const focusAreaScores = {};
    let totalFocusAreaCount = 0;

    assessments.forEach(assessment => {
      assessment.categoryScores.forEach(category => {
        if (!focusAreaScores[category.name]) {
          focusAreaScores[category.name] = {
            totalScore: 0,
            count: 0
          };
        }
        focusAreaScores[category.name].totalScore += category.score;
        focusAreaScores[category.name].count += 1;
        totalFocusAreaCount += 1;
      });
    });

    const focusAreaPerformance = Object.entries(focusAreaScores).map(([name, data]) => ({
      name,
      averageScore: Math.round(data.totalScore / data.count)
    }));

    // Calculate recent trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAssessments = assessments.filter(
      a => new Date(a.timestamp) >= sevenDaysAgo
    );

    const recentTrend = recentAssessments.reduce((acc, curr) => {
      const date = new Date(curr.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {
          totalScore: 0,
          count: 0
        };
      }
      acc[date].totalScore += curr.overallScore;
      acc[date].count += 1;
      return acc;
    }, {});

    const trendData = Object.entries(recentTrend).map(([date, data]) => ({
      date,
      averageScore: Math.round(data.totalScore / data.count)
    }));

    return NextResponse.json({
      totalAssessments,
      averageScore,
      skillLevelDistribution,
      focusAreaPerformance,
      recentTrend: trendData
    });
  } catch (error) {
    console.error("Error fetching skills stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills statistics" },
      { status: 500 }
    );
  }
}

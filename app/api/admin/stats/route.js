import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export const dynamic = "force-static";

export async function GET(req) {
  try {
    const { userId } = getAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Initialize empty data structure
    const defaultStats = {
      users: [],
      interviews: [],
      aptitudeTests: [],
      skillAssessments: [],
      overview: {
        totalUsers: 0,
        totalInterviews: 0,
        totalAptitudeTests: 0,
        totalAssessments: 0,
        passRate: 0,
        averageScore: 0,
        skillsAverageScore: 0
      }
    };

    try {
      // Fetch all required data with error handling for each query
      const users = await prisma.user.findMany({
        include: {
          interviews: true,
          aptitudeTests: true,
        },
      }).catch(() => []);

      const interviews = await prisma.interview.findMany().catch(() => []);
      const aptitudeTests = await prisma.aptitudeTest.findMany().catch(() => []);
      const skillAssessments = await prisma.skillAssessment.findMany({
        orderBy: { timestamp: 'desc' }
      }).catch(() => []);

      // Calculate overview statistics
      const totalUsers = users.length;
      const totalInterviews = interviews.length;
      const totalAptitudeTests = aptitudeTests.length;
      const totalAssessments = skillAssessments.length;

      // Calculate pass rates and average scores
      const passedInterviews = interviews.filter(i => i.score >= 70).length;
      const passedTests = aptitudeTests.filter(t => t.score >= 70).length;
      const totalAttempts = totalInterviews + totalAptitudeTests;
      
      const passRate = totalAttempts > 0
        ? Math.round(((passedInterviews + passedTests) / totalAttempts) * 100)
        : 0;

      const averageScore = totalAttempts > 0
        ? Math.round(
            ([...interviews, ...aptitudeTests]
              .reduce((acc, curr) => acc + (curr.score || 0), 0)) / totalAttempts
          )
        : 0;

      // Calculate skills assessment average score
      const skillsAverageScore = totalAssessments > 0
        ? Math.round(
            skillAssessments.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / totalAssessments
          )
        : 0;

      return NextResponse.json({
        users,
        interviews,
        aptitudeTests,
        skillAssessments,
        overview: {
          totalUsers,
          totalInterviews,
          totalAptitudeTests,
          totalAssessments,
          passRate,
          averageScore,
          skillsAverageScore
        }
      });
    } catch (error) {
      console.error("Error querying database:", error);
      return NextResponse.json(defaultStats);
    }
  } catch (error) {
    console.error("Error in admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
}

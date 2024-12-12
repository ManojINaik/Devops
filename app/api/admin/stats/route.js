import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs";

export async function GET(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user statistics
    const userStats = await prisma.user.count();
    const totalAssessments = await prisma.skillAssessment.count();

    // Fetch average score
    const averageScore = await prisma.skillAssessment.aggregate({
      _avg: {
        overallScore: true,
      },
    });

    // Fetch skills assessment results
    const skillsResults = await prisma.skillAssessment.findMany({
      select: {
        skillLevel: true,
        overallScore: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate average score
    const avgScore = averageScore._avg.overallScore || 0;

    return NextResponse.json({
      totalUsers: userStats,
      totalAssessments,
      averageScore: Math.round(avgScore),
      skillsResults,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
}

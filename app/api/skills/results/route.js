import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs";

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      focusAreas,
      skillLevel,
      overallScore,
      categoryScores,
      correctness
    } = await req.json();

    const result = await prisma.skillAssessment.create({
      data: {
        userId,
        focusAreas,
        skillLevel,
        overallScore,
        categoryScores,
        correctness,
        timestamp: new Date()
      }
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error saving assessment result:", error);
    return NextResponse.json(
      { error: "Failed to save assessment result" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await prisma.skillAssessment.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' }
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error fetching assessment results:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment results" },
      { status: 500 }
    );
  }
}

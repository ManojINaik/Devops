import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { answers, topic } = await req.json();

    // Here you would typically validate answers against correct answers
    // For demo, we'll simulate scoring with random correct answers
    const totalQuestions = Object.keys(answers).length;
    const correctAnswers = Math.floor(Math.random() * (totalQuestions + 1)); // Simulated scoring

    // Calculate score
    const score = {
      total: totalQuestions,
      correct: correctAnswers,
      percentage: Math.round((correctAnswers / totalQuestions) * 100)
    };

    // In a real application, you would save this score to a database
    // For now, we'll just return it
    return NextResponse.json({
      success: true,
      score,
      message: "Test submitted successfully"
    });

  } catch (error) {
    console.error("Error submitting test:", error);
    return NextResponse.json(
      { error: "Failed to submit test" },
      { status: 500 }
    );
  }
}

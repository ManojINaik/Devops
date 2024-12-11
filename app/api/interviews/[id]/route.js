import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Interview ID is required" },
        { status: 400 }
      );
    }

    const result = await db
      .select()
      .from(MockInterview)
      .where(
        or(
          eq(MockInterview.mockId, id),
          eq(MockInterview.id, isNaN(parseInt(id)) ? -1 : parseInt(id))
        )
      );

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: `Interview not found with ID: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching interview:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview" },
      { status: 500 }
    );
  }
}

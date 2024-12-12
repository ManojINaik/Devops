import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "glhf_18e74141e8dbbf0609d964a189fc33b0",
  baseURL: "https://glhf.chat/api/openai/v1",
});

export async function POST(req) {
  try {
    const { focusAreas, skillLevel } = await req.json();

    const systemPrompt = `You are an expert programming instructor. Generate a coding challenge that:
1. Focuses on: ${focusAreas.join(", ")}
2. Is suitable for ${skillLevel} level developers
3. Can be completed in 15-20 minutes
4. Includes clear requirements and example input/output
5. it should be able ti write in a single file `
;

    const completion = await client.chat.completions.create({
      model: "hf:mistralai/Mistral-7B-Instruct-v0.3",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate a coding challenge that meets these requirements. Format it with a clear description, requirements, and example input/output if applicable." }
      ],
      temperature: 0.7,
      stream: true,
    });

    let question = "";
    for await (const chunk of completion) {
      if (chunk.choices[0]?.delta?.content) {
        question += chunk.choices[0].delta.content;
      }
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Error generating question:", error);
    return NextResponse.json(
      { error: "Failed to generate question", details: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "glhf_18e74141e8dbbf0609d964a189fc33b0",
  baseURL: "https://glhf.chat/api/openai/v1",
});

export async function POST(req) {
  try {
    const { code, question, focusAreas, skillLevel } = await req.json();

    // Extract expected elements from the question
    const questionLines = question.split('\n');
    const requirements = questionLines
      .filter(line => line.trim().startsWith('*'))
      .join('\n');

    const systemPrompt = `You are an expert code reviewer. You need to evaluate a coding solution against specific requirements.

Original Question:
${question}

Key Requirements:
${requirements}

The submitted solution is:
\`\`\`
${code}
\`\`\`

Follow these strict evaluation rules:
1. First, check if the code EXACTLY matches the requirements. Any deviation should result in a failing score.
2. The solution must implement ALL required functions, classes, and features mentioned in the question.
3. The code must use the exact function names, parameters, and return types specified in the question.
4. If using required libraries (like argon2 in a password hashing question), verify they are properly imported and used.
5. Check if example input/output behavior matches the requirements.

Scoring Rules:
- If ANY requirement is not met, set all scores to 0 and correctness to false
- Only if ALL requirements are met:
  - Base score on code quality (0-100)
  - Consider proper error handling, variable naming, and best practices
  - Factor in security, performance, and maintainability

Provide your evaluation in this exact JSON format:
{
  "overallScore": <number 0-100>,
  "correctness": <true/false>,
  "categories": [
    {
      "name": "<focus area>",
      "score": <number 0-100>
    }
  ],
  "analysis": [
    {
      "type": "<success/warning/error>",
      "message": "<specific feedback about requirement compliance or violation>"
    }
  ]
}`;

    const completion = await client.chat.completions.create({
      model: "hf:mistralai/Mistral-7B-Instruct-v0.3",
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: "Evaluate the solution and provide the result in the specified JSON format. Be strict about requirements and scoring."
        }
      ],
      temperature: 0.2,
      stream: false,
    });

    let response;
    try {
      const responseText = completion.choices[0].message.content;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }
      response = JSON.parse(jsonMatch[0]);

      // Validate response structure
      if (typeof response.overallScore !== 'number' || 
          typeof response.correctness !== 'boolean' || 
          !Array.isArray(response.categories) || 
          !Array.isArray(response.analysis)) {
        throw new Error("Invalid response structure");
      }

      // Force scores to 0 if solution is incorrect
      if (response.correctness === false) {
        response.overallScore = 0;
        response.categories = response.categories.map(category => ({
          ...category,
          score: 0
        }));
      }

      // Validate score ranges
      if (response.overallScore < 0 || response.overallScore > 100) {
        throw new Error("Invalid overall score range");
      }
      response.categories.forEach(category => {
        if (category.score < 0 || category.score > 100) {
          throw new Error("Invalid category score range");
        }
      });
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, completion.choices[0].message.content);
      return NextResponse.json(
        { error: "Failed to parse assessment results", details: parseError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      result: {
        overallScore: response.overallScore,
        categories: response.categories
      },
      analysis: response.analysis
    });
  } catch (error) {
    console.error("Error assessing code:", error);
    return NextResponse.json(
      { error: "Failed to assess code", details: error.message },
      { status: 500 }
    );
  }
}

import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.GLHF_API_KEY,
  baseURL: "https://glhf.chat/api/openai/v1",
});

const getTopicPrompt = (topic) => {
  const prompts = {
    reasoning: "Generate logical reasoning questions that test analytical thinking, pattern recognition, and problem-solving abilities.",
    math: "Generate mathematical aptitude questions covering arithmetic, algebra, geometry, and data interpretation.",
    technical: "Generate technical questions covering programming concepts, data structures, algorithms, and software development principles.",
    verbal: "Generate verbal ability questions testing vocabulary, grammar, reading comprehension, and verbal reasoning.",
  };

  return prompts[topic] || "Generate general aptitude questions covering various topics.";
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get('topic');

    const completion = await openai.chat.completions.create({
      model: "hf:mistralai/Mistral-7B-Instruct-v0.3",
      messages: [
        {
          role: "system",
          content: `You are an aptitude test generator. Generate 10 multiple choice questions for a technical aptitude test.
            Each question should have 4 options and only one correct answer.
            Format the response as a JSON array of objects with the following structure:
            {
              id: string,
              question: string,
              options: string[],
              correctAnswer: string
            }
            ${getTopicPrompt(topic)}
            Make sure the questions are challenging but not too difficult.`
        },
        {
          role: "user",
          content: `Generate ${topic} aptitude test questions`
        }
      ],
      temperature: 0.7,
    });

    const questions = JSON.parse(completion.choices[0].message.content);

    // Store correct answers in session or database for later validation
    // For now, we'll remove correct answers from client response
    const clientQuestions = questions.map(({ correctAnswer, ...rest }) => rest);

    return NextResponse.json({ questions: clientQuestions });
  } catch (error) {
    console.error("Error generating questions:", error.response ? error.response.data : error.message);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}

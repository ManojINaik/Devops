const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-pro",
});

const generationConfig = {
  temperature: 0.3,
  topP: 0.1,
  topK: 16,
  maxOutputTokens: 2048,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
];

const systemPrompt = `You are an AI assistant that always responds in valid JSON format.

For interview questions, strictly use this format:
{
  "questions": [
    {
      "Question": "What is your experience with React hooks?",
      "Answer": "A good answer should demonstrate understanding of useState, useEffect, and other common hooks..."
    }
  ]
}

For feedback responses, strictly use this format:
{
  "rating": <number between 1-10>,
  "feedback": "detailed feedback text"
}

Rules:
1. Always respond with ONLY the JSON object
2. No additional text or formatting
3. No markdown code blocks
4. Ensure the JSON is properly formatted
5. For questions, each object MUST have both "Question" and "Answer" fields with non-empty strings
6. For feedback, rating must be a number between 1 and 10
7. All text fields must be non-empty strings`;

export const chatSession = model.startChat({
  generationConfig,
  safetySettings,
  history: [
    {
      role: "user",
      parts: [{ text: systemPrompt }],
    },
    {
      role: "model",
      parts: [{ text: '{"status":"ready"}' }],
    },
  ],
});
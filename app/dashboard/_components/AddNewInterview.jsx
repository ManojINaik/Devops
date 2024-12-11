"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAiModel";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";    
import moment from "moment";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AddNewInterview = () => {
  const [openDailog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();

      const InputPrompt = `Generate 5 technical interview questions for this position:
Position: ${jobPosition}
Description: ${jobDesc}
Experience: ${jobExperience} years

Requirements:
1. Each question must be technical and specific to the position
2. Each answer must be detailed and include key points to look for
3. Questions should match the experience level
4. Return ONLY a JSON object with exactly 5 questions
5. Each question must have both Question and Answer fields as non-empty strings

Example format:
{
  "questions": [
    {
      "Question": "What is your experience with [technology]?",
      "Answer": "A good answer should demonstrate..."
    }
  ]
}`;

      const result = await chatSession.sendMessage(InputPrompt);
      const response = result.response.text();
      
      // Clean and validate the response
      const cleanResponse = response
        .trim()
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .replace(/^json\s*/, '')
        .trim();

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanResponse);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        console.log("Raw response:", response);
        console.log("Cleaned response:", cleanResponse);
        throw new Error("Failed to parse AI response");
      }

      // Validate response structure
      if (!parsedResponse || typeof parsedResponse !== 'object') {
        throw new Error("Invalid response format: not an object");
      }

      if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
        throw new Error("Invalid response format: missing questions array");
      }

      if (parsedResponse.questions.length !== 5) {
        throw new Error("Invalid number of questions: expected 5 questions");
      }

      // Validate each question
      for (const [index, question] of parsedResponse.questions.entries()) {
        if (!question.Question || typeof question.Question !== 'string' || question.Question.trim().length === 0) {
          throw new Error(`Question ${index + 1}: missing or invalid Question field`);
        }
        if (!question.Answer || typeof question.Answer !== 'string' || question.Answer.trim().length === 0) {
          throw new Error(`Question ${index + 1}: missing or invalid Answer field`);
        }
      }

      const mockId = uuidv4();
      await db.insert(MockInterview).values({
        mockId: mockId,
        jsonMockResp: JSON.stringify(parsedResponse),
        jobPosition: jobPosition,
        jobDesc: jobDesc,
        jobExperience: jobExperience,
        createdBy: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("YYYY-MM-DD"),
      });

      toast.success("Interview created successfully!");
      setOpenDialog(false);
      router.push("/dashboard/interview/" + mockId);
    } catch (error) {
      console.error("Error creating interview:", error);
      toast.error(error.message || "Failed to create interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className="p-10 rounded-lg border bg-secondary hover:scale-105 hover:shadow-sm transition-all cursor-pointer"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="text-lg text-center">+ Add New</h2>
      </div>
      
      <Dialog open={openDailog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Tell us more about your job interviewing
            </DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
                <div className="my-3">
                  <h2>
                    Add Details about your job position, job description and
                    years of experience
                  </h2>

                  <div className="mt-7 my-3">
                    <label className="text-black">Job Role/job Position</label>
                    <Input
                      className="mt-1"
                      placeholder="Ex. Full stack Developer"
                      required
                      onChange={(e) => setJobPosition(e.target.value)}
                    />
                  </div>
                  <div className="my-5">
                    <label className="text-black">
                      Job Description/ Tech stack (In Short)
                    </label>
                    <Textarea
                      className="placeholder-opacity-50"
                      placeholder="Ex. React, Angular, Nodejs, Mysql, Nosql, Python"
                      required
                      onChange={(e) => setJobDesc(e.target.value)}
                    />
                  </div>
                  <div className="my-5">
                    <label className="text-black">Years of Experience</label>
                    <Input
                      className="mt-1"
                      placeholder="Ex. 5"
                      max="50"
                      type="number"
                      required
                      onChange={(e) => setJobExperience(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-5 justify-end">
                  <Button
                    type="button"
                    variant="goast"
                    onClick={() => setOpenDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin mr-2" />
                        Generating From AI
                      </>
                    ) : (
                      "Start Interview"
                    )}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;

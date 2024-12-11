'use client';

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import InterviewClient from "./_components/InterviewClient";
import { Loader2 } from "lucide-react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";

export default function StartInterview() {
  const params = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInterview() {
      if (!params?.interviewId) {
        setError("No interview ID provided");
        setLoading(false);
        return;
      }

      try {
        const result = await db
          .select()
          .from(MockInterview)
          .where(eq(MockInterview.mockId, params.interviewId));

        if (!result || result.length === 0) {
          throw new Error("Interview not found");
        }

        const interviewData = result[0];
        let questions = [];

        try {
          const parsedJson = JSON.parse(interviewData.jsonMockResp);
          if (parsedJson.questions && Array.isArray(parsedJson.questions)) {
            questions = parsedJson.questions;
          }
        } catch (e) {
          console.error("Error parsing questions:", e);
        }

        setInterview({
          ...interviewData,
          questions: questions
        });
      } catch (err) {
        console.error('Error loading interview:', err);
        setError(err.message || 'Failed to load interview');
      } finally {
        setLoading(false);
      }
    }

    loadInterview();
  }, [params?.interviewId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4">Loading interview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <div className="text-destructive mb-4">⚠️ {error}</div>
        <Link href="/dashboard">
          <Button variant="outline">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return <InterviewClient interview={interview} />;
}

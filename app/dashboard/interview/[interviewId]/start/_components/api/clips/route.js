import { NextResponse } from "next/server";

const D_ID_API_URL = "https://api.d-id.com/clips";
const D_ID_API_KEY = process.env.D_ID_API_KEY;

async function createClip({
  text,
  voiceId,
  bgColor,
  presenterId,
}) {
  const requestBody = {
    script: {
      type: "text",
      input: text,
      subtitles: false,
      provider: {
        type: "elevenlabs",
        voice_id: voiceId,
      },
    },
    config: {
      result_format: "mp4",
      fluent: true,
      driver_expressions: {
        expressions: [],
        transition_frames: 0,
      },
    },
    presenter_id: presenterId,
    background: {
      color: bgColor,
    },
  };

  const res = await fetch(D_ID_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${D_ID_API_KEY}`,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`D-ID API request failed: ${res.statusText}. ${errorText}`);
  }

  return res.json();
}

async function checkClipStatus(clipId) {
  const pollRes = await fetch(`${D_ID_API_URL}/${clipId}`, {
    headers: {
      Authorization: `Basic ${D_ID_API_KEY}`,
      accept: "application/json",
    },
  });

  if (!pollRes.ok) {
    throw new Error(`Failed to poll D-ID API: ${pollRes.statusText}`);
  }

  return pollRes.json();
}

async function pollClipStatus(clipId) {
  let attempts = 0;
  const maxAttempts = 30;
  const delayMs = 1000;

  while (attempts < maxAttempts) {
    const result = await checkClipStatus(clipId);

    if (result.status === "done") {
      return result;
    }

    if (result.status === "error") {
      throw new Error(`D-ID API error: ${result.error}`);
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
    attempts++;
  }

  throw new Error("Timeout waiting for D-ID clip to complete");
}

export async function POST(request) {
  if (!D_ID_API_KEY) {
    return NextResponse.json(
      { error: "D-ID API key is missing from .env" },
      { status: 500 }
    );
  }

  try {
    const { text, presenterId, voiceId, bgColor } = await request.json();
    const createResponse = await createClip({
      text,
      presenterId,
      voiceId,
      bgColor,
    });

    const result = await pollClipStatus(createResponse.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating D-ID clip:", error);
    return NextResponse.json(
      { error: "Failed to create D-ID clip" },
      { status: 500 }
    );
  }
}

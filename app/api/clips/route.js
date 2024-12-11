import { NextResponse } from "next/server";

const D_ID_API_URL = "https://api.d-id.com";
const PRESENTER_IMAGE = "https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.png";

async function pollTalkStatus(talkId, apiKey) {
  const maxAttempts = 30;
  const delayMs = 1000;

  for (let i = 0; i < maxAttempts; i++) {
    const statusResponse = await fetch(`${D_ID_API_URL}/talks/${talkId}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(apiKey).toString("base64")}`,
        "Content-Type": "application/json",
      },
    });

    if (!statusResponse.ok) {
      throw new Error(`Failed to check talk status: ${statusResponse.statusText}`);
    }

    const statusData = await statusResponse.json();
    console.log(`Poll attempt ${i + 1}:`, statusData);

    if (statusData.status === "done") {
      return statusData;
    } else if (statusData.status === "error") {
      throw new Error(`Talk creation failed: ${statusData.error}`);
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error("Timeout waiting for talk to complete");
}

export async function POST(request) {
  try {
    const { text } = await request.json();
    console.log("Received text:", text);

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.D_ID_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "D-ID API key not configured" },
        { status: 500 }
      );
    }

    // Create talk
    const createResponse = await fetch(`${D_ID_API_URL}/talks`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(apiKey).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        script: {
          type: "text",
          input: text,
          provider: {
            type: "microsoft",
            voice_id: "en-US-JennyNeural"
          }
        },
        config: {
          stitch: true,
        },
        source_url: PRESENTER_IMAGE
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error("D-ID API error:", errorData);
      return NextResponse.json(
        { error: `D-ID API request failed: ${createResponse.status} ${createResponse.statusText}. ${JSON.stringify(errorData)}` },
        { status: createResponse.status }
      );
    }

    const createData = await createResponse.json();
    console.log("Create talk response:", createData);

    // Poll for the result
    const result = await pollTalkStatus(createData.id, apiKey);
    
    if (!result.result_url) {
      return NextResponse.json(
        { error: "No result URL in the final response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ result_url: result.result_url });
  } catch (error) {
    console.error("Error in /api/clips:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

const DID_API_KEY = process.env.NEXT_PUBLIC_DID_API_KEY;
const DID_API_URL = "https://api.d-id.com";

export async function createAvatarResponse(text) {
  if (!DID_API_KEY) {
    console.warn("D-ID API key not found. Skipping avatar generation.");
    return {
      audio_url: null,
      result_url: "https://create-images-results.d-id.com/api_docs/presenters/Emma_f.jpeg",
      fallback: true
    };
  }

  try {
    // First create a talk
    const createResponse = await fetch(`${DID_API_URL}/talks`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${DID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        script: {
          type: "text",
          input: text,
          provider: {
            type: "microsoft",
            voice_id: "en-US-GuyNeural"
          }
        },
        config: {
          stitch: true,
        },
        source_url: "https://create-images-results.d-id.com/api_docs/presenters/Emma_f.jpeg"
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({ description: "Unknown error" }));
      console.warn("D-ID API Error:", errorData.description);
      return {
        audio_url: null,
        result_url: "https://create-images-results.d-id.com/api_docs/presenters/Emma_f.jpeg",
        error: errorData.description,
        fallback: true
      };
    }

    const createData = await createResponse.json();

    // Return a fallback response that won't cause null reference errors
    return {
      id: createData.id,
      audio_url: createData.audio_url || null,
      result_url: createData.result_url || "https://create-images-results.d-id.com/api_docs/presenters/Emma_f.jpeg",
      fallback: !createData.audio_url
    };
  } catch (error) {
    console.warn("Error creating avatar response:", error.message);
    return {
      audio_url: null,
      result_url: "https://create-images-results.d-id.com/api_docs/presenters/Emma_f.jpeg",
      error: error.message,
      fallback: true
    };
  }
}

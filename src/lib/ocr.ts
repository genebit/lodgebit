export async function callVisionAPI(imageBuffer: Buffer): Promise<string> {
  const base64 = imageBuffer.toString("base64");
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_VISION_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Vision API error: ${response.statusText}`);
  }

  const json = await response.json();
  return json.responses?.[0]?.fullTextAnnotation?.text ?? "";
}

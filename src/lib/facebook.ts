interface FacebookPostResult {
  success: boolean;
  id: string | null;
  error: string | null;
}

export async function postToFacebook(
  pageId: string,
  message: string,
  accessToken: string
): Promise<FacebookPostResult> {
  const url = `https://graph.facebook.com/v19.0/${pageId}/feed`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      access_token: accessToken,
    }),
  });

  const json = await response.json();
  return {
    success: !json.error,
    id: json.id ?? null,
    error: json.error?.message ?? null,
  };
}

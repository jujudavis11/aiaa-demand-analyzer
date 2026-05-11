const HEYGEN_BASE_URL = "https://api.heygen.com/v2";

const json = (res, status, payload) => res.status(status).json(payload);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { code: "METHOD_NOT_ALLOWED", message: "Only POST is supported." });
  }

  try {
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      return json(res, 500, { code: "MISSING_ENV", message: "Server is missing required env var: HEYGEN_API_KEY" });
    }

    const { script, title, cta, avatar_id, voice_id } = req.body || {};
    if (![script, title, cta, avatar_id, voice_id].every((v) => typeof v === "string" && v.trim())) {
      return json(res, 400, { code: "INVALID_INPUT", message: "script, title, cta, avatar_id, and voice_id are all required." });
    }

    const providerRes = await fetch(`${HEYGEN_BASE_URL}/video/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({
        title: title.trim(),
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: avatar_id.trim(),
            },
            voice: {
              type: "text",
              voice_id: voice_id.trim(),
              input_text: script.trim(),
            },
          },
        ],
        dimension: { width: 1280, height: 720 },
        callback_id: cta.trim(),
      }),
    });

    const providerData = await providerRes.json();

    if (!providerRes.ok) {
      return json(res, 502, {
        code: "HEYGEN_ERROR",
        message: providerData?.error?.message || providerData?.message || "HeyGen request failed.",
        providerStatus: providerRes.status,
      });
    }

    const jobId = providerData?.data?.video_id || providerData?.data?.id;
    if (!jobId) {
      return json(res, 502, { code: "HEYGEN_ERROR", message: "HeyGen did not return a video/job id." });
    }

    return json(res, 200, { job_id: jobId });
  } catch (error) {
    return json(res, 500, { code: "INTERNAL_ERROR", message: error?.message || "Unexpected server error." });
  }
}

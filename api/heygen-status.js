const HEYGEN_BASE_URL = "https://api.heygen.com/v2";

const json = (res, status, payload) => res.status(status).json(payload);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { code: "METHOD_NOT_ALLOWED", message: "Only GET is supported." });
  }

  try {
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      return json(res, 500, { code: "MISSING_ENV", message: "Server is missing required env var: HEYGEN_API_KEY" });
    }

    const jobId = String(req.query?.job_id || "").trim();
    if (!jobId) {
      return json(res, 400, { code: "INVALID_INPUT", message: "job_id is required." });
    }

    const providerRes = await fetch(`${HEYGEN_BASE_URL}/video_status.get?video_id=${encodeURIComponent(jobId)}`, {
      method: "GET",
      headers: { "X-Api-Key": apiKey },
    });

    const providerData = await providerRes.json();

    if (!providerRes.ok) {
      return json(res, 502, {
        code: "HEYGEN_ERROR",
        message: providerData?.error?.message || providerData?.message || "HeyGen status request failed.",
        providerStatus: providerRes.status,
      });
    }

    const status = providerData?.data?.status || providerData?.status || "unknown";
    const videoUrl = providerData?.data?.video_url || providerData?.data?.url || "";
    const message = providerData?.data?.error || providerData?.message || "";

    return json(res, 200, { status, video_url: videoUrl, message });
  } catch (error) {
    return json(res, 500, { code: "INTERNAL_ERROR", message: error?.message || "Unexpected server error." });
  }
}

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-3-5-sonnet-latest";

const json = (res, status, payload) => res.status(status).json(payload);

function isPdfBase64(base64) {
  if (!base64 || typeof base64 !== "string") return false;

  try {
    const buf = Buffer.from(base64, "base64");
    if (!buf.length) return false;
    return buf.slice(0, 4).toString() === "%PDF";
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { code: "METHOD_NOT_ALLOWED", message: "Only POST is supported." });
  }

  try {
    const { fileBase64, fileType, systemPrompt } = req.body || {};

    if (!fileBase64 || fileType !== "application/pdf" || !isPdfBase64(fileBase64)) {
      return json(res, 400, {
        code: "INVALID_PDF",
        message: "Invalid PDF upload. Please send a valid PDF demand letter."
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return json(res, 500, {
        code: "MISSING_ENV",
        message: "Server is missing required env var: ANTHROPIC_API_KEY"
      });
    }

    const providerRes = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1800,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: fileBase64
                }
              },
              {
                type: "text",
                text: "Analyze this demand letter and return JSON exactly as instructed."
              }
            ]
          }
        ]
      })
    });

    const providerData = await providerRes.json();

    if (!providerRes.ok) {
      return json(res, 502, {
        code: "AI_PROVIDER_ERROR",
        message: providerData?.error?.message || "AI provider request failed.",
        providerStatus: providerRes.status
      });
    }

    const resultText = providerData?.content?.find((block) => block.type === "text")?.text;

    if (!resultText) {
      return json(res, 502, {
        code: "AI_PROVIDER_ERROR",
        message: "AI provider returned no text result."
      });
    }

    return json(res, 200, {
      resultText,
      model: providerData?.model || ANTHROPIC_MODEL
    });
  } catch (error) {
    return json(res, 500, {
      code: "INTERNAL_ERROR",
      message: error?.message || "Unexpected server error."
    });
  }
}

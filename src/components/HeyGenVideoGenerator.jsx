import { useState } from "react";

const initialForm = {
  script: "",
  title: "",
  cta: "",
  avatar_id: "",
  voice_id: "",
};

export default function HeyGenVideoGenerator() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const pollStatus = async (jobId, timeoutMs = 180000) => {
    const started = Date.now();

    while (Date.now() - started < timeoutMs) {
      const res = await fetch(`/api/heygen-status?job_id=${encodeURIComponent(jobId)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Status check failed.");
      }

      const s = String(data?.status || "").toLowerCase();
      setStatus(`Video status: ${s || "unknown"}`);

      if (s === "completed") return data;
      if (s === "failed") throw new Error(data?.message || "HeyGen generation failed.");

      await new Promise((r) => setTimeout(r, 4000));
    }

    throw new Error("Video generation timed out. Please try again.");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");
    setVideoUrl("");

    if (!form.script.trim() || !form.title.trim() || !form.cta.trim() || !form.avatar_id.trim() || !form.voice_id.trim()) {
      setError("All fields are required.");
      return;
    }

    setSubmitting(true);
    try {
      setStatus("Submitting video request...");
      const res = await fetch("/api/heygen-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to start HeyGen generation.");
      }

      const jobId = data?.job_id;
      if (!jobId) throw new Error("Missing HeyGen job id from backend response.");

      setStatus("Video request submitted. Waiting for completion...");
      const finalData = await pollStatus(jobId);
      const finalUrl = finalData?.video_url || "";

      if (!finalUrl) {
        throw new Error("Video completed but no video URL was returned.");
      }

      setVideoUrl(finalUrl);
      setStatus("Video complete.");
    } catch (err) {
      setError(err?.message || "Unexpected error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 820, margin: "40px auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: 12 }}>HeyGen Video Generator</h1>
      <p style={{ marginBottom: 20, color: "#555" }}>Create a video from script + avatar/voice, then poll until it is ready.</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Script
          <textarea name="script" value={form.script} onChange={onChange} rows={6} style={{ width: "100%" }} />
        </label>
        <label>
          Title
          <input name="title" value={form.title} onChange={onChange} style={{ width: "100%" }} />
        </label>
        <label>
          CTA
          <input name="cta" value={form.cta} onChange={onChange} style={{ width: "100%" }} />
        </label>
        <label>
          Avatar ID
          <input name="avatar_id" value={form.avatar_id} onChange={onChange} style={{ width: "100%" }} />
        </label>
        <label>
          Voice ID
          <input name="voice_id" value={form.voice_id} onChange={onChange} style={{ width: "100%" }} />
        </label>

        <button type="submit" disabled={submitting} style={{ padding: "10px 16px", cursor: submitting ? "not-allowed" : "pointer" }}>
          {submitting ? "Generating..." : "Generate Video"}
        </button>
      </form>

      {status && <p style={{ marginTop: 16 }}>ℹ️ {status}</p>}
      {error && <p style={{ marginTop: 16, color: "#b00020" }}>⚠️ {error}</p>}

      {videoUrl && (
        <div style={{ marginTop: 20 }}>
          <p>
            Final video URL: <a href={videoUrl} target="_blank" rel="noreferrer">{videoUrl}</a>
          </p>
          <video controls src={videoUrl} style={{ width: "100%", maxWidth: 640 }} />
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const defaultEvidence = [
  { platform: 'ChatGPT', prompt: '', response: '' },
  { platform: 'Perplexity', prompt: '', response: '' },
  { platform: 'Gemini', prompt: '', response: '' },
  { platform: 'Google', prompt: '', response: '' }
];

export default function InputForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ businessName: '', websiteUrl: '', city: '', state: '', industry: '', mainKeyword: '', contactEmail: '' });
  const [evidenceEntries, setEvidenceEntries] = useState(defaultEvidence);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form, evidenceEntries };
    const res = await fetch('/api/generate-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    localStorage.setItem('aaa-report', JSON.stringify(data));
    router.push('/report');
  };

  return <form onSubmit={onSubmit} className="space-y-6"><div className="grid md:grid-cols-2 gap-4">{Object.keys(form).map((k) => <input key={k} required={k !== 'contactEmail'} placeholder={k.replace(/([A-Z])/g, ' $1')} value={(form as Record<string, string>)[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} className="rounded-lg bg-slate-900 border border-slate-700 p-3" />)}</div><div className="space-y-3"><h3 className="text-lg font-semibold">Manual Evidence Inputs</h3><p className="text-silver text-sm">Paste responses from ChatGPT, Perplexity, Gemini, and Google. The report will use this evidence directly (no simulated data if provided).</p>{evidenceEntries.map((entry, i) => <div key={entry.platform} className="rounded-xl border border-slate-700 p-3 space-y-2"><p className="font-semibold">{entry.platform}</p><input placeholder="Prompt used (optional but recommended)" value={entry.prompt} onChange={(e) => setEvidenceEntries((prev) => prev.map((it, idx) => idx === i ? { ...it, prompt: e.target.value } : it))} className="w-full rounded bg-slate-900 border border-slate-700 p-2"/><textarea placeholder={`Paste ${entry.platform} result here`} value={entry.response} onChange={(e) => setEvidenceEntries((prev) => prev.map((it, idx) => idx === i ? { ...it, response: e.target.value } : it))} className="w-full min-h-28 rounded bg-slate-900 border border-slate-700 p-2"/></div>)}</div><button className="w-full rounded-lg bg-fire px-5 py-3 font-semibold">{loading ? 'Running Snapshot...' : 'Run Snapshot'}</button></form>;
}

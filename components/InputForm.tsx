'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InputForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ businessName: '', websiteUrl: '', city: '', state: '', industry: '', mainKeyword: '', competitors: '', contactEmail: '' });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/generate-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    localStorage.setItem('aaa-report', JSON.stringify(data));
    router.push('/report');
  };

  return <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4">{Object.keys(form).map((k) => <input key={k} required={!['competitors','contactEmail'].includes(k)} placeholder={k.replace(/([A-Z])/g, ' $1')} value={(form as any)[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} className="rounded-lg bg-slate-900 border border-slate-700 p-3" />)}<button className="md:col-span-2 rounded-lg bg-fire px-5 py-3 font-semibold">{loading ? 'Running Snapshot...' : 'Run Snapshot'}</button></form>;
}

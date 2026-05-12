'use client';
import { useEffect, useState } from 'react';
import ScoreCard from '@/components/ScoreCard';
import ReportSection from '@/components/ReportSection';
import CompetitorTable from '@/components/CompetitorTable';
import ActionPlan from '@/components/ActionPlan';

export default function ReportPage() {
  const [report, setReport] = useState<any>(null);
  useEffect(() => { const raw = localStorage.getItem('aaa-report'); if (raw) setReport(JSON.parse(raw)); }, []);
  if (!report) return <p>Loading report...</p>;
  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'aaa-visibility-snapshot.json'; a.click();
  };
  return <div className="space-y-5"><div className="no-print flex gap-3 justify-end"><button onClick={() => window.print()} className="px-4 py-2 bg-electric rounded">Download Report</button><button onClick={downloadJson} className="px-4 py-2 bg-slate-700 rounded">Save JSON</button><button onClick={() => navigator.clipboard.writeText(report.summary)} className="px-4 py-2 bg-slate-700 rounded">Copy Summary</button></div><ScoreCard score={report.score} label={report.label} /><ReportSection title="Executive Summary"><p>{report.summary}</p></ReportSection><ReportSection title="Category Breakdown"><div className="grid md:grid-cols-3 gap-3">{Object.entries(report.categoryScores).map(([k,v]: any) => <div key={k} className="rounded-xl border border-slate-700 p-3"><p className="text-silver text-sm">{k}</p><p className="text-2xl font-bold">{String(v)}</p></div>)}</div></ReportSection><ReportSection title="Competitor Mentions"><CompetitorTable rows={report.competitorTable} /></ReportSection><ReportSection title="Strengths & Weaknesses"><div className="grid md:grid-cols-2 gap-4"><div><h4 className="text-fire font-semibold">Strengths</h4><ul className="list-disc pl-5">{report.strengths.map((s: string) => <li key={s}>{s}</li>)}</ul></div><div><h4 className="text-fire font-semibold">Weaknesses</h4><ul className="list-disc pl-5">{report.weaknesses.map((s: string) => <li key={s}>{s}</li>)}</ul></div></div></ReportSection><ReportSection title="Missed Opportunity Summary"><ul className="list-disc pl-6">{report.missedOpportunities.map((m: string) => <li key={m}>{m}</li>)}</ul></ReportSection><ReportSection title="90-Day AI Visibility Action Plan"><ActionPlan plan={report.actionPlan} /></ReportSection><ReportSection title="Book your AI Visibility Strategy Call"><p>{report.cta}</p><a href="https://calendly.com" className="inline-block mt-3 bg-fire px-4 py-2 rounded">Book Strategy Call</a></ReportSection></div>;
}

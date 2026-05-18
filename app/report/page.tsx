'use client';
import { useEffect, useMemo, useState } from 'react';
import ScoreCard from '@/components/ScoreCard';
import ReportSection from '@/components/ReportSection';
import CompetitorTable from '@/components/CompetitorTable';
import ActionPlan from '@/components/ActionPlan';

export default function ReportPage() {
  const [report, setReport] = useState<any>(null);
  const [approvedCompetitors, setApprovedCompetitors] = useState<any[]>([]);
  const [manualCompetitor, setManualCompetitor] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('aaa-report');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    setReport(parsed);
    setApprovedCompetitors(parsed.competitorDiscoveries || []);
  }, []);

  const lowConfidenceCount = useMemo(() => approvedCompetitors.filter((c) => c.confidenceScore < 60).length, [approvedCompetitors]);
  const platformRows = useMemo(() => {
    const map = new Map<string, { mentioned: boolean; notMentioned: boolean }>();
    report?.queryResults?.forEach((q: any) => {
      const cur = map.get(q.source) || { mentioned: false, notMentioned: false };
      if (q.businessMentioned) cur.mentioned = true; else cur.notMentioned = true;
      map.set(q.source, cur);
    });
    return Array.from(map.entries());
  }, [report]);
  if (!report) return <p>Loading report...</p>;

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify({ ...report, approvedCompetitors }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'aaa-visibility-snapshot.json';
    a.click();
  };

  return <div className="space-y-5"><div className="no-print flex gap-3 justify-end"><button onClick={() => window.print()} className="px-4 py-2 bg-electric rounded">Download Report</button><button onClick={downloadJson} className="px-4 py-2 bg-slate-700 rounded">Save JSON</button><button onClick={() => navigator.clipboard.writeText(report.summary)} className="px-4 py-2 bg-slate-700 rounded">Copy Summary</button></div><ScoreCard score={report.score} label={report.label} /><ReportSection title="Executive Summary"><p>{report.summary}</p></ReportSection><ReportSection title="Data Source Status"><div className="flex items-center gap-3"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${report.dataMode === 'live' ? 'bg-emerald-700' : 'bg-amber-700'}`}>{report.dataMode === 'manual' ? 'Manual Evidence Mode' : report.dataMode === 'live' ? 'Live Mode: Perplexity data used' : 'Demo Mode: Simulated data used'}</span><p className="font-semibold text-fire">{report.dataSourceStatus}</p></div></ReportSection><ReportSection title="Evidence Source Status"><ul className="list-disc pl-6">{[...new Set(report.queryResults.map((q: any) => q.source))].map((source: string) => <li key={source}>{source}</li>)}</ul></ReportSection><ReportSection title="Platform Mention Check"><div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left text-silver"><th>Platform</th><th>Target Mentioned</th><th>Target Not Mentioned</th></tr></thead><tbody>{platformRows.map(([platform, status]: any) => <tr key={platform} className="border-t border-slate-700"><td className="py-2">{platform}</td><td>{status.mentioned ? "Yes" : "No"}</td><td>{status.notMentioned ? "Yes" : "No"}</td></tr>)}</tbody></table></div></ReportSection><ReportSection title="Category Breakdown"><div className="grid md:grid-cols-3 gap-3">{Object.entries(report.categoryScores).map(([k, v]: any) => <div key={k} className="rounded-xl border border-slate-700 p-3"><p className="text-silver text-sm">{k}</p><p className="text-2xl font-bold">{String(v)}</p></div>)}</div></ReportSection><ReportSection title="Suggested Competitors"><p className="mb-3 text-silver">Competitors were discovered automatically based on AI/search-style queries for your market. Suggestions prioritize geography, service-category match, local query relevance, keyword overlap, and directory consistency.</p><p className="mb-3 text-xs text-amber-300">Uncertainty notice: {lowConfidenceCount} suggestion(s) have confidence below 60% and should be reviewed manually.</p><CompetitorTable rows={approvedCompetitors.map((c: any) => ({ name: c.name, mentionRate: `${Math.round((c.mentions / Math.max(1, report.queryResults.length)) * 100)}%`, avgPosition: c.estimatedRank, sentiment: c.estimatedRank < 3 ? 'Positive' : 'Neutral', confidenceScore: c.confidenceScore }))} /></ReportSection><ReportSection title="Competitor Review & Approval"><div className="space-y-3">{approvedCompetitors.map((c: any) => <div key={c.name} className="rounded-lg border border-slate-700 p-3"><div className="flex justify-between gap-3"><div><p className="font-semibold">{c.name}</p><p className="text-sm text-silver">Confidence: {c.confidenceScore}% • Rank: {c.estimatedRank} • Mentions: {c.mentions}</p><p className="text-xs text-silver">Signals: {c.confidenceReasons.join(' · ')}</p></div><button onClick={() => setApprovedCompetitors((prev) => prev.filter((x) => x.name !== c.name))} className="px-3 py-1 rounded bg-slate-800 border border-slate-600">Remove</button></div></div>)}</div><div className="mt-3 flex gap-2"><input value={manualCompetitor} onChange={(e) => setManualCompetitor(e.target.value)} placeholder="Add competitor manually" className="flex-1 rounded bg-slate-900 border border-slate-700 p-2"/><button onClick={() => { if (!manualCompetitor.trim()) return; setApprovedCompetitors((prev) => [...prev, { name: manualCompetitor.trim(), mentions: 1, estimatedRank: 5, appearedInQueries: [], targetBusinessAppeared: false, confidenceScore: 50, confidenceReasons: ['Manually added by reviewer'], locationMatch: false, serviceMatch: false, websiteKeywordOverlap: 0, directoryConsistency: 0 }]); setManualCompetitor(''); }} className="px-3 py-2 rounded bg-fire">Add</button></div></ReportSection><ReportSection title="Strengths & Weaknesses"><div className="grid md:grid-cols-2 gap-4"><div><h4 className="text-fire font-semibold">Strengths</h4><ul className="list-disc pl-5">{report.strengths.map((s: string) => <li key={s}>{s}</li>)}</ul></div><div><h4 className="text-fire font-semibold">Weaknesses</h4><ul className="list-disc pl-5">{report.weaknesses.map((s: string) => <li key={s}>{s}</li>)}</ul></div></div></ReportSection><ReportSection title="Missed Opportunity Summary"><ul className="list-disc pl-6">{report.missedOpportunities.map((m: string) => <li key={m}>{m}</li>)}</ul></ReportSection><ReportSection title="90-Day AI Visibility Action Plan"><ActionPlan plan={report.actionPlan} /></ReportSection><ReportSection title="Book your AI Visibility Strategy Call"><p>{report.cta}</p><a href="https://calendly.com" className="inline-block mt-3 bg-fire px-4 py-2 rounded">Book Strategy Call</a></ReportSection><p className="text-xs text-silver border-t border-slate-700 pt-4">Disclaimer: AI/search visibility findings can vary by platform, location, prompt phrasing, and time.</p></div>;
}

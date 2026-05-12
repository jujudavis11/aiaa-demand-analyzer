type Props = { score: number; label: string };

export default function ScoreCard({ score, label }: Props) {
  const deg = Math.round((score / 100) * 360);
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#1f1140] to-[#0f172a] p-6 border border-slate-700">
      <h2 className="text-xl font-semibold">Overall AI Visibility Score</h2>
      <div className="mt-4 flex items-center gap-6">
        <div className="h-36 w-36 rounded-full" style={{ background: `conic-gradient(#7C3AED ${deg}deg, #334155 0deg)` }}>
          <div className="m-3 h-[120px] w-[120px] rounded-full bg-charcoal flex items-center justify-center text-3xl font-bold">{score}</div>
        </div>
        <div><p className="text-fire text-lg font-semibold">{label}</p><p className="text-silver">See how AI answers about your business before your competitors do.</p></div>
      </div>
    </div>
  );
}

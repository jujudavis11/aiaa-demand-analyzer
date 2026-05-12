export default function CompetitorTable({ rows }: { rows: Array<{ name: string; mentionRate: string; avgPosition: number; sentiment: string }> }) {
  return <div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left text-silver"><th>Name</th><th>Mention Rate</th><th>Avg Position</th><th>Sentiment</th></tr></thead><tbody>{rows.map((r) => <tr key={r.name} className="border-t border-slate-700"><td className="py-2">{r.name}</td><td>{r.mentionRate}</td><td>{r.avgPosition}</td><td>{r.sentiment}</td></tr>)}</tbody></table></div>;
}

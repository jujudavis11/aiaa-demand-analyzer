export default function ActionPlan({ plan }: { plan: Array<{ phase: string; actions: string[] }> }) {
  return <div className="grid md:grid-cols-3 gap-4">{plan.map((p) => <div className="rounded-xl border border-slate-700 p-4" key={p.phase}><h4 className="font-semibold text-fire">{p.phase}</h4><ul className="list-disc pl-5 mt-2 space-y-1 text-slate-200">{p.actions.map((a) => <li key={a}>{a}</li>)}</ul></div>)}</div>;
}

export default function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5"><h3 className="text-lg font-semibold text-electric mb-3">{title}</h3>{children}</section>;
}

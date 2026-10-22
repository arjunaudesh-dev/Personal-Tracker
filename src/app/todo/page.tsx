export default function TodoPage() {
  return <section className="flex min-w-0 flex-col gap-3">
    <div className="flex items-center justify-between"><h1 className="text-xl font-semibold">To Do Space <span className="text-sm text-slate-400">/ Orbit</span></h1><a href="/orbit/index.html" target="_blank" rel="noreferrer" className="btn-ghost">Open full window ↗</a></div>
    <iframe title="Orbit To Do Space — universes and mind maps" src="/orbit/index.html" className="h-[calc(100dvh-110px)] min-h-[600px] w-full rounded-2xl border border-white/10" />
  </section>;
}

export default function Home() {
  return (
    <div className="min-h-dvh relative overflow-hidden grid place-items-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_200px_at_50%_-50px,rgba(59,130,246,0.25),transparent),radial-gradient(400px_200px_at_90%_0,rgba(236,72,153,0.18),transparent)]" />
      <div className="z-10 fade-in text-center px-6">
        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">To Do Web App</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">Organize your tasks effortlessly and stay on top of what matters with a clean, clutter-free workflow.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <a className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-blue-700" href="/signin">Sign In</a>
          <a className="rounded-md border border-white/20 px-4 py-2 text-sm text-white/90 transition hover:-translate-y-0.5 hover:bg-white/10" href="/signup">Sign Up</a>
        </div>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80 shadow-sm backdrop-blur">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          By: Group 8
        </div>
      </div>
    </div>
  );
}



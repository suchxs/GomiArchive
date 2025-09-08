import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signIn } from "../lib/todos";
import { saveSession } from "../lib/session";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn(email, password);
      if (res.status === 200) {
        saveSession({ id: res.data.id, fname: res.data.fname, lname: res.data.lname, email: res.data.email });
        navigate("/dashboard");
      } else {
        setError(res.message ?? "Sign in failed");
      }
    } catch {
      setError("Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_200px_at_50%_-50px,rgba(59,130,246,0.15),transparent)]" />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/90 p-6 shadow-xl backdrop-blur-md md:max-w-md dark:bg-white/10">
        <h1 className="mb-6 text-xl font-semibold tracking-tight">Welcome back</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none ring-1 ring-transparent focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none ring-1 ring-transparent focus:ring-blue-500"
              placeholder="••••••"
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-black/70 dark:text-white/70">
          Don&apos;t have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}



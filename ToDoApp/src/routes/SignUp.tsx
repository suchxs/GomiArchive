import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUp } from "../lib/todos";

export default function SignUp() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await signUp({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        confirm_password: confirmPassword,
      });
      console.log("signup response", res);
      if (res.status === 200) {
        setSuccess(res.message);
        setTimeout(() => navigate("/signin"), 800);
      } else {
        setError(res.message || "Sign up failed");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("signup error", err);
      setError(err instanceof Error ? err.message : "Sign up failed. Check your network or try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_200px_at_50%_-50px,rgba(59,130,246,0.15),transparent)]" />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/90 p-6 shadow-xl backdrop-blur-md md:max-w-md dark:bg-white/10">
        <h1 className="mb-6 text-xl font-semibold tracking-tight">Create your account</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none ring-1 ring-transparent focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none ring-1 ring-transparent focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none ring-1 ring-transparent focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none ring-1 ring-transparent focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none ring-1 ring-transparent focus:ring-blue-500"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-black/70 dark:text-white/70">
          Already have an account? <Link to="/signin" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}



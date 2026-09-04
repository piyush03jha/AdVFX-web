"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { loginAdmin } from "@/lib/admin-api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = await loginAdmin(email, password);
      window.localStorage.setItem("admin_access_token", session.accessToken);
      window.localStorage.setItem("admin_user", JSON.stringify(session.user));
      router.replace("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-foreground">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.02] p-7 shadow-[0_25px_70px_rgba(0,0,0,0.3)] sm:p-9">
        <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Administration</p>
        <h1 className="mt-2 font-serif text-3xl tracking-[-0.03em]">Sign in</h1>
        <p className="mt-2 text-sm text-muted">Access product and store management.</p>

        <label className="mt-7 block text-xs text-muted">
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="username"
            required
            className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-foreground outline-none focus:border-primary/60"
          />
        </label>

        <label className="mt-4 block text-xs text-muted">
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-foreground outline-none focus:border-primary/60"
          />
        </label>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}

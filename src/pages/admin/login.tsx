import type { GetServerSideProps } from "next";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const token = ctx.req.cookies?.rivera_admin_token;
  if (token && verifyToken(token)) {
    return { redirect: { destination: "/admin", permanent: false } };
  }
  return { props: {} };
};

import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json() as { error?: string };
      setError(data.error ?? "Error de autenticación");
    }
  }

  return (
    <>
      <Head><title>Admin — Comercializadora Rivera</title></Head>
      <div className="min-h-screen flex items-center justify-center bg-[hsl(0,0%,95%)]">
        <div className="w-full max-w-sm bg-white border border-[hsl(0,0%,88%)] rounded-lg p-8 shadow-sm">
          <div className="mb-8 text-center">
            <p className="text-xs tracking-[0.25em] text-[hsl(0,0%,50%)] uppercase font-bold mb-1">
              Panel de administración
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[hsl(0,0%,13%)]">
              Comercializadora <span className="text-[hsl(20,60%,45%)]">Rivera</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[hsl(0,0%,40%)] uppercase mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)]"
                placeholder="admin@comercializadorarivera.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[hsl(0,0%,40%)] uppercase mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)]"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[hsl(20,60%,45%)] text-white py-2.5 text-sm font-bold tracking-wider rounded hover:bg-[hsl(20,60%,38%)] transition-colors disabled:opacity-50"
            >
              {loading ? "Entrando..." : "ENTRAR"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setError(error.message || "Invalid email or password.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (error) {
        setError(error.message || "Google login failed.");
      }
    } catch {
      setError("Unable to connect with Google.");
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-4 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-[#E8E8E2] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl text-[#244C3A]">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to continue your BookNook journey.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full rounded-lg border p-3 outline-none focus:border-[#244C3A]"
          />

          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border p-3 outline-none focus:border-[#244C3A]"
          />

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-[#244C3A] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-lg bg-[#244C3A] p-3 font-medium text-white disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-[#244C3A]">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}

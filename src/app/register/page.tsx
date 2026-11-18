"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
        image: photoURL || undefined,
      });

      if (error) {
        setError(error.message || "Registration failed.");
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-4 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-[#E8E8E2] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl text-[#244C3A]">Join BookNook</h1>
          <p className="mt-2 text-sm text-gray-500">
            Create your account and start exploring books.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full rounded-lg border p-3 outline-none focus:border-[#244C3A]"
          />

          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full rounded-lg border p-3 outline-none focus:border-[#244C3A]"
          />

          <input
            type="url"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            placeholder="Profile Photo URL (Optional)"
            className="w-full rounded-lg border p-3 outline-none focus:border-[#244C3A]"
          />

          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (Minimum 6 characters)"
            className="w-full rounded-lg border p-3 outline-none focus:border-[#244C3A]"
          />

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-lg bg-[#244C3A] p-3 font-medium text-white disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#244C3A]">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}

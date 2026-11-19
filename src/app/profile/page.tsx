"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
  UserRound,
  Mail,
  CalendarDays,
  ShieldCheck,
  BookOpen,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

  if (isPending || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#244C3A]" />
          <p className="text-sm text-[#777F79]">Loading your profile...</p>
        </div>
      </main>
    );
  }

  const initials =
    user.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not available";

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#777F79] hover:text-[#244C3A]"
        >
          <ArrowLeft size={17} />
          Back to Home
        </Link>

        {/* Page Heading */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8BA995]">
            My Account
          </p>

          <h1 className="mt-3 font-serif text-4xl text-[#244C3A]">
            My Profile
          </h1>

          <p className="mt-3 text-sm text-[#777F79]">
            View your personal account information.
          </p>
        </div>

        {/* Profile Card */}
        <section className="overflow-hidden rounded-3xl border border-[#E8E8E2] bg-white shadow-sm">
          <div className="h-36 bg-[#244C3A]" />

          <div className="px-6 pb-8 md:px-10">
            {/* Avatar */}
            <div className="-mt-16 flex flex-col items-start gap-5 sm:flex-row sm:items-end">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "Profile"}
                  className="h-32 w-32 rounded-2xl border-4 border-white bg-white object-cover shadow-md"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-2xl border-4 border-white bg-[#EAF0EB] text-4xl font-semibold text-[#244C3A] shadow-md">
                  {initials}
                </div>
              )}

              <div className="pb-2">
                <h2 className="font-serif text-3xl text-[#244C3A]">
                  {user.name || "BookNook User"}
                </h2>

                <p className="mt-1 text-sm text-[#777F79]">{user.email}</p>
              </div>
            </div>

            {/* Account Information */}
            <div className="mt-10">
              <h3 className="mb-5 font-serif text-2xl text-[#244C3A]">
                Account Information
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#E8E8E2] bg-[#FAF9F6] p-5">
                  <div className="flex items-center gap-3 text-[#8BA995]">
                    <UserRound size={19} />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Full Name
                    </span>
                  </div>

                  <p className="mt-3 font-medium text-[#244C3A]">
                    {user.name || "Not available"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#E8E8E2] bg-[#FAF9F6] p-5">
                  <div className="flex items-center gap-3 text-[#8BA995]">
                    <Mail size={19} />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Email Address
                    </span>
                  </div>

                  <p className="mt-3 break-all font-medium text-[#244C3A]">
                    {user.email}
                  </p>
                </div>

                <div className="rounded-xl border border-[#E8E8E2] bg-[#FAF9F6] p-5">
                  <div className="flex items-center gap-3 text-[#8BA995]">
                    <CalendarDays size={19} />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Member Since
                    </span>
                  </div>

                  <p className="mt-3 font-medium text-[#244C3A]">
                    {joinedDate}
                  </p>
                </div>

                <div className="rounded-xl border border-[#E8E8E2] bg-[#FAF9F6] p-5">
                  <div className="flex items-center gap-3 text-[#8BA995]">
                    <ShieldCheck size={19} />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Email Verification
                    </span>
                  </div>

                  <p className="mt-3 font-medium text-[#244C3A]">
                    {user.emailVerified ? "Verified" : "Not Verified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-10">
              <h3 className="mb-5 font-serif text-2xl text-[#244C3A]">
                Your Library
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  href="/my-books"
                  className="flex items-center justify-between rounded-xl border border-[#E8E8E2] p-5 transition hover:border-[#244C3A] hover:bg-[#FAF9F6]"
                >
                  <span className="flex items-center gap-3 text-sm font-medium text-[#244C3A]">
                    <BookOpen size={20} />
                    My Books
                  </span>
                  <span className="text-[#8BA995]">→</span>
                </Link>

                <Link
                  href="/my-borrows"
                  className="flex items-center justify-between rounded-xl border border-[#E8E8E2] p-5 transition hover:border-[#244C3A] hover:bg-[#FAF9F6]"
                >
                  <span className="flex items-center gap-3 text-sm font-medium text-[#244C3A]">
                    <BookOpen size={20} />
                    My Borrows
                  </span>
                  <span className="text-[#8BA995]">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

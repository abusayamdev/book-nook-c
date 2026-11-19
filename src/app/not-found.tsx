import Link from "next/link";
import { BookOpen, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#FAF9F6] px-5 py-20">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#EAF0EB] text-[#244C3A]">
          <BookOpen size={40} />
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-[#C5A46D]">
          Page Not Found
        </p>

        <h1 className="mt-4 font-serif text-7xl font-bold text-[#244C3A]">
          404
        </h1>

        <h2 className="mt-5 text-2xl font-semibold text-[#252A27]">
          This page is missing from our bookshelf.
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#777F79]">
          Sorry, we couldn't find the page you're looking for. It may have been
          moved or no longer exists.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#244C3A] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#19392B]"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>

          <Link
            href="/books"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8E8E2] bg-white px-6 py-3.5 text-sm font-semibold text-[#244C3A] transition hover:bg-[#EAF0EB]"
          >
            <Search size={17} />
            Explore Books
          </Link>
        </div>
      </div>
    </main>
  );
}

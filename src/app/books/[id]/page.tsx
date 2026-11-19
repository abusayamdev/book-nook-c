import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import BorrowButton from "@/components/books/borrow-button";
import {
  ArrowLeft,
  BookOpen,
  UserRound,
  CalendarDays,
  Library,
  Package,
  CheckCircle2,
} from "lucide-react";

type Book = {
  _id?: string;
  id?: string;
  title: string;
  author: string;
  category: string;
  imageUrl?: string;
  description?: string;
  totalCopies: number;
  availableCopies: number;
  addedBy?: {
    name?: string;
    email?: string;
  };
  createdAt?: string;
};

type BookResponse = {
  success: boolean;
  data: Book;
};

type Props = {
  params: Promise<{ id: string }>;
};

const API_URL = process.env.BACKEND_API_URL || "http://localhost:5000";

// Fetch Book from Express Backend
async function getBook(id: string): Promise<Book | null> {
  try {
    const response = await fetch(
      `${API_URL}/api/books/${encodeURIComponent(id)}`,
      {
        cache: "no-store",
      },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Book API returned ${response.status}`);
    }

    const result: BookResponse = await response.json();

    return result.data || null;
  } catch (error) {
    console.error("Book details error:", error);
    throw error;
  }
}

// Format Date
function formatDate(dateValue?: string): string {
  if (!dateValue) {
    return "Not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Loading Skeleton
function BookDetailsSkeleton() {
  return (
    <main className="min-h-screen animate-pulse bg-[#FAF9F6] px-5 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="h-5 w-40 rounded bg-gray-200" />

        <div className="grid gap-8 md:grid-cols-[300px_1fr]">
          <div className="h-[380px] rounded-2xl bg-gray-200" />

          <div className="space-y-5">
            <div className="h-8 w-32 rounded bg-gray-200" />
            <div className="h-12 w-3/4 rounded bg-gray-200" />
            <div className="h-24 rounded bg-gray-200" />
            <div className="h-14 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </main>
  );
}

// Main Book Details Content
async function BookDetailsContent({ params }: Props) {
  await connection();

  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    notFound();
  }

  const bookId = book._id || book.id || "";

  const totalCopies = Math.max(0, book.totalCopies || 0);

  const availableCopies = Math.max(
    0,
    Math.min(book.availableCopies || 0, totalCopies),
  );

  const borrowedCopies = Math.max(0, totalCopies - availableCopies);

  const isAvailable = availableCopies > 0;

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#526057] transition hover:text-[#244C3A]"
          >
            <ArrowLeft size={18} />
            Back to All Books
          </Link>

          <div className="text-sm text-[#8A948D]">
            <Link href="/" className="hover:text-[#244C3A]">
              Home
            </Link>

            <span className="mx-2">/</span>

            <Link href="/books" className="hover:text-[#244C3A]">
              Books
            </Link>

            <span className="mx-2">/</span>

            <span>Details</span>
          </div>
        </div>

        {/* Main Book Card */}
        <section className="overflow-hidden rounded-3xl border border-[#E8E8E2] bg-white shadow-sm">
          <div className="grid gap-8 p-5 sm:p-8 md:grid-cols-[300px_1fr] md:gap-10 lg:p-10">
            {/* LEFT: Book Image */}
            <div className="flex flex-col items-center">
              <div className="flex h-[320px] w-full max-w-[230px] items-center justify-center overflow-hidden rounded-2xl border border-[#E8E8E2] bg-[#F4F5F0] p-3 shadow-sm sm:h-[350px] sm:max-w-[250px]">
                {book.imageUrl ? (
                  <img
                    src={book.imageUrl}
                    alt={`Cover of ${book.title}`}
                    className="h-full w-full rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-[#8BA995]">
                    <BookOpen size={60} strokeWidth={1.3} />

                    <span className="text-sm">No Cover Available</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-[#8A948D]">
                <BookOpen size={14} />
                BookNook Collection
              </div>

              {/* Availability Status */}
              <div
                className={`mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                  isAvailable
                    ? "bg-[#EAF3EC] text-[#28633F]"
                    : "bg-red-50 text-red-600"
                }`}
              >
                <CheckCircle2 size={15} />

                {isAvailable
                  ? "Available for Borrowing"
                  : "Currently Unavailable"}
              </div>
            </div>

            {/* RIGHT: Book Information */}
            <div className="flex flex-col justify-center">
              {/* Category */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#EAF0EB] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#244C3A]">
                  {book.category}
                </span>

                <span className="rounded-full bg-[#F1EBDD] px-3 py-2 text-xs font-medium text-[#826A3D]">
                  BookNook Library
                </span>
              </div>

              {/* Title */}
              <h1 className="mt-5 break-words font-serif text-3xl font-semibold leading-tight text-[#244C3A] sm:text-4xl lg:text-5xl">
                {book.title}
              </h1>

              {/* Author */}
              <p className="mt-4 text-base text-[#777F79]">
                Written by{" "}
                <span className="font-semibold text-[#244C3A]">
                  {book.author}
                </span>
              </p>

              <div className="my-7 h-px bg-[#E8E8E2]" />

              {/* Description */}
              <div>
                <h2 className="font-serif text-xl font-semibold text-[#244C3A]">
                  About This Book
                </h2>

                <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-[#68736C] sm:text-base">
                  {book.description?.trim() ||
                    "No description available for this book yet."}
                </p>
              </div>

              {/* Copies Information */}
              <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-xl border border-[#E8E8E2] bg-[#FAF9F6] p-4">
                  <div className="flex items-center gap-2 text-[#777F79]">
                    <Package size={16} />

                    <span className="text-xs">Total Copies</span>
                  </div>

                  <p className="mt-2 text-2xl font-bold text-[#244C3A]">
                    {totalCopies}
                  </p>
                </div>

                <div className="rounded-xl border border-[#E8E8E2] bg-[#FAF9F6] p-4">
                  <div className="flex items-center gap-2 text-[#777F79]">
                    <BookOpen size={16} />

                    <span className="text-xs">Available Copies</span>
                  </div>

                  <p className="mt-2 text-2xl font-bold text-[#244C3A]">
                    {availableCopies}
                  </p>
                </div>
              </div>

              {/* Borrow Button */}
              <div className="mt-7">
                <BorrowButton
                  bookId={bookId}
                  availableCopies={availableCopies}
                />

                <p className="mt-3 text-center text-xs text-[#8A948D]">
                  Standard borrowing period: 14 days
                </p>
              </div>
            </div>
          </div>

          {/* Book Information Footer */}
          <div className="border-t border-[#E8E8E2] bg-[#FCFCFA] px-5 py-7 sm:px-8 lg:px-10">
            <div className="mb-5 flex items-center gap-2">
              <Library size={20} className="text-[#244C3A]" />

              <h2 className="font-serif text-xl font-semibold text-[#244C3A]">
                Book Information
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Added By */}
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[#EAF0EB] p-2 text-[#244C3A]">
                  <UserRound size={18} />
                </div>

                <div>
                  <p className="text-xs text-[#8A948D]">Added By</p>

                  <p className="mt-1 text-sm font-semibold text-[#244C3A]">
                    {book.addedBy?.name || "Unknown"}
                  </p>
                </div>
              </div>

              {/* Added By Email */}
              <div className="flex min-w-0 items-start gap-3">
                <div className="rounded-lg bg-[#EAF0EB] p-2 text-[#244C3A]">
                  <Library size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-[#8A948D]">Added By Email</p>

                  <p className="mt-1 break-all text-sm font-semibold text-[#244C3A]">
                    {book.addedBy?.email || "Not available"}
                  </p>
                </div>
              </div>

              {/* Date Added */}
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[#EAF0EB] p-2 text-[#244C3A]">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <p className="text-xs text-[#8A948D]">Date Added</p>

                  <p className="mt-1 text-sm font-semibold text-[#244C3A]">
                    {formatDate(book.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Borrowed Copies Progress */}
            <div className="mt-6 border-t border-[#E8E8E2] pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#777F79]">Currently Borrowed</span>

                <span className="font-semibold text-[#244C3A]">
                  {borrowedCopies} / {totalCopies}
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E8E8E2]">
                <div
                  className="h-full rounded-full bg-[#244C3A] transition-all"
                  style={{
                    width: `${
                      totalCopies > 0 ? (borrowedCopies / totalCopies) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Back to Books */}
        <div className="mt-8 text-center">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 rounded-xl border border-[#244C3A] px-5 py-3 text-sm font-semibold text-[#244C3A] transition hover:bg-[#244C3A] hover:text-white"
          >
            <ArrowLeft size={16} />
            Explore More Books
          </Link>
        </div>
      </div>
    </main>
  );
}

// Main Page
export default function BookDetailsPage({ params }: Props) {
  return (
    <Suspense fallback={<BookDetailsSkeleton />}>
      <BookDetailsContent params={params} />
    </Suspense>
  );
}

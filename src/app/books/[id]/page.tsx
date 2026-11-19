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
} from "lucide-react";

type Book = {
  _id?: string;
  title: string;
  author: string;
  category: string;
  imageUrl?: string;
  description: string;
  totalCopies: number;
  availableCopies: number;
  addedBy?: {
    name: string;
    email: string;
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

// Fetch book from Express Backend
async function getBook(id: string): Promise<Book | null> {
  const apiUrl = process.env.BACKEND_API_URL || "http://localhost:5000";

  try {
    const response = await fetch(
      `${apiUrl}/api/books/${encodeURIComponent(id)}`,
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

// Format date safely
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

// Book Details Content
async function BookDetailsContent({ params }: Props) {
  await connection();

  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    notFound();
  }

  const formattedDate = formatDate(book.createdAt);

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-5 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        <Link
          href="/books"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#526057] transition hover:text-[#244C3A]"
        >
          <ArrowLeft size={18} />
          Back to All Books
        </Link>

        {/* Book Details */}
        <section className="grid gap-10 rounded-3xl border border-[#E8E8E2] bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
          {/* Book Image */}
          <div className="flex min-h-[350px] items-center justify-center overflow-hidden rounded-2xl bg-[#EAF0EB] md:min-h-[500px]">
            {book.imageUrl ? (
              <img
                src={book.imageUrl}
                alt={book.title}
                className="h-full max-h-[550px] w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-[#8BA995]">
                <BookOpen size={64} />
                <span>No book cover available</span>
              </div>
            )}
          </div>

          {/* Book Information */}
          <div className="flex flex-col justify-center">
            {/* Category */}
            <span className="w-fit rounded-full bg-[#EAF0EB] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#244C3A]">
              {book.category}
            </span>

            {/* Title */}
            <h1 className="mt-5 font-serif text-4xl leading-tight text-[#244C3A] md:text-5xl">
              {book.title}
            </h1>

            {/* Author */}
            <p className="mt-4 text-lg text-[#777F79]">
              Written by{" "}
              <span className="font-medium text-[#244C3A]">{book.author}</span>
            </p>

            <div className="my-8 h-px bg-[#E8E8E2]" />

            {/* Description */}
            <h2 className="mb-3 font-serif text-2xl text-[#244C3A]">
              About This Book
            </h2>

            <p className="whitespace-pre-line text-sm leading-8 text-[#777F79]">
              {book.description || "No description available."}
            </p>

            {/* Copies Information */}
            <div className="my-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#FAF9F6] p-4">
                <p className="text-xs text-[#777F79]">Total Copies</p>

                <p className="mt-2 text-2xl font-semibold text-[#244C3A]">
                  {book.totalCopies}
                </p>
              </div>

              <div className="rounded-xl bg-[#FAF9F6] p-4">
                <p className="text-xs text-[#777F79]">Available Copies</p>

                <p className="mt-2 text-2xl font-semibold text-[#244C3A]">
                  {book.availableCopies}
                </p>
              </div>
            </div>

            {/* Borrow Button - UI Only */}
            <BorrowButton
              bookId={book._id || ""}
              availableCopies={book.availableCopies}
            />

            {/* Added By Information */}
            <div className="mt-8 rounded-xl border border-[#E8E8E2] p-5">
              <h3 className="mb-4 font-serif text-lg text-[#244C3A]">
                Book Information
              </h3>

              <div className="space-y-4 text-sm text-[#777F79]">
                <div className="flex items-center gap-3">
                  <UserRound size={18} />
                  <span>Added by: {book.addedBy?.name || "Unknown"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Library size={18} />
                  <span>Email: {book.addedBy?.email || "Not available"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarDays size={18} />
                  <span>Added: {formattedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// Main Page
export default function BookDetailsPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen animate-pulse bg-[#FAF9F6] px-5 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 h-5 w-40 rounded bg-gray-200" />

            <div className="grid gap-10 md:grid-cols-2">
              <div className="h-[500px] rounded-2xl bg-gray-200" />

              <div className="space-y-5">
                <div className="h-8 w-32 rounded bg-gray-200" />
                <div className="h-12 w-full rounded bg-gray-200" />
                <div className="h-24 rounded bg-gray-200" />
                <div className="h-14 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </main>
      }
    >
      <BookDetailsContent params={params} />
    </Suspense>
  );
}

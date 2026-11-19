import { Suspense } from "react";
import { connection } from "next/server";
import AllBooksClient from "@/components/books/all-books-client";

type Book = {
  _id?: string;
  id?: string;
  title: string;
  author: string;
  category: string;
  imageUrl?: string;
  description?: string;
  availableCopies?: number;
  createdAt?: string;
};

type BooksResponse = {
  success: boolean;
  total: number;
  data: Book[];
};

type Props = {
  searchParams: Promise<{
    category?: string;
  }>;
};

async function getBooks(): Promise<Book[]> {
  const apiUrl = process.env.BACKEND_API_URL || "http://localhost:5000";

  try {
    const response = await fetch(`${apiUrl}/api/books`, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch books:", response.status);
      return [];
    }

    const result: BooksResponse = await response.json();

    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    console.error("Books API error:", error);
    return [];
  }
}

// Async Server Component
async function BooksContent({ searchParams }: Props) {
  await connection();

  const params = await searchParams;
  const books = await getBooks();

  return (
    <AllBooksClient
      initialBooks={books}
      initialCategory={params.category || "All"}
    />
  );
}

// Main Page
export default function BooksPage({ searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FAF9F6] px-5 py-20">
          <div className="mx-auto max-w-7xl animate-pulse">
            <div className="mx-auto mb-5 h-4 w-32 rounded bg-gray-200" />
            <div className="mx-auto mb-4 h-10 max-w-md rounded bg-gray-200" />
            <div className="mx-auto mb-12 h-4 max-w-xl rounded bg-gray-200" />

            <div className="mb-8 h-12 rounded-xl bg-gray-200" />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="h-96 rounded-2xl bg-gray-200" />
              ))}
            </div>
          </div>
        </main>
      }
    >
      <BooksContent searchParams={searchParams} />
    </Suspense>
  );
}

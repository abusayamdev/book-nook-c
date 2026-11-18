import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import HeroSlider from "@/components/home/hero-slider";

type Book = {
  _id?: string;
  id?: string;
  title: string;
  author: string;
  category: string;
  imageUrl: string;
  description: string;
  availableCopies: number;
};

type BooksResponse = {
  success: boolean;
  data: Book[];
};

async function getLatestBooks(): Promise<Book[]> {
  try {
    const response = await fetch("http://localhost:5000/api/books", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to fetch books.");
    }

    const result: BooksResponse = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
      return [];
    }

    return result.data.slice(0, 6);
  } catch (error) {
    console.error("Latest books API error:", error);
    return [];
  }
}

export default async function HomePage() {
  const books = await getLatestBooks();

  return (
    <main className="min-h-screen bg-[#FAF9F6]">
      <HeroSlider />

      {/* Latest Books */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#8BA995]">
              Curated for readers
            </p>

            <h2 className="mt-3 font-serif text-4xl text-[#244C3A]">
              Latest Arrivals
            </h2>

            <p className="mt-3 text-[#777F79]">
              Explore the newest books added to our collection.
            </p>
          </div>

          <Link
            href="/books"
            className="inline-flex items-center gap-2 font-medium text-[#244C3A] hover:underline"
          >
            See All Books
            <ArrowRight size={18} />
          </Link>
        </div>

        {books.length > 0 ? (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => {
              const bookId = book._id || book.id;

              return (
                <article
                  key={bookId || book.title}
                  className="overflow-hidden rounded-2xl border border-[#E8E8E2] bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className="flex h-64 items-center justify-center bg-[#E9EDE6] bg-cover bg-center"
                    style={{
                      backgroundImage: book.imageUrl
                        ? `url("${book.imageUrl}")`
                        : undefined,
                    }}
                    role="img"
                    aria-label={book.title}
                  >
                    {!book.imageUrl && (
                      <BookOpen size={55} className="text-[#8BA995]" />
                    )}
                  </div>

                  <div className="p-6">
                    <span className="rounded-full bg-[#EAF0EB] px-3 py-1 text-xs font-medium text-[#244C3A]">
                      {book.category}
                    </span>

                    <h3 className="mt-4 font-serif text-2xl text-[#244C3A]">
                      {book.title}
                    </h3>

                    <p className="mt-2 text-sm text-[#777F79]">
                      By {book.author}
                    </p>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#777F79]">
                      {book.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-[#E8E8E2] pt-4">
                      <span className="text-xs text-[#777F79]">
                        Available: {book.availableCopies}
                      </span>

                      {bookId ? (
                        <Link
                          href={`/books/${bookId}`}
                          className="font-medium text-[#244C3A] hover:underline"
                        >
                          View Details →
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Details unavailable
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#C5D1C6] bg-white px-6 py-16 text-center">
            <BookOpen className="mx-auto text-[#8BA995]" size={42} />

            <h3 className="mt-4 font-serif text-2xl text-[#244C3A]">
              No Books Available Yet
            </h3>

            <p className="mt-2 text-sm text-[#777F79]">
              Start by adding books to your BookNook collection.
            </p>
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="border-y border-[#E8E8E2] bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-[#8BA995]">
              Explore Collections
            </p>

            <h2 className="mt-3 font-serif text-4xl text-[#244C3A]">
              Find Your Reading Interest
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {["Fiction", "Science", "History", "Kids", "Others"].map(
              (category) => (
                <Link
                  key={category}
                  href={`/books?category=${category}`}
                  className="rounded-xl border border-[#E8E8E2] p-7 text-center transition hover:-translate-y-1 hover:border-[#8BA995] hover:bg-[#F5F7F3]"
                >
                  <BookOpen className="mx-auto mb-3 text-[#8BA995]" />
                  <h3 className="font-serif text-xl text-[#244C3A]">
                    {category}
                  </h3>
                </Link>
              ),
            )}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-[#8BA995]">
          About BookNook
        </p>

        <h2 className="mx-auto mt-4 max-w-2xl font-serif text-4xl text-[#244C3A]">
          A Little Corner for Every Book Lover
        </h2>

        <p className="mx-auto mt-6 max-w-2xl leading-8 text-[#777F79]">
          BookNook brings readers and books together. Discover new stories,
          borrow books and share your love of reading.
        </p>
      </section>
    </main>
  );
}

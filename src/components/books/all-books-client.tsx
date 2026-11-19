"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Search, SlidersHorizontal } from "lucide-react";

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

type Props = {
  initialBooks: Book[];
  initialCategory?: string;
};

const categories = ["All", "Fiction", "Science", "History", "Kids", "Others"];

export default function AllBooksClient({
  initialBooks,
  initialCategory = "All",
}: Props) {
  const [books] = useState(initialBooks);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(
    categories.includes(initialCategory) ? initialCategory : "All",
  );
  const [sort, setSort] = useState("newest");

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query);

      const matchesCategory = category === "All" || book.category === category;

      return matchesSearch && matchesCategory;
    });

    return [...result].sort((a, b) => {
      if (sort === "title") {
        return a.title.localeCompare(b.title);
      }

      if (sort === "author") {
        return a.author.localeCompare(b.author);
      }

      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });
  }, [books, search, category, sort]);

  return (
    <main className="min-h-screen bg-[#FAF9F6]">
      {/* Page Header */}
      <section className="border-b border-[#E8E8E2] bg-white px-5 py-16 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#8BA995]">
          Our Library
        </p>

        <h1 className="font-serif text-4xl text-[#244C3A] md:text-5xl">
          Explore Our Collection
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#777F79]">
          Discover your next favorite book from our growing collection of
          stories, knowledge and inspiration.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        {/* Search and Sorting */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A918C]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by book title or author..."
              className="w-full rounded-xl border border-[#E8E8E2] bg-white py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-[#244C3A]"
            />
          </div>

          <div className="flex items-center gap-3">
            <SlidersHorizontal size={18} className="text-[#244C3A]" />

            <label htmlFor="book-sort" className="text-sm text-[#777F79]">
              Sort by:
            </label>

            <select
              id="book-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-xl border border-[#E8E8E2] bg-white px-4 py-3 text-sm text-[#244C3A] outline-none focus:border-[#244C3A]"
            >
              <option value="newest">Newest First</option>
              <option value="title">Title: A to Z</option>
              <option value="author">Author: A to Z</option>
            </select>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-full border px-5 py-2.5 text-sm transition ${
                category === item
                  ? "border-[#244C3A] bg-[#244C3A] text-white"
                  : "border-[#E8E8E2] bg-white text-[#526057] hover:border-[#244C3A]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-[#777F79]">
            Showing{" "}
            <span className="font-semibold text-[#244C3A]">
              {filteredBooks.length}
            </span>{" "}
            {filteredBooks.length === 1 ? "book" : "books"}
          </p>

          {(search || category !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="text-sm font-medium text-[#244C3A] underline underline-offset-4"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book, index) => {
              const bookId = book._id || book.id;

              return (
                <article
                  key={bookId || `${book.title}-${index}`}
                  className="overflow-hidden rounded-2xl border border-[#E8E8E2] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-64 items-center justify-center overflow-hidden bg-[#E8E8E2]">
                    {book.imageUrl ? (
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-[#8BA995]">
                        <BookOpen size={42} />
                        <span className="text-sm">{book.title}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <span className="inline-block rounded-full bg-[#EAF0EB] px-3 py-1 text-xs text-[#244C3A]">
                      {book.category}
                    </span>

                    <h2 className="mt-4 font-serif text-2xl text-[#244C3A]">
                      {book.title}
                    </h2>

                    <p className="mt-2 text-sm text-[#777F79]">
                      By {book.author}
                    </p>

                    {book.description && (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#777F79]">
                        {book.description}
                      </p>
                    )}

                    <div className="mt-6 flex items-center justify-between border-t border-[#E8E8E2] pt-5">
                      <span className="text-xs text-[#777F79]">
                        Available: {book.availableCopies ?? "—"}
                      </span>

                      {bookId ? (
                        <Link
                          href={`/books/${bookId}`}
                          className="inline-flex items-center gap-2 font-serif text-base text-[#244C3A] hover:text-[#8BA995]"
                        >
                          View Details <ArrowRight size={17} />
                        </Link>
                      ) : (
                        <span className="text-xs text-[#777F79]">
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
          <div className="rounded-2xl border border-dashed border-[#D8DED8] bg-white px-5 py-16 text-center">
            <BookOpen className="mx-auto mb-4 text-[#8BA995]" size={42} />

            <h2 className="font-serif text-2xl text-[#244C3A]">
              No Books Found
            </h2>

            <p className="mt-3 text-sm text-[#777F79]">
              Try another search term or choose a different category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-6 rounded-lg bg-[#244C3A] px-5 py-3 text-sm text-white"
            >
              Show All Books
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

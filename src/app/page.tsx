import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Suspense } from "react";

import HeroSlider from "@/components/home/hero-slider";
import LatestBooks from "@/components/home/latest-books";

const categories = ["Fiction", "Science", "History", "Kids", "Others"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAF9F6]">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Latest Books */}
      <Suspense
        fallback={
          <section className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-10">
              <p className="text-sm uppercase tracking-[0.2em] text-[#8BA995]">
                Curated for readers
              </p>

              <h2 className="mt-3 font-serif text-4xl text-[#244C3A]">
                Latest Arrivals
              </h2>

              <p className="mt-3 text-[#777F79]">Loading the latest books...</p>
            </div>

            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse overflow-hidden rounded-2xl border border-[#E8E8E2] bg-white"
                >
                  <div className="h-64 bg-[#E9EDE6]" />

                  <div className="space-y-3 p-6">
                    <div className="h-4 w-20 rounded bg-[#E9EDE6]" />
                    <div className="h-6 w-3/4 rounded bg-[#E9EDE6]" />
                    <div className="h-4 w-1/2 rounded bg-[#E9EDE6]" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        }
      >
        <LatestBooks />
      </Suspense>

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

            <p className="mt-3 text-[#777F79]">
              Discover books from different categories.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/books?category=${encodeURIComponent(category)}`}
                className="rounded-xl border border-[#E8E8E2] p-7 text-center transition hover:-translate-y-1 hover:border-[#8BA995] hover:bg-[#F5F7F3]"
              >
                <BookOpen className="mx-auto mb-3 text-[#8BA995]" size={28} />

                <h3 className="font-serif text-xl text-[#244C3A]">
                  {category}
                </h3>

                <span className="mt-2 inline-flex items-center gap-1 text-xs text-[#777F79]">
                  Explore Category
                  <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About BookNook */}
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

        <Link
          href="/books"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#244C3A] px-6 py-3 font-medium text-white transition hover:bg-[#193829]"
        >
          Explore Our Collection
          <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}

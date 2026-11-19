"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const slides = [
  {
    eyebrow: "WELCOME TO BOOKNOOK",
    title: "Discover Stories That Stay With You.",
    description:
      "Explore inspiring books, timeless classics and stories waiting to be discovered.",
    background: "bg-[#244C3A]",
    accent: "bg-[#C5A46D]",
  },
  {
    eyebrow: "YOUR NEXT CHAPTER",
    title: "A New World Between Every Cover.",
    description:
      "Find your next favorite read from our growing collection of books.",
    background: "bg-[#526B59]",
    accent: "bg-[#D8C8A8]",
  },
  {
    eyebrow: "READ. BORROW. EXPLORE.",
    title: "Make Every Reading Moment Count.",
    description:
      "Discover books, borrow your favorites and build your personal reading journey.",
    background: "bg-[#594C3E]",
    accent: "bg-[#A9B9A5]",
  },
];

export default function HeroSlider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a stable placeholder during server rendering.
  if (!mounted) {
    return (
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="flex min-h-[430px] items-center rounded-3xl bg-[#244C3A] px-8 py-16 text-white md:px-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.25em] text-[#D8C8A8]">
              WELCOME TO BOOKNOOK
            </p>

            <h1 className="mt-6 font-serif text-5xl leading-tight md:text-6xl">
              Discover Stories That Stay With You.
            </h1>

            <p className="mt-6 max-w-xl leading-8 text-white/75">
              Explore inspiring books, timeless classics and stories waiting to
              be discovered.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        loop
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        className="overflow-hidden rounded-3xl"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.eyebrow}>
            <div
              className={`relative flex min-h-[430px] items-center overflow-hidden ${slide.background} px-8 py-16 text-white md:px-16`}
            >
              <div
                className={`absolute -right-20 -top-20 h-80 w-80 rounded-full ${slide.accent} opacity-20 blur-3xl`}
              />

              <div className="relative z-10 max-w-2xl">
                <p className="text-xs font-semibold tracking-[0.25em] text-[#D8C8A8]">
                  {slide.eyebrow}
                </p>

                <h1 className="mt-6 font-serif text-5xl leading-tight md:text-6xl">
                  {slide.title}
                </h1>

                <p className="mt-6 max-w-xl leading-8 text-white/75">
                  {slide.description}
                </p>

                <Link
                  href="/books"
                  className="mt-8 inline-flex rounded-lg bg-white px-6 py-3 font-medium text-[#244C3A] transition hover:bg-[#E8E8E2]"
                >
                  Explore Books →
                </Link>
              </div>

              <div className="absolute bottom-10 right-12 hidden rotate-6 md:block">
                <div className="flex h-64 w-44 items-center justify-center rounded-r-xl border-l-8 border-[#C5A46D] bg-white/10 p-5 shadow-2xl backdrop-blur-sm">
                  <div className="text-center">
                    <span className="text-5xl">📖</span>

                    <p className="mt-5 font-serif text-3xl">BookNook</p>

                    <p className="mt-2 text-xs tracking-widest text-white/70">
                      STORIES LIVE HERE
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

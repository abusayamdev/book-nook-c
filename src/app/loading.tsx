import { BookOpen } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-[#FAF9F6] px-5">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-[#EAF0EB] text-[#244C3A]">
          <BookOpen size={32} />
        </div>

        <div className="mt-6 h-8 w-8 animate-spin rounded-full border-4 border-[#E8E8E2] border-t-[#244C3A]" />

        <h2 className="mt-5 text-lg font-semibold text-[#244C3A]">
          Loading BookNook...
        </h2>

        <p className="mt-2 text-sm text-[#777F79]">
          Preparing your reading experience.
        </p>
      </div>
    </main>
  );
}

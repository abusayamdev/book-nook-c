"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  BookOpen,
  CalendarDays,
  Clock,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  ImageIcon,
  BookCheck,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Borrow = {
  _id: string;
  bookId: string;
  bookTitle: string;
  bookImage?: string;
  userName: string;
  userEmail: string;
  borrowDate: string;
  returnDate: string;
};

type ApiResponse = {
  success: boolean;
  message: string;
  total?: number;
  data?: Borrow[];
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getBorrowStatus(returnDate: string) {
  const date = new Date(returnDate);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.getTime() < Date.now() ? "Overdue" : "Active";
}

export default function MyBorrowsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(false);

  const [selectedBorrow, setSelectedBorrow] = useState<Borrow | null>(null);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadBorrows = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await authClient.token();

      if (error || !data?.token) {
        throw new Error("Authentication failed. Please login again.");
      }

      const response = await fetch(`${API_URL}/api/borrows`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
        cache: "no-store",
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load borrowing history.");
      }

      setBorrows(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/login");
      return;
    }

    if (!isPending && session?.user) {
      void loadBorrows();
    }
  }, [isPending, session, router, loadBorrows]);

  const handleReturn = async () => {
    if (!selectedBorrow) return;

    setReturning(true);
    setMessage(null);

    try {
      const { data, error } = await authClient.token();

      if (error || !data?.token) {
        throw new Error("Authentication failed. Please login again.");
      }

      const response = await fetch(
        `${API_URL}/api/borrows/${selectedBorrow._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to return this book.");
      }

      setBorrows((previous) =>
        previous.filter((borrow) => borrow._id !== selectedBorrow._id),
      );

      setSelectedBorrow(null);

      setMessage({
        type: "success",
        text: "Book returned successfully!",
      });

      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setReturning(false);
    }
  };

  const activeCount = borrows.filter(
    (borrow) => getBorrowStatus(borrow.returnDate) === "Active",
  ).length;

  const overdueCount = borrows.filter(
    (borrow) => getBorrowStatus(borrow.returnDate) === "Overdue",
  ).length;

  if (isPending || !session?.user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <Loader2 size={32} className="animate-spin text-[#244C3A]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-5 py-12">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-9">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8BA995]">
            Your Reading Journey
          </p>

          <h1 className="mt-3 font-serif text-4xl text-[#244C3A] md:text-5xl">
            My Borrows
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#777F79]">
            Manage your borrowed books and keep track of return dates.
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E8E8E2] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#777F79]">Total Borrowed</p>
              <BookOpen size={20} className="text-[#8BA995]" />
            </div>
            <p className="mt-3 font-serif text-3xl text-[#244C3A]">
              {borrows.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8E8E2] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#777F79]">Active Borrows</p>
              <Clock size={20} className="text-[#3D9365]" />
            </div>
            <p className="mt-3 font-serif text-3xl text-[#244C3A]">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8E8E2] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#777F79]">Overdue</p>
              <CalendarDays size={20} className="text-red-500" />
            </div>
            <p className="mt-3 font-serif text-3xl text-[#244C3A]">
              {overdueCount}
            </p>
          </div>
        </div>

        {/* Notification */}
        {message && (
          <div
            role="alert"
            className={`mb-6 flex items-center gap-3 rounded-xl border p-4 text-sm ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={19} />
            ) : (
              <AlertCircle size={19} />
            )}

            <span>{message.text}</span>

            <button
              onClick={() => setMessage(null)}
              className="ml-auto"
              aria-label="Dismiss message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Borrowing History */}
        <div className="overflow-hidden rounded-2xl border border-[#E8E8E2] bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-[#E8E8E2] p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-serif text-2xl text-[#244C3A]">
                Borrowing History
              </h2>
              <p className="mt-1 text-xs text-[#777F79]">
                Your currently borrowed books
              </p>
            </div>

            <button
              onClick={() => void loadBorrows()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E8E8E2] px-4 py-2.5 text-xs font-semibold text-[#244C3A] hover:bg-[#FAF9F6] disabled:opacity-50"
            >
              <RotateCcw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="animate-spin text-[#244C3A]" />
              <p className="text-sm text-[#777F79]">
                Loading your borrowing history...
              </p>
            </div>
          ) : borrows.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <BookCheck size={48} className="mx-auto mb-5 text-[#8BA995]" />

              <h3 className="font-serif text-2xl text-[#244C3A]">
                No Borrowed Books
              </h3>

              <p className="mt-3 text-sm text-[#777F79]">
                You haven't borrowed any books yet. Explore our collection and
                find your next read.
              </p>

              <button
                onClick={() => router.push("/books")}
                className="mt-7 rounded-xl bg-[#244C3A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#19392B]"
              >
                Explore Books
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-[#FAF9F6] text-xs uppercase tracking-wider text-[#777F79]">
                    <tr>
                      <th className="px-5 py-4">Book</th>
                      <th className="px-5 py-4">Borrow Date</th>
                      <th className="px-5 py-4">Return Date</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E8E8E2]">
                    {borrows.map((borrow) => {
                      const status = getBorrowStatus(borrow.returnDate);

                      return (
                        <tr key={borrow._id} className="hover:bg-[#FAF9F6]/70">
                          <td className="px-5 py-5">
                            <div className="flex items-center gap-4">
                              <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F1F2ED]">
                                {borrow.bookImage ? (
                                  <img
                                    src={borrow.bookImage}
                                    alt={borrow.bookTitle}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon
                                    size={20}
                                    className="text-[#8BA995]"
                                  />
                                )}
                              </div>

                              <span className="max-w-48 text-sm font-semibold text-[#244C3A]">
                                {borrow.bookTitle}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-5 text-sm text-[#777F79]">
                            {formatDate(borrow.borrowDate)}
                          </td>

                          <td className="px-5 py-5 text-sm text-[#777F79]">
                            {formatDate(borrow.returnDate)}
                          </td>

                          <td className="px-5 py-5">
                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                status === "Overdue"
                                  ? "bg-red-50 text-red-600"
                                  : status === "Active"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {status}
                            </span>
                          </td>

                          <td className="px-5 py-5 text-right">
                            <button
                              onClick={() => setSelectedBorrow(borrow)}
                              className="inline-flex items-center gap-2 rounded-lg bg-[#244C3A] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#19392B]"
                            >
                              <RotateCcw size={14} />
                              Return Book
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-4 p-4 md:hidden">
                {borrows.map((borrow) => {
                  const status = getBorrowStatus(borrow.returnDate);

                  return (
                    <article
                      key={borrow._id}
                      className="rounded-xl border border-[#E8E8E2] p-4"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-24 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F1F2ED]">
                          {borrow.bookImage ? (
                            <img
                              src={borrow.bookImage}
                              alt={borrow.bookTitle}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={22} className="text-[#8BA995]" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-serif text-xl text-[#244C3A]">
                            {borrow.bookTitle}
                          </h3>

                          <span
                            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                              status === "Overdue"
                                ? "bg-red-50 text-red-600"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#E8E8E2] pt-4">
                        <div>
                          <p className="text-xs text-[#8A918C]">Borrow Date</p>
                          <p className="mt-1 text-sm text-[#526057]">
                            {formatDate(borrow.borrowDate)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#8A918C]">Return Date</p>
                          <p className="mt-1 text-sm text-[#526057]">
                            {formatDate(borrow.returnDate)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedBorrow(borrow)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#244C3A] py-3 text-sm font-semibold text-white"
                      >
                        <RotateCcw size={16} />
                        Return Book
                      </button>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Return Confirmation Modal */}
      {selectedBorrow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget && !returning) {
              setSelectedBorrow(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF0EB] text-[#244C3A]">
              <BookCheck size={26} />
            </div>

            <h2 className="mt-5 text-center font-serif text-2xl text-[#244C3A]">
              Return This Book?
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-[#777F79]">
              Are you ready to return{" "}
              <strong className="text-[#252A27]">
                {selectedBorrow.bookTitle}
              </strong>
              ?
            </p>

            <p className="mt-3 text-center text-xs text-[#8A918C]">
              The book will be removed from your borrowing history.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={returning}
                onClick={() => setSelectedBorrow(null)}
                className="rounded-xl border border-[#E8E8E2] py-3 text-sm font-semibold text-[#526057]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={returning}
                onClick={handleReturn}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#244C3A] py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {returning ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Returning...
                  </>
                ) : (
                  "Confirm Return"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

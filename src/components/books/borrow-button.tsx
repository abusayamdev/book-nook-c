"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  BookOpen,
  CalendarDays,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type BorrowButtonProps = {
  bookId: string;
  availableCopies: number;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

export default function BorrowButton({
  bookId,
  availableCopies,
}: BorrowButtonProps) {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  // Default return date: 14 days from today
  const getDefaultReturnDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [returnDate, setReturnDate] = useState(getDefaultReturnDate);

  const user = session?.user;

  const handleOpenModal = () => {
    setMessage("");
    setMessageType("");

    if (isPending) {
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    if (availableCopies <= 0) {
      setMessage("This book is currently unavailable.");
      setMessageType("error");
      return;
    }

    setIsModalOpen(true);
  };

  const handleConfirmBorrow = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!returnDate) {
      setMessage("Please select a return date.");
      setMessageType("error");
      return;
    }

    const selectedDate = new Date(`${returnDate}T23:59:59`);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(selectedDate.getTime()) || selectedDate <= today) {
      setMessage("Return date must be after today.");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      // 1. Get Better Auth JWT
      const { data, error } = await authClient.token();

      if (error || !data?.token) {
        throw new Error(
          "Unable to get authentication token. Please login again.",
        );
      }

      // 2. Send Borrow Request to Express Backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const response = await fetch(`${apiUrl}/api/borrows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({
          bookId,
          returnDate: selectedDate.toISOString(),
        }),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to borrow this book.");
      }

      setMessage(result.message || "Book borrowed successfully!");
      setMessageType("success");
      setIsModalOpen(false);

      // Refresh Server Component data
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Borrow Button */}
      <button
        type="button"
        onClick={handleOpenModal}
        disabled={isPending || availableCopies <= 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#244C3A] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#19392B] disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Checking Login...
          </>
        ) : availableCopies <= 0 ? (
          "Currently Unavailable"
        ) : (
          <>
            <BookOpen size={18} />
            Borrow This Book
          </>
        )}
      </button>

      {/* Success / Error Message */}
      {message && (
        <div
          role="alert"
          className={`mt-4 flex items-start gap-3 rounded-xl border p-4 text-sm ${
            messageType === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {messageType === "success" ? (
            <CheckCircle2 size={19} className="shrink-0" />
          ) : (
            <AlertCircle size={19} className="shrink-0" />
          )}

          <span>{message}</span>
        </div>
      )}

      {/* Borrow Confirmation Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSubmitting) {
              setIsModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="borrow-modal-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            {/* Modal Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#8BA995]">
                  BookNook Library
                </p>

                <h2
                  id="borrow-modal-title"
                  className="mt-2 font-serif text-2xl text-[#244C3A]"
                >
                  Confirm Your Borrow
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                aria-label="Close modal"
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Information */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="borrow-user-name"
                  className="mb-2 block text-sm font-medium text-[#526057]"
                >
                  Your Name
                </label>

                <input
                  id="borrow-user-name"
                  type="text"
                  value={user?.name || ""}
                  readOnly
                  className="w-full rounded-lg border border-[#E8E8E2] bg-gray-50 px-4 py-3 text-sm text-gray-600 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="borrow-user-email"
                  className="mb-2 block text-sm font-medium text-[#526057]"
                >
                  Your Email
                </label>

                <input
                  id="borrow-user-email"
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="w-full rounded-lg border border-[#E8E8E2] bg-gray-50 px-4 py-3 text-sm text-gray-600 outline-none"
                />
              </div>

              {/* Return Date */}
              <div>
                <label
                  htmlFor="borrow-return-date"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-[#526057]"
                >
                  <CalendarDays size={17} />
                  Return Date
                </label>

                <input
                  id="borrow-return-date"
                  type="date"
                  value={returnDate}
                  min={
                    getDefaultReturnDate()
                      ? new Date().toLocaleDateString("en-CA")
                      : undefined
                  }
                  onChange={(event) => setReturnDate(event.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-[#E8E8E2] bg-white px-4 py-3 text-sm text-[#244C3A] outline-none focus:border-[#244C3A]"
                />
              </div>
            </div>

            {/* Available Copies */}
            <div className="mt-5 rounded-xl bg-[#EAF0EB] p-4">
              <p className="text-sm text-[#526057]">Available Copies</p>

              <p className="mt-1 text-xl font-semibold text-[#244C3A]">
                {availableCopies}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="flex-1 rounded-xl border border-[#E8E8E2] px-4 py-3 text-sm font-medium text-[#526057] transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmBorrow}
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#244C3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#19392B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Borrow"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

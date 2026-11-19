"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
  ArrowLeft,
  BookOpen,
  ImagePlus,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserRound,
  Mail,
} from "lucide-react";

const categories = ["Fiction", "Science", "History", "Kids", "Others"] as const;

type Category = (typeof categories)[number];

type UploadResponse = {
  success: boolean;
  data?: {
    url: string;
    display_url?: string;
  };
  error?: {
    message?: string;
  };
};

type ApiResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

export default function AddBookPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [description, setDescription] = useState("");
  const [totalCopies, setTotalCopies] = useState("1");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (isPending || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#244C3A]" />
          <p className="text-sm text-[#777F79]">Checking your account...</p>
        </div>
      </main>
    );
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setMessageType("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please select a JPG, PNG or WebP image.");
      setMessageType("error");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be 5 MB or less.");
      setMessageType("error");
      event.target.value = "";
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!apiKey) {
      throw new Error("ImgBB API key is missing.");
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: formData,
      },
    );

    const result: UploadResponse = await response.json();

    if (!response.ok || !result.success || !result.data?.url) {
      throw new Error(result.error?.message || "Image upload failed.");
    }

    return result.data.url;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!title.trim() || !author.trim()) {
      setMessage("Please enter the book title and author.");
      setMessageType("error");
      return;
    }

    if (!category) {
      setMessage("Please select a book category.");
      setMessageType("error");
      return;
    }

    if (description.trim().length < 10) {
      setMessage("Description must contain at least 10 characters.");
      setMessageType("error");
      return;
    }

    const copies = Number(totalCopies);

    if (!Number.isInteger(copies) || copies < 1 || copies > 10000) {
      setMessage("Total copies must be between 1 and 10,000.");
      setMessageType("error");
      return;
    }

    if (!imageFile) {
      setMessage("Please upload a book cover image.");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Get authenticated JWT
      const { data, error } = await authClient.token();

      if (error || !data?.token) {
        throw new Error("Authentication failed. Please login again.");
      }

      // Step 2: Upload book cover to ImgBB
      setIsUploading(true);

      const imageUrl = await uploadImage(imageFile);

      setIsUploading(false);

      // Step 3: Save book in Express Backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const response = await fetch(`${apiUrl}/api/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          category,
          imageUrl,
          description: description.trim(),
          totalCopies: copies,
        }),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to add the book.");
      }

      setMessage(result.message || "Book added successfully!");
      setMessageType("success");

      // Navigate after successful database insertion
      router.push("/books");
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-5 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Back Navigation */}
        <Link
          href="/books"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#777F79] transition hover:text-[#244C3A]"
        >
          <ArrowLeft size={18} />
          Back to All Books
        </Link>

        {/* Page Heading */}
        <div className="mb-9">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8BA995]">
            Contribute to Our Library
          </p>

          <h1 className="mt-3 font-serif text-4xl text-[#244C3A] md:text-5xl">
            Add a New Book
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-[#777F79]">
            Share a book with the BookNook community. Add its information and
            help others discover something wonderful.
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[#E8E8E2] bg-white p-6 shadow-sm md:p-9"
        >
          {/* Section Heading */}
          <div className="mb-7 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF0EB] text-[#244C3A]">
              <BookOpen size={22} />
            </span>

            <div>
              <h2 className="font-serif text-2xl text-[#244C3A]">
                Book Details
              </h2>
              <p className="mt-1 text-xs text-[#777F79]">
                Enter the basic information about your book.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Book Title */}
            <div>
              <label
                htmlFor="book-title"
                className="mb-2 block text-sm font-semibold text-[#526057]"
              >
                Book Title *
              </label>

              <input
                id="book-title"
                type="text"
                required
                minLength={2}
                maxLength={150}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter book title"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-[#E8E8E2] px-4 py-3.5 text-sm text-[#252A27] outline-none transition placeholder:text-[#A3AAA5] focus:border-[#244C3A]"
              />
            </div>

            {/* Author */}
            <div>
              <label
                htmlFor="book-author"
                className="mb-2 block text-sm font-semibold text-[#526057]"
              >
                Author Name *
              </label>

              <input
                id="book-author"
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="Enter author name"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-[#E8E8E2] px-4 py-3.5 text-sm text-[#252A27] outline-none transition placeholder:text-[#A3AAA5] focus:border-[#244C3A]"
              />
            </div>

            {/* Category and Copies */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="book-category"
                  className="mb-2 block text-sm font-semibold text-[#526057]"
                >
                  Book Category *
                </label>

                <select
                  id="book-category"
                  required
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as Category | "")
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-[#E8E8E2] bg-white px-4 py-3.5 text-sm text-[#526057] outline-none focus:border-[#244C3A]"
                >
                  <option value="">Select a category</option>

                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="total-copies"
                  className="mb-2 block text-sm font-semibold text-[#526057]"
                >
                  Total Copies *
                </label>

                <input
                  id="total-copies"
                  type="number"
                  required
                  min={1}
                  max={10000}
                  step={1}
                  value={totalCopies}
                  onChange={(event) => setTotalCopies(event.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-[#E8E8E2] px-4 py-3.5 text-sm text-[#252A27] outline-none focus:border-[#244C3A]"
                />

                <p className="mt-2 text-xs text-[#8A918C]">
                  Minimum 1, maximum 10,000 copies.
                </p>
              </div>
            </div>

            {/* Book Image Upload */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#526057]">
                Book Cover Image *
              </label>

              <div
                onClick={() => {
                  if (!isSubmitting) {
                    fileInputRef.current?.click();
                  }
                }}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-[#DCE3DD] bg-[#FAF9F6] p-6 text-center transition hover:border-[#244C3A]"
              >
                {imagePreview ? (
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={imagePreview}
                      alt="Book cover preview"
                      className="max-h-64 max-w-full rounded-xl object-contain shadow-sm"
                    />

                    <p className="break-all text-sm font-medium text-[#244C3A]">
                      {imageFile?.name}
                    </p>

                    <span className="text-xs text-[#777F79]">
                      Click to change image
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF0EB] text-[#244C3A]">
                      <ImagePlus size={27} />
                    </span>

                    <p className="text-sm font-semibold text-[#244C3A]">
                      Click to upload book cover
                    </p>

                    <p className="mt-2 text-xs text-[#777F79]">
                      JPG, PNG or WebP · Maximum 5 MB
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#244C3A] px-5 py-3 text-xs font-semibold text-white">
                      <Upload size={16} />
                      Choose Image
                    </span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                disabled={isSubmitting}
                className="hidden"
              />

              {imageFile && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    if (imagePreview.startsWith("blob:")) {
                      URL.revokeObjectURL(imagePreview);
                    }

                    setImageFile(null);
                    setImagePreview("");

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-red-600 hover:text-red-700"
                >
                  <X size={15} />
                  Remove Image
                </button>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="book-description"
                className="mb-2 block text-sm font-semibold text-[#526057]"
              >
                Book Description *
              </label>

              <textarea
                id="book-description"
                required
                minLength={10}
                maxLength={3000}
                rows={6}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Write a description about this book..."
                disabled={isSubmitting}
                className="w-full resize-y rounded-xl border border-[#E8E8E2] px-4 py-3.5 text-sm leading-7 text-[#252A27] outline-none transition placeholder:text-[#A3AAA5] focus:border-[#244C3A]"
              />

              <p className="mt-2 text-right text-xs text-[#8A918C]">
                {description.length}/3000 characters
              </p>
            </div>
          </div>

          {/* Added By Information */}
          <div className="my-8 border-t border-[#E8E8E2] pt-7">
            <h3 className="mb-4 font-serif text-xl text-[#244C3A]">
              Contributor Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="contributor-name"
                  className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#777F79]"
                >
                  <UserRound size={15} />
                  Added By
                </label>

                <input
                  id="contributor-name"
                  type="text"
                  value={user.name || ""}
                  readOnly
                  className="w-full rounded-xl border border-[#E8E8E2] bg-gray-50 px-4 py-3 text-sm text-[#777F79] outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="contributor-email"
                  className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#777F79]"
                >
                  <Mail size={15} />
                  Email Address
                </label>

                <input
                  id="contributor-email"
                  type="email"
                  value={user.email || ""}
                  readOnly
                  className="w-full rounded-xl border border-[#E8E8E2] bg-gray-50 px-4 py-3 text-sm text-[#777F79] outline-none"
                />
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-[#8A918C]">
              Your account information is displayed automatically. The server
              will save the authenticated contributor details.
            </p>
          </div>

          {/* Success / Error Message */}
          {message && (
            <div
              role="alert"
              className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
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

              {message}
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => router.push("/books")}
              className="rounded-xl border border-[#E8E8E2] px-6 py-4 text-sm font-semibold text-[#526057] transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-3 rounded-xl bg-[#244C3A] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#19392B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isUploading ? "Uploading Image..." : "Adding Book..."}
                </>
              ) : (
                <>
                  <BookOpen size={18} />
                  Add Book to Library
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs leading-6 text-[#8A918C]">
          By adding a book, you agree to share its information with the BookNook
          community.
        </p>
      </div>
    </main>
  );
}

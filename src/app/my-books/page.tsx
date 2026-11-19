"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  BookOpen,
  Pencil,
  Trash2,
  Loader2,
  Plus,
  X,
  Search,
  AlertCircle,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const categories = ["Fiction", "Science", "History", "Kids", "Others"];

type Book = {
  _id: string;
  title: string;
  author: string;
  category: string;
  imageUrl?: string;
  description?: string;
  totalCopies: number;
  availableCopies: number;
  createdAt?: string;
};

type ApiResponse = {
  success: boolean;
  message: string;
  total?: number;
  data?: Book[];
};

type Message = {
  type: "success" | "error";
  text: string;
};

export default function MyBooksPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<Message | null>(null);

  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    author: "",
    category: "",
    imageUrl: "",
    description: "",
    totalCopies: "1",
  });

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await authClient.token();

      if (error || !data?.token) {
        throw new Error(
          "Unable to get authentication token. Please login again.",
        );
      }

      const response = await fetch(`${API_URL}/api/books?mine=true`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
        cache: "no-store",
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load your books.");
      }

      setBooks(Array.isArray(result.data) ? result.data : []);
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
      void loadBooks();
    }
  }, [isPending, session, router, loadBooks]);

  const openEditModal = (book: Book) => {
    setEditingBook(book);

    setEditForm({
      title: book.title,
      author: book.author,
      category: book.category,
      imageUrl: book.imageUrl || "",
      description: book.description || "",
      totalCopies: String(book.totalCopies),
    });

    setMessage(null);
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingBook) return;

    const copies = Number(editForm.totalCopies);

    if (!Number.isInteger(copies) || copies < 1 || copies > 10000) {
      setMessage({
        type: "error",
        text: "Total copies must be between 1 and 10,000.",
      });
      return;
    }

    if (editForm.description.trim().length < 10) {
      setMessage({
        type: "error",
        text: "Description must contain at least 10 characters.",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { data, error } = await authClient.token();

      if (error || !data?.token) {
        throw new Error("Authentication failed. Please login again.");
      }

      const response = await fetch(`${API_URL}/api/books/${editingBook._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({
          title: editForm.title.trim(),
          author: editForm.author.trim(),
          category: editForm.category,
          imageUrl: editForm.imageUrl.trim(),
          description: editForm.description.trim(),
          totalCopies: copies,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Book update failed.");
      }

      setEditingBook(null);
      setMessage({
        type: "success",
        text: "Book updated successfully!",
      });

      await loadBooks();
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to update book.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBook) return;

    setDeleting(true);
    setMessage(null);

    try {
      const { data, error } = await authClient.token();

      if (error || !data?.token) {
        throw new Error("Authentication failed. Please login again.");
      }

      const response = await fetch(`${API_URL}/api/books/${deletingBook._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Book deletion failed.");
      }

      setBooks((previous) =>
        previous.filter((book) => book._id !== deletingBook._id),
      );

      setDeletingBook(null);

      setMessage({
        type: "success",
        text: "Book deleted successfully!",
      });

      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to delete book.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    const keyword = search.toLowerCase();

    return (
      book.title.toLowerCase().includes(keyword) ||
      book.author.toLowerCase().includes(keyword) ||
      book.category.toLowerCase().includes(keyword)
    );
  });

  if (isPending || !session?.user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="animate-spin text-[#244C3A]" size={32} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-5 py-12">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8BA995]">
              Your Collection
            </p>

            <h1 className="mt-3 font-serif text-4xl text-[#244C3A] md:text-5xl">
              My Books
            </h1>

            <p className="mt-3 text-sm text-[#777F79]">
              Manage the books you have contributed to BookNook.
            </p>
          </div>

          <button
            onClick={() => router.push("/add-book")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#244C3A] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#19392B]"
          >
            <Plus size={18} />
            Add New Book
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E8E8E2] bg-white p-5">
            <p className="text-sm text-[#777F79]">Total Books</p>
            <p className="mt-2 font-serif text-3xl text-[#244C3A]">
              {books.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8E8E2] bg-white p-5">
            <p className="text-sm text-[#777F79]">Total Copies</p>
            <p className="mt-2 font-serif text-3xl text-[#244C3A]">
              {books.reduce((sum, book) => sum + book.totalCopies, 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8E8E2] bg-white p-5">
            <p className="text-sm text-[#777F79]">Available Copies</p>
            <p className="mt-2 font-serif text-3xl text-[#244C3A]">
              {books.reduce((sum, book) => sum + book.availableCopies, 0)}
            </p>
          </div>
        </div>

        {/* Notifications */}
        {message && (
          <div
            role="alert"
            className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={19} className="shrink-0" />
            ) : (
              <AlertCircle size={19} className="shrink-0" />
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

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A918C]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your books by title, author or category..."
              className="w-full rounded-xl border border-[#E8E8E2] bg-white py-4 pl-12 pr-4 text-sm outline-none focus:border-[#244C3A]"
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#244C3A]" size={32} />
            <p className="text-sm text-[#777F79]">Loading your books...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#DCE3DD] bg-white px-6 py-20 text-center">
            <BookOpen className="mx-auto mb-5 text-[#8BA995]" size={48} />

            <h2 className="font-serif text-2xl text-[#244C3A]">
              {search ? "No matching books found" : "No books added yet"}
            </h2>

            <p className="mt-3 text-sm text-[#777F79]">
              {search
                ? "Try searching with another keyword."
                : "Start building your personal library by adding your first book."}
            </p>

            {!search && (
              <button
                onClick={() => router.push("/add-book")}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#244C3A] px-6 py-3 text-sm font-semibold text-white"
              >
                <Plus size={17} />
                Add Your First Book
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <article
                key={book._id}
                className="overflow-hidden rounded-2xl border border-[#E8E8E2] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-64 items-center justify-center bg-[#F1F2ED] p-5">
                  {book.imageUrl ? (
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="h-full max-w-full rounded-lg object-contain"
                    />
                  ) : (
                    <ImageIcon size={48} className="text-[#8BA995]" />
                  )}
                </div>

                <div className="p-5">
                  <span className="rounded-full bg-[#EAF0EB] px-3 py-1 text-xs font-semibold text-[#244C3A]">
                    {book.category}
                  </span>

                  <h2 className="mt-4 line-clamp-1 font-serif text-2xl text-[#244C3A]">
                    {book.title}
                  </h2>

                  <p className="mt-2 text-sm text-[#777F79]">
                    By {book.author}
                  </p>

                  <div className="mt-5 flex justify-between border-t border-[#E8E8E2] pt-4 text-xs text-[#777F79]">
                    <span>Total: {book.totalCopies}</span>
                    <span>Available: {book.availableCopies}</span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => openEditModal(book)}
                      className="flex items-center justify-center gap-2 rounded-lg border border-[#244C3A] py-3 text-sm font-semibold text-[#244C3A] transition hover:bg-[#EAF0EB]"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setDeletingBook(book);
                        setMessage(null);
                      }}
                      className="flex items-center justify-center gap-2 rounded-lg border border-red-200 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingBook && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget && !saving) {
                setEditingBook(null);
              }
            }}
          >
            <div className="my-8 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl md:p-8">
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#8BA995]">
                    Update Collection
                  </p>
                  <h2 className="mt-2 font-serif text-3xl text-[#244C3A]">
                    Edit Book
                  </h2>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setEditingBook(null)}
                  className="rounded-full p-2 text-[#777F79] hover:bg-gray-100"
                  aria-label="Close edit form"
                >
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#526057]">
                    Book Title
                  </label>
                  <input
                    required
                    minLength={2}
                    maxLength={150}
                    value={editForm.title}
                    onChange={(event) =>
                      setEditForm({ ...editForm, title: event.target.value })
                    }
                    className="w-full rounded-xl border border-[#E8E8E2] px-4 py-3 text-sm outline-none focus:border-[#244C3A]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#526057]">
                    Author
                  </label>
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    value={editForm.author}
                    onChange={(event) =>
                      setEditForm({ ...editForm, author: event.target.value })
                    }
                    className="w-full rounded-xl border border-[#E8E8E2] px-4 py-3 text-sm outline-none focus:border-[#244C3A]"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#526057]">
                      Category
                    </label>
                    <select
                      required
                      value={editForm.category}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          category: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-[#E8E8E2] bg-white px-4 py-3 text-sm outline-none focus:border-[#244C3A]"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#526057]">
                      Total Copies
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={10000}
                      step={1}
                      value={editForm.totalCopies}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          totalCopies: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-[#E8E8E2] px-4 py-3 text-sm outline-none focus:border-[#244C3A]"
                    />
                    <p className="mt-1 text-xs text-[#8A918C]">
                      Borrowed copies cannot be removed.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#526057]">
                    Book Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={editForm.imageUrl}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        imageUrl: event.target.value,
                      })
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-[#E8E8E2] px-4 py-3 text-sm outline-none focus:border-[#244C3A]"
                  />
                  <p className="mt-1 text-xs text-[#8A918C]">
                    Paste a new image URL or keep the existing one.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#526057]">
                    Description
                  </label>
                  <textarea
                    required
                    minLength={10}
                    maxLength={3000}
                    rows={5}
                    value={editForm.description}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        description: event.target.value,
                      })
                    }
                    className="w-full resize-y rounded-xl border border-[#E8E8E2] px-4 py-3 text-sm leading-6 outline-none focus:border-[#244C3A]"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setEditingBook(null)}
                    className="rounded-xl border border-[#E8E8E2] px-6 py-3 text-sm font-semibold text-[#526057]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#244C3A] px-7 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Trash2 size={25} />
              </div>

              <h2 className="mt-5 text-center font-serif text-2xl text-[#244C3A]">
                Delete This Book?
              </h2>

              <p className="mt-3 text-center text-sm leading-6 text-[#777F79]">
                Are you sure you want to delete{" "}
                <strong className="text-[#252A27]">{deletingBook.title}</strong>
                ? This action cannot be undone.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeletingBook(null)}
                  className="rounded-xl border border-[#E8E8E2] py-3 text-sm font-semibold text-[#526057]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

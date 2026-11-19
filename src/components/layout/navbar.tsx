"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  UserRound,
  UserCircle,
  Library,
  BookPlus,
  BookMarked,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const user = session?.user;
  const isLoggedIn = !!user;

  const closeMenus = () => {
    setIsProfileOpen(false);
    setIsMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await authClient.signOut();

      closeMenus();
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8E8E2] bg-[#FAF9F6]/95 backdrop-blur-md">
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5">
        {/* Logo */}
        <Link href="/" onClick={closeMenus} className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#244C3A] text-white">
            <BookOpen size={24} />
          </span>

          <span className="font-serif text-2xl font-semibold text-[#244C3A]">
            BookNook<span className="text-[#C5A46D]">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-9 md:flex">
          <Link
            href="/"
            className="text-sm text-[#777F79] transition hover:text-[#244C3A]"
          >
            Home
          </Link>

          <Link
            href="/books"
            className="text-sm text-[#777F79] transition hover:text-[#244C3A]"
          >
            All Books
          </Link>

          {isLoggedIn && (
            <>
              <Link
                href="/add-book"
                className="text-sm text-[#777F79] transition hover:text-[#244C3A]"
              >
                Add Book
              </Link>

              <Link
                href="/my-books"
                className="text-sm text-[#777F79] transition hover:text-[#244C3A]"
              >
                My Books
              </Link>

              <Link
                href="/my-borrows"
                className="text-sm text-[#777F79] transition hover:text-[#244C3A]"
              >
                My Borrows
              </Link>
            </>
          )}
        </div>

        {/* Desktop Auth / Profile */}
        <div className="relative hidden items-center gap-5 md:flex">
          {isPending ? (
            <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
          ) : !isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-[#244C3A] transition hover:text-[#8BA995]"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center gap-3 rounded-xl bg-[#244C3A] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#19392B]"
              >
                Get Started
                <span aria-hidden="true">→</span>
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-expanded={isProfileOpen}
                aria-label="Open profile menu"
                className="flex items-center gap-3 rounded-full border border-[#E8E8E2] bg-white py-2 pl-2 pr-4 transition hover:border-[#244C3A]"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF0EB] text-sm font-semibold text-[#244C3A]">
                    {initials}
                  </span>
                )}

                <span className="max-w-28 truncate text-sm font-semibold text-[#244C3A]">
                  {user.name || "My Account"}
                </span>

                <ChevronDown
                  size={16}
                  className={`text-[#777F79] transition ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border border-[#E8E8E2] bg-white shadow-xl">
                  <div className="border-b border-[#E8E8E2] bg-[#FAF9F6] p-4">
                    <p className="truncate font-semibold text-[#244C3A]">
                      {user.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-[#777F79]">
                      {user.email}
                    </p>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/profile"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-[#526057] transition hover:bg-[#EAF0EB] hover:text-[#244C3A]"
                    >
                      <UserCircle size={18} />
                      My Profile
                    </Link>

                    <Link
                      href="/add-book"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-[#526057] transition hover:bg-[#EAF0EB] hover:text-[#244C3A]"
                    >
                      <BookPlus size={18} />
                      Add Book
                    </Link>

                    <Link
                      href="/my-books"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-[#526057] transition hover:bg-[#EAF0EB] hover:text-[#244C3A]"
                    >
                      <Library size={18} />
                      My Books
                    </Link>

                    <Link
                      href="/my-borrows"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-[#526057] transition hover:bg-[#EAF0EB] hover:text-[#244C3A]"
                    >
                      <BookMarked size={18} />
                      My Borrows
                    </Link>

                    <div className="my-2 border-t border-[#E8E8E2]" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <LogOut size={18} />
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileOpen}
          className="rounded-lg p-2 text-[#244C3A] hover:bg-[#EAF0EB] md:hidden"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMobileOpen && (
        <div className="border-t border-[#E8E8E2] bg-white px-5 py-5 md:hidden">
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={closeMenus}
              className="rounded-lg px-3 py-3 text-sm text-[#526057] hover:bg-[#EAF0EB]"
            >
              Home
            </Link>

            <Link
              href="/books"
              onClick={closeMenus}
              className="rounded-lg px-3 py-3 text-sm text-[#526057] hover:bg-[#EAF0EB]"
            >
              All Books
            </Link>

            {isLoggedIn && (
              <>
                <Link
                  href="/add-book"
                  onClick={closeMenus}
                  className="rounded-lg px-3 py-3 text-sm text-[#526057] hover:bg-[#EAF0EB]"
                >
                  Add Book
                </Link>

                <Link
                  href="/my-books"
                  onClick={closeMenus}
                  className="rounded-lg px-3 py-3 text-sm text-[#526057] hover:bg-[#EAF0EB]"
                >
                  My Books
                </Link>

                <Link
                  href="/my-borrows"
                  onClick={closeMenus}
                  className="rounded-lg px-3 py-3 text-sm text-[#526057] hover:bg-[#EAF0EB]"
                >
                  My Borrows
                </Link>

                <Link
                  href="/profile"
                  onClick={closeMenus}
                  className="rounded-lg px-3 py-3 text-sm text-[#526057] hover:bg-[#EAF0EB]"
                >
                  My Profile
                </Link>

                <div className="my-2 border-t border-[#E8E8E2]" />

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            )}

            {!isPending && !isLoggedIn && (
              <>
                <Link
                  href="/login"
                  onClick={closeMenus}
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-[#244C3A] hover:bg-[#EAF0EB]"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  onClick={closeMenus}
                  className="mt-2 rounded-xl bg-[#244C3A] px-5 py-3.5 text-center text-sm font-semibold text-white"
                >
                  Get Started →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

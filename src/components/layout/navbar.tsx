"use client";

import Link from "next/link";
import { BookOpen, Menu, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "All Books", href: "/books" },
  { label: "Add Book", href: "/add-book" },
  { label: "My Books", href: "/my-books" },
  { label: "My Borrows", href: "/my-borrows" },
];

export default function Navbar() {
  // Temporary UI state. Better Auth integration will replace this.
  const isLoggedIn = false;

  const visibleLinks = isLoggedIn
    ? navigationLinks
    : navigationLinks.slice(0, 2);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <nav className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between px-5 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpen size={22} strokeWidth={1.8} />
          </span>

          <span className="font-heading text-[27px] font-semibold tracking-tight">
            BookNook<span className="text-accent">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-7 lg:flex">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-primary transition-colors hover:text-accent"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <Link
              href="/profile"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-primary hover:bg-secondary"
            >
              My Account
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation"
                >
                  <Menu size={23} />
                </Button>
              }
            />

            <SheetContent side="right" className="w-[300px] bg-background">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 font-heading text-2xl">
                  <BookOpen className="text-primary" />
                  BookNook
                </SheetTitle>
              </SheetHeader>

              <div className="mt-8 flex flex-col gap-2 px-4">
                {visibleLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="my-3 border-t border-border" />

                {!isLoggedIn && (
                  <>
                    <Link
                      href="/login"
                      className="rounded-lg px-4 py-3 text-sm font-semibold text-primary hover:bg-secondary"
                    >
                      Sign In
                    </Link>

                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Get Started
                      <ArrowRight size={16} />
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

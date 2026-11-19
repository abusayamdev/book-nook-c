import Link from "next/link";
import { BookOpen, Mail, MapPin, ArrowUpRight } from "lucide-react";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "All Books", href: "/books" },
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
];

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/" },
  { label: "Instagram", href: "https://www.instagram.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "X", href: "https://x.com/" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-[1280px] px-5 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <BookOpen size={22} />
              </span>

              <span className="font-heading text-3xl font-semibold">
                BookNook<span className="text-accent">.</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">
              Discover your next great read, borrow meaningful stories, and
              become part of a community that loves books.
            </p>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {social.label}
                  <ArrowUpRight size={12} className="ml-1 inline-block" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-xl font-semibold text-foreground">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-xl font-semibold text-foreground">
              Contact Us
            </h3>

            <div className="mt-5 space-y-4">
              <a
                href="mailto:hello@booknook.com"
                className="flex items-start gap-3 text-sm leading-6 text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail size={17} className="mt-1 shrink-0 text-primary" />
                hello@booknook.com
              </a>

              <p className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                <MapPin size={17} className="mt-1 shrink-0 text-primary" />A
                community for book lovers everywhere.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-border pt-6">
          <p className="text-center text-xs text-muted-foreground">
            © 2026 BookNook. All rights reserved. Made with care for book
            lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}

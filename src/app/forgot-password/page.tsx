import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E8E8E2] bg-white p-8 shadow-sm">
        <h1 className="font-serif text-3xl text-[#244C3A]">Forgot Password?</h1>

        <p className="mt-3 text-sm text-gray-500">
          Password recovery is currently unavailable. Please contact the
          BookNook support team for assistance.
        </p>

        <Link
          href="/login"
          className="mt-6 block rounded-lg bg-[#244C3A] p-3 text-center font-medium text-white"
        >
          Back to Login
        </Link>
      </div>
    </main>
  );
}

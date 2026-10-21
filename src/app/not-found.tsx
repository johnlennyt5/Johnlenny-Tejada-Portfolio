import Link from "next/link";
import { routes } from "@/lib/site";
import "./globals.css";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-xl px-4 py-24">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-4">This page does not exist, or it moved.</p>
      <p className="mt-6">
        <Link href={routes.root} className="underline underline-offset-4">
          Go to the home page
        </Link>
      </p>
    </main>
  );
}

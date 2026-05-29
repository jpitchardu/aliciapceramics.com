import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-stone-100 border-t border-stone-200 py-4 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center text-sm text-stone-600">
          <span>© {new Date().getFullYear()} Alicia P Ceramics</span>
          <span className="mx-3">•</span>
          <Link
            href="/privacy"
            className="hover:text-earth-dark transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[1600px] flex-col items-start px-5 py-24 md:px-10">
      <p className="display text-[24vw] text-accent md:text-[14vw]">404</p>
      <p className="mt-4 text-xl">This page wandered off the mood board.</p>
      <Link
        href="/"
        className="mono-label mt-8 inline-block border rule rounded-full px-5 py-3 transition-colors hover:bg-ink hover:text-bg"
      >
        ← Back home
      </Link>
    </div>
  );
}

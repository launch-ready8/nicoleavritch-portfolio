import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[1600px] flex-col items-start px-5 py-24 md:px-10">
      <p className="display text-[24vw] text-accent md:text-[14vw]">404</p>
      <p className="mt-4 text-xl">This page wandered off the mood board.</p>
      <Link href="/" className="stamp-btn mt-8">
        ← Back home
      </Link>
    </div>
  );
}

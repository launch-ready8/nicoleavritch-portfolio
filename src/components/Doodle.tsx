"use client";

import { motion } from "framer-motion";

/** Hand-drawn orange doodles that draw themselves in on scroll — the site's personality thread. */

const PATHS: Record<string, { d: string[]; box?: string }> = {
  scribble: {
    d: ["M4 62 C18 18, 26 78, 40 36 C50 10, 56 70, 70 30 C80 8, 86 58, 96 24"],
  },
  smiley: {
    d: ["M50 8 a42 42 0 1 0 0.1 0", "M34 40 l0.1 4", "M66 40 l0.1 4", "M30 60 Q50 80 70 60"],
  },
  heart: {
    d: ["M50 82 C12 52 22 14 50 34 C78 14 88 52 50 82"],
  },
  star: {
    d: ["M50 6 L59 38 L92 38 L65 57 L75 90 L50 70 L25 90 L35 57 L8 38 L41 38 Z"],
  },
  chevrons: {
    d: ["M28 20 L50 40 L72 20", "M28 52 L50 72 L72 52"],
  },
  arrowCircle: {
    d: ["M50 6 a44 44 0 1 0 0.1 0", "M32 50 H66", "M54 36 L70 50 L54 64"],
  },
  loop: {
    d: ["M36 8 C76 22 18 42 52 54 C78 63 60 84 44 92"],
  },
};

export default function Doodle({
  name,
  className = "",
  delay = 0,
  strokeWidth = 5,
}: {
  name: keyof typeof PATHS;
  className?: string;
  delay?: number;
  strokeWidth?: number;
}) {
  const doodle = PATHS[name] || PATHS.scribble;
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden>
      {doodle.d.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: delay + i * 0.25, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

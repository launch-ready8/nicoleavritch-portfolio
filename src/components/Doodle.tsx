"use client";

import { motion } from "framer-motion";

/** Hand-drawn orange doodles that draw themselves in on scroll. */

const PATHS: Record<string, string[]> = {
  scribble: ["M4 62 C18 18, 26 78, 40 36 C50 10, 56 70, 70 30 C80 8, 86 58, 96 24"],
  smiley: ["M50 8 a42 42 0 1 0 0.1 0", "M34 40 l0.1 4", "M66 40 l0.1 4", "M30 60 Q50 80 70 60"],
  chevrons: ["M28 20 L50 40 L72 20", "M28 52 L50 72 L72 52"],
  arrowCircle: ["M50 6 a44 44 0 1 0 0.1 0", "M32 50 H66", "M54 36 L70 50 L54 64"],
  // paw print: four toes + pad
  paw: [
    "M30 32 a8 10 0 1 0 0.1 0",
    "M50 24 a8 10 0 1 0 0.1 0",
    "M70 32 a8 10 0 1 0 0.1 0",
    "M50 78 C30 78 26 62 38 54 C46 48 54 48 62 54 C74 62 70 78 50 78 Z",
  ],
  // peach with leaf and crease
  peach: [
    "M50 30 C22 26 16 62 34 78 C44 87 56 87 66 78 C84 62 78 26 50 30 Z",
    "M50 32 C46 48 46 62 50 80",
    "M52 28 C56 14 68 12 74 16 C70 26 60 30 52 28 Z",
  ],
  // spark / four-point star
  spark: ["M50 6 C54 34 58 40 88 50 C58 60 54 66 50 94 C46 66 42 60 12 50 C42 40 46 34 50 6 Z"],
  // playful bone
  bone: [
    "M28 42 a9 9 0 1 0 6 -14 a9 9 0 1 0 -14 6 L62 76 a9 9 0 1 0 14 -6 a9 9 0 1 0 -6 14 Z",
  ],
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
  const d = PATHS[name] || PATHS.scribble;
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden>
      {d.map((p, i) => (
        <motion.path
          key={i}
          d={p}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: delay + i * 0.22, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

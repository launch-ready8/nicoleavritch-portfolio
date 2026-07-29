"use client";

import { motion } from "framer-motion";

/** Orange ellipse around the first tagline line — draws itself in on load
 *  so it reads as an intentional gesture, not a static decoration. */
export default function HeroEllipse() {
  return (
    <svg
      className="pointer-events-none absolute -inset-x-[4%] -inset-y-[16%] h-[132%] w-[108%] overflow-visible text-accent"
      viewBox="0 0 300 100"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
    >
      <motion.ellipse
        cx="150"
        cy="50"
        rx="146"
        ry="45"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 1.1, delay: 0.55, ease: [0.65, 0, 0.35, 1] },
          opacity: { duration: 0.01, delay: 0.55 },
        }}
      />
    </svg>
  );
}

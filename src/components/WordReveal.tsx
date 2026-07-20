"use client";

import { motion } from "framer-motion";

/** Paragraph whose words fade from ghost-gray to ink as it enters view — the Julie Freund text move. */
export default function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(/\s+/);
  return (
    <p className={className}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0.18 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
          transition={{ duration: 0.4, delay: (i / words.length) * 0.9, ease: "easeOut" }}
        >
          {w}{" "}
        </motion.span>
      ))}
    </p>
  );
}

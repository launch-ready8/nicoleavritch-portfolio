"use client";

import { motion } from "framer-motion";

/** CMS text recomposed as a staggered manifesto: uppercase grotesque lines
 *  stepping across the page, revealed line by line. */
const INDENTS = ["0%", "9%", "20%", "11%", "5%"];

export default function ManifestoText({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(/\s+/);
  const perLine = Math.max(3, Math.ceil(words.length / Math.min(4, Math.ceil(words.length / 4))));
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += perLine) lines.push(words.slice(i, i + perLine).join(" "));

  return (
    <p className={`uppercase leading-[1.06] tracking-[-0.015em] ${className}`} style={{ fontWeight: 640 }}>
      {lines.map((line, i) => (
        <motion.span
          key={i}
          className="block"
          style={{ paddingLeft: INDENTS[i % INDENTS.length] }}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          {line}
        </motion.span>
      ))}
    </p>
  );
}

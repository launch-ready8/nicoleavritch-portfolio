"use client";

import { motion } from "framer-motion";

type Part = { str: string; url?: string };

/* split "text with [label](url) links" into plain and linked parts */
function parseLinks(text: string): Part[] {
  return text.split(/(\[[^\]]+\]\([^)\s]+\))/g).map((chunk) => {
    const m = chunk.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    return m ? { str: m[1], url: m[2] } : { str: chunk };
  });
}

/** Paragraph whose words fade from ghost-gray to ink as it enters view — the
 *  Julie Freund text move. Supports inline [label](url) links, so linked
 *  guest names etc. survive even inside the animated intro. */
export default function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const parts = parseLinks(text);
  const total = parts.reduce((n, p) => n + p.str.split(/\s+/).filter(Boolean).length, 0) || 1;
  let i = 0;

  const renderWords = (str: string) =>
    str
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => {
        const idx = i++;
        return (
          <motion.span
            key={idx}
            initial={{ opacity: 0.18 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
            transition={{ duration: 0.4, delay: (idx / total) * 0.9, ease: "easeOut" }}
          >
            {w}{" "}
          </motion.span>
        );
      });

  return (
    <p className={className}>
      {parts.map((p, k) =>
        p.url ? (
          <a key={`l-${k}`} href={p.url} target="_blank" rel="noreferrer" className="text-link">
            {renderWords(p.str)}
          </a>
        ) : (
          <span key={`t-${k}`}>{renderWords(p.str)}</span>
        )
      )}
    </p>
  );
}

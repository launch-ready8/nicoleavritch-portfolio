"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Round custom cursor (publicrecords.nyc-style): a white dot in difference
 *  blend, so it reads dark on the paper ground and light on the black footer.
 *  Grows over links/buttons, shrinks on press. Mouse/trackpad screens only —
 *  touch devices never see it, and the native cursor is hidden via CSS. */
export default function CursorDot() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const onStudio = pathname?.startsWith("/studio");

  useEffect(() => {
    const el = ref.current;
    if (!el || onStudio) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    document.documentElement.classList.add("cursor-dot-on");

    const move = (e: MouseEvent) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      el.style.opacity = "1";
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      el.classList.toggle("is-link", !!t?.closest("a, button, [role='button'], .cursor-zoom-in"));
    };
    const down = () => el.classList.add("is-down");
    const up = () => el.classList.remove("is-down");
    const leave = () => (el.style.opacity = "0");

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      document.documentElement.classList.remove("cursor-dot-on");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [onStudio]);

  if (onStudio) return null;
  return (
    <div ref={ref} className="cursor-dot" aria-hidden>
      <span />
    </div>
  );
}

"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SELECTOR = "[data-reveal], [data-split], [data-wipe]";

/** Groups the words of a SplitText heading into visual lines so each line rises in turn. */
function assignLines(el: Element) {
  let line = -1;
  let lastTop = -Infinity;
  el.querySelectorAll<HTMLElement>(":scope > .split-line").forEach((w) => {
    if (Math.abs(w.offsetTop - lastTop) > 4) {
      line++;
      lastTop = w.offsetTop;
    }
    w.style.setProperty("--line", String(line));
  });
}

/** Adds .is-visible to reveal targets (fade/slide, line-by-line headings, gold wipes) as they scroll into view. */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            if (e.target.hasAttribute("data-split")) assignLines(e.target);
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = () => document.querySelectorAll(`:is(${SELECTOR}):not(.is-visible)`).forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);
  return null;
}

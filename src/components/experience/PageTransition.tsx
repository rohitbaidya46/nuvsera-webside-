"use client";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/site/Logo";

/**
 * Fade-through-black between pages with a pulsing crest. Internal link clicks are intercepted, the overlay
 * fades in, the route changes, and the overlay fades out once the new page has rendered. Modifier-clicks,
 * new tabs, downloads, hash links and reduced-motion visitors get normal navigation.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const pending = useRef<string | null>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname.startsWith("/admin") || url.pathname.startsWith("/api") || url.pathname.startsWith("/media")) return;
      if (url.pathname === location.pathname) return; // same page (incl. #hash links)
      e.preventDefault();
      pending.current = url.pathname + url.search + url.hash;
      setActive(true);
      window.setTimeout(() => router.push(pending.current!), 380);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => setActive(false), 250);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Safety net: never leave the overlay up (e.g. a navigation that failed).
  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => setActive(false), 4000);
    return () => window.clearTimeout(id);
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="transition"
          aria-hidden
          className="fixed inset-0 z-[95] flex items-center justify-center bg-navy"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="crest-pulse"><LogoMark className="h-20 w-20" /></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

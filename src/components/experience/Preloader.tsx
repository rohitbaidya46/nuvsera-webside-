import { LogoMark } from "@/components/site/Logo";
import { PreloaderCounter } from "./PreloaderCounter";

/**
 * First-visit intro: the gold crest draws itself with a % counter. The fade-out is pure CSS (finished by
 * 2.45 s), so the page is never held hostage by JavaScript. Skipped on later pages of the same visit and
 * under reduced motion.
 */
export function Preloader() {
  return (
    <div className="preloader fixed inset-0 z-[90] flex flex-col items-center justify-center bg-navy" aria-hidden>
      <LogoMark draw className="h-28 w-28" />
      <p className="mt-6 font-display text-sm tracking-[0.5em] text-ivory/90">NUVSERA</p>
      <PreloaderCounter />
    </div>
  );
}

"use client";
/** Loads GSAP + ScrollTrigger on demand (keeps them out of the first-paint bundle). */
export async function loadGsap() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}

"use client";
import dynamic from "next/dynamic";

/** The interaction layer (GSAP, Lenis, Framer Motion, cursor, canvas) loads after first paint, off the critical path. */
export const LazyExperienceLayer = dynamic(() => import("./ExperienceLayer").then((m) => m.ExperienceLayer), { ssr: false });

"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { newControl } from "./control";
import type { ModelKey } from "./Scene";
import type { OrbitIcon } from "./models/TechOrbit";
import { getQuality, useViewsReady, type Quality } from "./state";

const Inner = dynamic(() => import("./ModelViewInner"), { ssr: false });

/**
 * A 3D model placed in the page flow. Shows a pre-rendered still until the model is near the viewport and the
 * shared canvas is ready (lazy-loaded below the fold); visitors with reduced motion, Save-Data or no WebGL keep
 * the still image.
 */
export function ModelView({ model, url, className = "", alt, scrollKey, icons, z, eager = false }: { model: ModelKey; url?: string; className?: string; alt: string; scrollKey?: string; icons?: OrbitIcon[]; z?: number; /** Load the still immediately (near the top of the page). */ eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [quality, setQuality] = useState<Quality | null>(null);
  const [near, setNear] = useState(false);
  const ready = useViewsReady();
  const control = useRef(newControl()).current;
  const drag = useRef({ x: 0, y: 0, moved: 0, id: -1 });

  // Hover: tilt toward the cursor. Drag: spin (horizontal) and tilt (vertical), with inertia on release.
  // Click without dragging: a quick spin. Neither a drag nor a click on the model follows the surrounding link.
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    control.hx = ((e.clientX - r.left) / r.width) * 2 - 1;
    control.hy = ((e.clientY - r.top) / r.height) * 2 - 1;
    control.hover = true;
    if (!control.dragging || e.pointerId !== drag.current.id) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
    drag.current.moved += Math.abs(dx) + Math.abs(dy);
    control.ry += dx * 0.012;
    control.rx = Math.max(-0.8, Math.min(0.8, control.rx + dy * 0.008));
    control.vy = dx * 0.012;
  };
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, moved: 0, id: e.pointerId };
    control.dragging = true;
    control.vy = 0;
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== drag.current.id) return;
    control.dragging = false;
    drag.current.id = -1;
  };
  const onClickCapture = (e: React.MouseEvent) => {
    // The model itself is a toy: clicks spin it and never follow a surrounding card link
    // (the card's title and "Explore" link still navigate).
    e.preventDefault();
    e.stopPropagation();
    if (drag.current.moved <= 6) control.vy = 0.32;
    drag.current.moved = 0;
  };
  useEffect(() => setQuality(getQuality()), []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: "400px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const live = !!quality && quality !== "off" && near && ready;
  return (
    <div
      ref={ref}
      className={`relative select-none touch-pan-y ${className}`}
      data-cursor={live ? "Drag" : undefined}
      onPointerMove={live ? onPointerMove : undefined}
      onPointerLeave={() => ((control.hover = false), (control.dragging = false))}
      onPointerDown={live ? onPointerDown : undefined}
      onPointerUp={live ? endDrag : undefined}
      onPointerCancel={live ? endDrag : undefined}
      onClickCapture={live ? onClickCapture : undefined}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/3d/${model}.webp`}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 ${live ? "opacity-0" : "opacity-100"}`}
      />
      {live && <Inner model={model} quality={quality} url={url} scrollKey={scrollKey} icons={icons} z={z} control={control} />}
      {live && <span className="sr-only">{alt}</span>}
    </div>
  );
}

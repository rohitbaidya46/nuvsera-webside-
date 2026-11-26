"use client";
import { useEffect, useRef, useState } from "react";
import { Maximize2, Pause, Play, RotateCcw } from "lucide-react";

export type Chapter = { t: number; label: string };

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * Brand-film player in the Royal Crest style: poster with a gold play button, a thin gold progress line,
 * and chapter buttons that jump to each part of the film. The video is only downloaded once played.
 */
export function FilmPlayer({ src, poster, chapters, title }: { src: string; poster: string; chapters: Chapter[]; title: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(26.5);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const onTime = () => setTime(v.currentTime);
    const onMeta = () => Number.isFinite(v.duration) && setDuration(v.duration);
    const onPlay = () => (setPlaying(true), setEnded(false));
    const onPause = () => setPlaying(false);
    const onEnd = () => (setPlaying(false), setEnded(true));
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnd);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnd);
    };
  }, []);

  const play = (at?: number) => {
    const v = video.current;
    if (!v) return;
    setStarted(true);
    if (at !== undefined) v.currentTime = at;
    v.play().catch(() => {});
  };
  const toggle = () => (video.current?.paused ? play(ended ? 0 : undefined) : video.current?.pause());
  const seek = (e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
    const v = video.current;
    if (!v) return;
    if ("key" in e) {
      if (e.key === "ArrowRight") v.currentTime = Math.min(duration, v.currentTime + 2);
      else if (e.key === "ArrowLeft") v.currentTime = Math.max(0, v.currentTime - 2);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - r.left) / r.width) * duration;
  };
  const active = [...chapters].reverse().find((c) => time >= c.t - 0.05)?.label;

  return (
    <div>
      <div className="group relative overflow-hidden rounded-[2rem] border border-gold/30 bg-navy shadow-[0_40px_120px_-40px_rgba(227,169,59,0.35)]">
        {/* Corner frame marks */}
        {["left-4 top-4 border-l border-t", "right-4 top-4 border-r border-t", "bottom-4 left-4 border-b border-l", "bottom-4 right-4 border-b border-r"].map((c) => (
          <span key={c} aria-hidden className={`pointer-events-none absolute z-10 h-6 w-6 border-gold/70 ${c}`} />
        ))}
        <video
          ref={video}
          src={src}
          poster={poster}
          preload="none"
          playsInline
          muted
          aria-label={title}
          className="block aspect-video w-full cursor-pointer bg-navy object-cover"
          onClick={toggle}
        />

        {/* Poster overlay */}
        {!started && (
          <button
            type="button"
            onClick={() => play()}
            data-cursor="Play"
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent"
            aria-label={`Play: ${title}`}
          >
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 via-gold to-gold-700 text-navy shadow-[0_0_60px_rgba(227,169,59,0.55)] transition duration-500 group-hover:scale-110 sm:h-24 sm:w-24">
              <span aria-hidden className="absolute inset-0 animate-ping rounded-full border border-gold/60 [animation-duration:2.4s]" />
              <Play className="ml-1 h-8 w-8 fill-current" aria-hidden />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-ivory/90">Watch the film · {fmt(duration)}</span>
          </button>
        )}

        {/* Controls */}
        {started && (
          <div className={`absolute inset-x-0 bottom-0 flex items-center gap-4 bg-gradient-to-t from-navy/90 to-transparent px-5 pb-4 pt-10 transition-opacity duration-500 sm:px-8 ${playing ? "opacity-0 group-hover:opacity-100 focus-within:opacity-100" : "opacity-100"}`}>
            <button type="button" onClick={toggle} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold hover:bg-gold hover:text-navy" aria-label={playing ? "Pause" : ended ? "Replay" : "Play"}>
              {playing ? <Pause className="h-4 w-4" aria-hidden /> : ended ? <RotateCcw className="h-4 w-4" aria-hidden /> : <Play className="ml-0.5 h-4 w-4" aria-hidden />}
            </button>
            <div
              role="slider"
              tabIndex={0}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(time)}
              aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
              onClick={seek}
              onKeyDown={seek}
              className="relative h-6 flex-1 cursor-pointer"
            >
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/20" />
              <div className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-gold-700 via-gold to-gold-300" style={{ width: `${(time / duration) * 100}%` }} />
              {chapters.slice(1).map((c) => (
                <span key={c.t} aria-hidden className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-ivory/40" style={{ left: `${(c.t / duration) * 100}%` }} />
              ))}
            </div>
            <span className="shrink-0 font-mono text-xs tabular-nums text-ivory/80">{fmt(time)} / {fmt(duration)}</span>
            <button type="button" onClick={() => video.current?.requestFullscreen?.()} className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-ivory/80 hover:text-gold sm:flex" aria-label="Full screen">
              <Maximize2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </div>

      {/* Chapters */}
      <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {chapters.map((c, i) => (
          <li key={c.t}>
            <button
              type="button"
              onClick={() => play(c.t)}
              className={`w-full rounded-xl border px-3 py-3 text-left transition ${started && active === c.label ? "border-gold/60 bg-gold/[0.08]" : "border-white/[0.07] hover:border-gold/40"}`}
            >
              <span className="block font-display text-[11px] tracking-[0.2em] text-gold">{String(i + 1).padStart(2, "0")} · {fmt(c.t)}</span>
              <span className="mt-1 block text-sm text-ivory">{c.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

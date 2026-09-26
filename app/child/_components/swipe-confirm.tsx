"use client";

import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

const KNOB = 48;
const PAD = 4;
const THRESHOLD = 0.85;

/**
 * "Přejeď, až bude hotovo" — drag the knob to the end to confirm (návrh 2, pen `CheckRow E`).
 * Protects against accidental taps; keyboard users confirm with Enter / Space on the knob.
 */
export function SwipeConfirm({
  label,
  onConfirm,
  disabled = false,
}: {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const start = useRef<number | null>(null);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [maxX, setMaxX] = useState(0);

  const measure = () => {
    const m = Math.max(0, (trackRef.current?.clientWidth ?? 0) - KNOB - PAD * 2);
    setMaxX(m);
    return m;
  };

  const confirm = () => {
    setX(measure());
    onConfirm();
  };

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    measure();
    start.current = e.clientX - x;
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (start.current === null) return;
    setX(Math.min(maxX, Math.max(0, e.clientX - start.current)));
  };
  const onPointerUp = () => {
    if (start.current === null) return;
    start.current = null;
    setDragging(false);
    if (maxX > 0 && x >= maxX * THRESHOLD) confirm();
    else setX(0);
  };

  const progress = maxX > 0 ? x / maxX : 0;

  return (
    <div
      ref={trackRef}
      className="relative flex h-14 items-center rounded-full bg-muted p-1 select-none"
    >
      <span
        className="pointer-events-none absolute inset-x-14 text-center text-[15px] font-semibold text-muted-foreground"
        style={{ opacity: 1 - progress }}
      >
        {label}
      </span>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            confirm();
          }
        }}
        className="relative z-10 flex size-12 touch-none items-center justify-center rounded-full bg-primary text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        style={{
          transform: `translateX(${x}px)`,
          transition: dragging ? "none" : "transform 200ms ease-out",
        }}
      >
        <ArrowRight className="size-[22px]" />
      </button>
    </div>
  );
}

type Tone = "warning" | "success" | "danger";

const TONE: Record<Tone, { track: string; text: string; knob: string }> = {
  warning: { track: "bg-warning-soft", text: "text-warning", knob: "bg-warning" },
  success: { track: "bg-success-soft", text: "text-success", knob: "bg-success" },
  danger: { track: "bg-danger-soft", text: "text-destructive", knob: "bg-destructive" },
};

/** Finished slider: state label + knob parked on the right (čeká / schváleno / zmeškáno). */
export function SliderState({
  tone,
  label,
  icon,
}: {
  tone: Tone;
  label: string;
  icon: React.ReactNode;
}) {
  const t = TONE[tone];
  return (
    <div className={`flex h-14 items-center rounded-full p-1 ${t.track}`}>
      <span className={`flex-1 text-center text-[15px] font-semibold ${t.text}`}>
        {label}
      </span>
      <span
        className={`flex size-12 items-center justify-center rounded-full text-card ${t.knob}`}
      >
        {icon}
      </span>
    </div>
  );
}

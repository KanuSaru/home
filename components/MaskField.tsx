"use client";

import { useEffect, useRef } from "react";

// A field of pixels with a blue segmentation mask that slowly changes shape
// and follows the pointer. On touch screens it drifts on its own and follows
// a drag. With reduced motion it draws one still frame.

const SPACING = 12; // css px between pixel centres

export function MaskField({ note, noteTouch }: { note: string; noteTouch: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = wrap.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let R = 0;
    let colors = { blue: "#1f3fff", dot: "#d0d0d0" };
    const pos = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let lastPointer = -Infinity;
    let visible = true;
    let frame = 0;
    let started = false;

    const readColors = () => {
      const cs = getComputedStyle(box);
      colors = {
        blue: cs.getPropertyValue("--blue").trim() || colors.blue,
        dot: cs.getPropertyValue("--dot").trim() || colors.dot,
      };
    };

    const clampTarget = (x: number, y: number) => {
      // keep the whole shape inside the field (its radius peaks near 1.26 R)
      const mx = R * 1.3 + 4;
      const my = R * 1.3 / 1.15 + 4;
      target.x = Math.max(mx, Math.min(w - mx, x));
      target.y = Math.max(my, Math.min(h - my, y));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = box.clientWidth;
      h = box.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(w, h) * 0.3;
      if (!started) {
        pos.x = target.x = w * 0.62;
        pos.y = target.y = h * 0.5;
        clampTarget(target.x, target.y);
        pos.x = target.x;
        pos.y = target.y;
        started = true;
      }
      if (still) draw(0);
    };

    const radius = (a: number, t: number) =>
      R *
      (1 +
        0.15 * Math.sin(3 * a + 0.6 * t) +
        0.07 * Math.cos(5 * a - 0.45 * t + 1.3) +
        0.04 * Math.sin(7 * a + 0.3 * t));

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const cols = Math.floor(w / SPACING);
      const rows = Math.floor(h / SPACING);
      const ox = (w - (cols - 1) * SPACING) / 2;
      const oy = (h - (rows - 1) * SPACING) / 2;
      const maxR = R * 1.3;

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = ox + i * SPACING;
          const y = oy + j * SPACING;
          const dx = x - pos.x;
          const dy = (y - pos.y) * 1.15;
          const d = Math.hypot(dx, dy);
          if (d < maxR && d <= radius(Math.atan2(dy, dx), t)) {
            ctx.fillStyle = colors.blue;
            ctx.fillRect(x - 3, y - 3, 6, 6);
          } else {
            ctx.fillStyle = colors.dot;
            ctx.fillRect(x - 1, y - 1, 2, 2);
          }
        }
      }

      ctx.beginPath();
      for (let k = 0; k <= 120; k++) {
        const a = (k / 120) * Math.PI * 2;
        const r = radius(a, t);
        const px = pos.x + r * Math.cos(a);
        const py = pos.y + (r * Math.sin(a)) / 1.15;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = colors.blue;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke();
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "touch" && e.target !== canvas) return;
      const rect = box.getBoundingClientRect();
      clampTarget(e.clientX - rect.left, e.clientY - rect.top);
      lastPointer = performance.now();
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      const t = now / 1000;
      if (now - lastPointer > 2500) {
        // drift slowly when nobody is pointing
        clampTarget(
          w * (0.55 + 0.25 * Math.sin(t * 0.21)),
          h * (0.5 + 0.22 * Math.sin(t * 0.33 + 1)),
        );
      }
      pos.x += (target.x - pos.x) * 0.06;
      pos.y += (target.y - pos.y) * 0.06;
      draw(t);
    };

    readColors();
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      readColors();
      if (still) draw(0);
    };
    scheme.addEventListener("change", onScheme);
    // also follow a theme set on <html data-theme="…">
    const mo = new MutationObserver(onScheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });

    let io: IntersectionObserver | undefined;
    if (!still) {
      io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
      io.observe(box);
      window.addEventListener("pointermove", onPointer, { passive: true });
      canvas.addEventListener("pointerdown", onPointer, { passive: true });
      frame = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io?.disconnect();
      scheme.removeEventListener("change", onScheme);
      mo.disconnect();
      window.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <figure className="field">
      <div className="field-canvas" ref={wrap}>
        <canvas ref={canvasRef} aria-hidden="true" />
      </div>
      <figcaption>
        <span className="note-pointer">{note}</span>
        <span className="note-touch">{noteTouch}</span>
      </figcaption>
    </figure>
  );
}

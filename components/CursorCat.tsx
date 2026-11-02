"use client";

// Neko chases the cursor around the screen, the classic way. When it catches up and
// the cursor stays put, it sits, now and then scratches itself (or the edge of the
// screen), and after a while yawns and falls asleep. Moving the cursor wakes it up.
//
// The cat is the classic Neko (the 1989 desktop pet), from oneko.js by adryd
// (github.com/adryd325/oneko.js, MIT): public/oneko.gif, 32×32 frames. The behavior is
// this site's own; only the drawing and its frame positions come from there.
//
// Only on screens with a mouse; on touch screens there's no cursor to follow.
// With reduced motion it stays asleep where it starts.

import { useEffect, useRef } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SCALE = 1; // screen pixels per drawing pixel; the classic size
const SIZE = 32 * SCALE;
const SPEED = 100; // px per second, like the original
const CLOSE = 48; // close enough: it stops here
const MARGIN = 12;

type Frame = [col: number, row: number];
// where each frame sits in oneko.gif (column, row), as in oneko.js
const F = {
  idle: [3, 3] as Frame,
  alert: [7, 3] as Frame,
  tired: [3, 2] as Frame,
  sleep: [[2, 0], [2, 1]] as Frame[],
  scratch: [[5, 0], [6, 0], [7, 0], [6, 0]] as Frame[],
};
const WALK: Record<string, Frame[]> = {
  N: [[1, 2], [1, 3]],
  NE: [[0, 2], [0, 3]],
  E: [[3, 0], [3, 1]],
  SE: [[5, 1], [5, 2]],
  S: [[6, 3], [7, 2]],
  SW: [[5, 3], [6, 1]],
  W: [[4, 2], [4, 3]],
  NW: [[1, 0], [1, 1]],
};
const WALL: Record<string, Frame[]> = {
  N: [[0, 0], [0, 1]],
  S: [[7, 1], [6, 2]],
  E: [[2, 2], [2, 3]],
  W: [[4, 0], [4, 1]],
};

type Mode = "sleep" | "alert" | "scratch" | "walk" | "idle" | "tired" | "wall";

export function CursorCat() {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches) return;

    const img = new Image();
    img.src = `${BASE}/oneko.gif`;
    let ready = false;
    img.onload = () => {
      ready = true;
      node.style.backgroundImage = `url("${img.src}")`;
      node.hidden = false;
      raf = requestAnimationFrame(tick);
    };

    // where it walks to: the cursor, with the cat's feet just under it
    const home = () => ({ x: MARGIN + SIZE / 2, y: innerHeight - MARGIN - SIZE / 2 });
    const cat = { ...home() };
    const mouse = { x: -1e4, y: -1e4, seen: false };
    let mode: Mode = "sleep";
    let timer = 0; // seconds in this mode
    let wait = 0; // how long this mode lasts
    let dir = "E";
    let raf = 0;
    let last = 0;

    const set = (m: Mode, seconds = 0) => {
      mode = m;
      timer = 0;
      wait = seconds;
    };
    const clamp = (p: { x: number; y: number }) => ({
      x: Math.min(innerWidth - MARGIN - SIZE / 2, Math.max(MARGIN + SIZE / 2, p.x)),
      y: Math.min(innerHeight - MARGIN - SIZE / 2, Math.max(MARGIN + SIZE / 2, p.y)),
    });

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.seen = true;
    };
    const onResize = () => Object.assign(cat, clamp(cat));
    const onLeave = () => {
      mouse.seen = false;
    };

    function frameFor(): Frame {
      const t = timer;
      const step = Math.floor(t * 4) % 2; // legs, 4 times a second
      if (mode === "sleep") return F.sleep[Math.floor(t / 0.9) % 2];
      if (mode === "alert") return F.alert;
      if (mode === "tired") return F.tired;
      if (mode === "idle") return F.idle;
      if (mode === "scratch") return F.scratch[Math.floor(t * 6) % 4];
      if (mode === "wall") return (WALL[dir.length === 1 ? dir : dir[1]] ?? WALL.E)[step];
      return WALK[dir][step];
    }

    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      timer += dt;
      const calm = reduced.matches;

      const dx = mouse.x - cat.x, dy = mouse.y - cat.y, d = Math.hypot(dx, dy);
      const far = mouse.seen && d >= CLOSE && !calm;

      if (far && mode !== "alert" && mode !== "walk") {
        // something to chase: if it was resting, it notices first
        if (mode === "idle" && timer < 0.4) set("walk");
        else set("alert", 0.6);
      } else if (mode === "alert") {
        if (timer > wait) set(far ? "walk" : "idle");
      } else if (mode === "walk") {
        if (!far) set("idle");
        else {
          const a = Math.atan2(-dy, dx); // up is north
          dir = ["E", "NE", "N", "NW", "W", "SW", "S", "SE"][(Math.round(a / (Math.PI / 4)) + 8) % 8];
          const s = Math.min(d - CLOSE / 2, SPEED * dt);
          Object.assign(cat, clamp({ x: cat.x + (dx / d) * s, y: cat.y + (dy / d) * s }));
        }
      } else if (mode === "idle") {
        // caught up: after a little while, it finds something to do
        if (timer > 2 && Math.random() < dt * 0.35) {
          const edge =
            cat.x < MARGIN + SIZE ? "W" : cat.x > innerWidth - MARGIN - SIZE ? "E" : cat.y < MARGIN + SIZE ? "N" : cat.y > innerHeight - MARGIN - SIZE ? "S" : "";
          const r = Math.random();
          if (r < 0.45) set("tired", 1.6);
          else if (edge && r < 0.75) {
            dir = edge;
            set("wall", 2);
          } else set("scratch", 1.6);
        }
      } else if (mode === "scratch" || mode === "wall") {
        if (timer > wait) set("idle");
      } else if (mode === "tired") {
        if (timer > wait) set("sleep");
      }

      const f = frameFor();
      node!.style.transform = `translate3d(${Math.round(cat.x - SIZE / 2)}px, ${Math.round(cat.y - SIZE / 2)}px, 0)`;
      node!.style.backgroundPosition = `${-f[0] * SIZE}px ${-f[1] * SIZE}px`;
    }

    const onVisible = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (!document.hidden && ready) raf = requestAnimationFrame(tick);
    };

    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("resize", onResize);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelAnimationFrame(raf);
      img.onload = null;
      removeEventListener("pointermove", onMove);
      removeEventListener("resize", onResize);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <div ref={el} className="cat" aria-hidden="true" hidden />;
}

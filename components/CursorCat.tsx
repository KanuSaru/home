"use client";

// A lazy cat that lives at the bottom of the screen.
//
// It naps most of the time. If the cursor rests near it for a moment, it wakes up,
// maybe scratches itself, and walks over slowly. Once there it sits, gets tired and
// falls asleep again, right where it is. If the cursor keeps moving around, it can't be
// bothered: it sits down and goes back to sleep.
//
// The cat is the classic Neko (the 1989 desktop pet), from oneko.js by adryd
// (github.com/adryd325/oneko.js, MIT): public/oneko.gif, 32×32 frames. The behavior is
// this site's own; only the drawing and its frame positions come from there.
//
// Only on screens with a mouse; on touch screens there's no cursor to follow.
// With reduced motion it stays asleep.

import { useEffect, useRef } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SCALE = 1; // screen pixels per drawing pixel; the classic size
const SIZE = 32 * SCALE;
const SPEED = 70; // px per second: it's in no hurry
const WAKE_RADIUS = 360; // how close the cursor has to rest to be worth getting up for
const REST_TIME = 1.2; // seconds the cursor has to stay still
const GIVE_UP = 140; // if the cursor wanders this far from where it was going, it gives up
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
    const mouse = { x: -1e4, y: -1e4, still: 0, seen: false };
    let goal: { x: number; y: number } | null = null;
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
    const near = () => Math.hypot(mouse.x - cat.x, mouse.y - cat.y);
    const clamp = (p: { x: number; y: number }) => ({
      x: Math.min(innerWidth - MARGIN - SIZE / 2, Math.max(MARGIN + SIZE / 2, p.x)),
      y: Math.min(innerHeight - MARGIN - SIZE / 2, Math.max(MARGIN + SIZE / 2, p.y)),
    });

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const moved = Math.hypot(e.clientX - mouse.x, e.clientY - mouse.y);
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.seen = true;
      if (moved > 4) mouse.still = 0;
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
      if (mouse.seen) mouse.still += dt;
      const calm = reduced.matches;

      switch (mode) {
        case "sleep":
          // only a cursor resting close by is worth waking up for
          if (!calm && mouse.seen && mouse.still > REST_TIME && near() < WAKE_RADIUS && near() > SIZE) set("alert", 0.7);
          break;
        case "alert":
          if (timer > wait) {
            goal = clamp({ x: mouse.x, y: mouse.y + SIZE / 2 - 6 });
            if (Math.random() < 0.4) set("scratch", 1.4);
            else set("walk");
          }
          break;
        case "scratch":
          // on the way somewhere: off it goes; otherwise it's tired now
          if (timer > wait) {
            if (goal) set("walk");
            else set("tired", 1.2);
          }
          break;
        case "walk": {
          if (!goal) {
            set("idle", 2);
            break;
          }
          // the cursor ran off: not worth it. Small moves, it follows.
          const want = clamp({ x: mouse.x, y: mouse.y + SIZE / 2 - 6 });
          if (Math.hypot(want.x - goal.x, want.y - goal.y) > GIVE_UP) {
            goal = null;
            set("idle", 1.5);
            break;
          }
          goal = want;
          const dx = goal.x - cat.x, dy = goal.y - cat.y, d = Math.hypot(dx, dy);
          if (d < 3) {
            // there; if the cursor is somewhere it can't reach, it paws at the edge instead
            const wanted = { x: mouse.x, y: mouse.y + SIZE / 2 - 6 };
            const blocked = Math.hypot(wanted.x - goal.x, wanted.y - goal.y) > 20;
            goal = null;
            if (blocked) set("wall", 2);
            else set("idle", 2 + Math.random() * 2);
            break;
          }
          const a = Math.atan2(-dy, dx); // up is north
          dir = ["E", "NE", "N", "NW", "W", "SW", "S", "SE"][(Math.round(a / (Math.PI / 4)) + 8) % 8];
          const s = Math.min(d, SPEED * dt);
          cat.x += (dx / d) * s;
          cat.y += (dy / d) * s;
          break;
        }
        case "wall":
          if (timer > wait) set("idle", 1.5);
          break;
        case "idle":
          // sometimes a scratch first; either way it ends up tired, then asleep
          if (timer > wait) {
            if (Math.random() < 0.35) set("scratch", 1.4);
            else set("tired", 1.2);
          }
          break;
        case "tired":
          if (timer > wait) set("sleep");
          break;
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

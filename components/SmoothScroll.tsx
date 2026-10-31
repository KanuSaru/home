"use client";

import { useEffect } from "react";

// Wheel and trackpad scrolling glides instead of jumping in steps.
//
// The page follows the wheel like a weight on a spring: it speeds up gently, keeps
// its speed between wheel notches, and settles without overshooting. Touch and
// keyboard keep the browser's own scrolling, and people who ask for reduced motion
// get the browser's scrolling untouched.
export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!matchMedia("(pointer: fine)").matches) return; // touch screens already glide

    const OMEGA = 7.5; // spring stiffness: higher = snappier, lower = floatier
    let target = window.scrollY;
    let pos = target;
    let vel = 0;
    let set = -1; // last position we scrolled to, to tell our scrolls from anyone else's
    let raf = 0;
    let last = 0;

    const max = () => document.documentElement.scrollHeight - window.innerHeight;

    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
      vel = 0;
      target = pos = window.scrollY;
    }

    function frame(now: number) {
      let dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      // critically damped spring, in small steps so a slow frame doesn't overshoot
      while (dt > 0) {
        const h = Math.min(dt, 1 / 120);
        vel += (OMEGA * OMEGA * (target - pos) - 2 * OMEGA * vel) * h;
        pos += vel * h;
        dt -= h;
      }
      const done = Math.abs(target - pos) < 0.5 && Math.abs(vel) < 8;
      if (done) pos = target;
      set = pos;
      window.scrollTo({ top: pos, behavior: "instant" as ScrollBehavior });
      if (done) {
        raf = 0;
        vel = 0;
      } else {
        raf = requestAnimationFrame(frame);
      }
    }

    // a scroll box inside the page scrolls itself first
    function innerScroller(el: EventTarget | null, dy: number) {
      for (let n = el instanceof Element ? el : null; n && n !== document.body; n = n.parentElement) {
        const oy = getComputedStyle(n).overflowY;
        if ((oy === "auto" || oy === "scroll") && n.scrollHeight > n.clientHeight) {
          if (dy > 0 ? n.scrollTop + n.clientHeight < n.scrollHeight - 1 : n.scrollTop > 0) return true;
        }
      }
      return false;
    }

    function onWheel(e: WheelEvent) {
      if (e.ctrlKey || e.defaultPrevented || e.shiftKey) return; // zoom, horizontal scroll
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const dy = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      if (innerScroller(e.target, dy)) return;
      e.preventDefault();
      if (!raf) {
        target = pos = window.scrollY;
        vel = 0;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
      target = Math.max(0, Math.min(max(), target + dy));
    }

    // keyboard, links and page changes take over at once
    function onScroll() {
      if (raf) {
        if (Math.abs(window.scrollY - set) > 2) stop();
      } else {
        target = pos = window.scrollY;
      }
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", stop);
    window.addEventListener("pointerdown", stop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", stop);
      window.removeEventListener("pointerdown", stop);
    };
  }, []);

  return null;
}

"use client";

import { useEffect, useRef, useState } from "react";

// A scrollbar for computers with a mouse, since the browser's own is hidden.
// It lives in a thin strip along the right edge of the window and only appears while
// the pointer is over that strip; scrolling by itself never shows it. Drag the bar to
// move through the page, or click anywhere on the strip to jump there.
// Touch screens don't get it: they scroll with a finger, and have no hover.

const MIN_THUMB = 40; // px, so a long page still has something to grab
const HIDE_DELAY = 350; // ms after the pointer leaves, so a slightly shaky hand doesn't lose it

export function ScrollRail() {
  const [enabled, setEnabled] = useState(false);
  const [shown, setShown] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [scrollable, setScrollable] = useState(false);
  const rail = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const hideTimer = useRef(0);
  const drag = useRef<{ startY: number; startScroll: number } | null>(null);

  // only where there's a real mouse
  useEffect(() => {
    const mq = matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // keep the bar's size and position in step with the page (without showing it)
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const place = () => {
      frame = 0;
      const doc = document.documentElement;
      const view = window.innerHeight;
      const total = doc.scrollHeight;
      const can = total > view + 1;
      setScrollable(can);
      if (!can || !rail.current || !thumb.current) return;
      const track = rail.current.clientHeight;
      const size = Math.max(MIN_THUMB, (view / total) * track);
      const top = (window.scrollY / (total - view)) * (track - size);
      thumb.current.style.height = `${size}px`;
      thumb.current.style.transform = `translateY(${top}px)`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };
    place();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // pages grow and shrink as widgets load and notes open
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  if (!enabled) return null;

  const show = () => {
    window.clearTimeout(hideTimer.current);
    setShown(true);
  };
  const hideSoon = () => {
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShown(false), HIDE_DELAY);
  };

  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  // click on the strip (not on the bar): jump so that spot becomes the bar's middle
  const onRailDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || e.target === thumb.current || !rail.current || !thumb.current) return;
    const r = rail.current.getBoundingClientRect();
    const size = thumb.current.offsetHeight;
    const ratio = Math.min(1, Math.max(0, (e.clientY - r.top - size / 2) / (r.height - size)));
    window.scrollTo({ top: ratio * maxScroll(), behavior: reduced() ? "auto" : "smooth" });
  };

  const onThumbDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault(); // no text selection while dragging
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, startScroll: window.scrollY };
    setDragging(true);
  };
  const onThumbMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !rail.current || !thumb.current) return;
    const room = rail.current.clientHeight - thumb.current.offsetHeight;
    if (room <= 0) return;
    const dy = e.clientY - drag.current.startY;
    window.scrollTo({ top: drag.current.startScroll + (dy / room) * maxScroll(), behavior: "auto" });
  };
  const onThumbUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    // let go outside the strip: fade away like after hovering
    const r = rail.current?.getBoundingClientRect();
    if (!r || e.clientX < r.left) hideSoon();
  };

  const visible = scrollable && (shown || dragging);

  return (
    <div
      ref={rail}
      // a page too short to scroll keeps the strip out of the way (but measured, for when it grows)
      className={`scroll-rail ${visible ? "is-shown" : ""} ${dragging ? "is-dragging" : ""} ${scrollable ? "" : "is-off"}`}
      // it only repeats what the keyboard and screen readers already do on their own
      aria-hidden="true"
      onPointerEnter={show}
      onPointerLeave={() => !drag.current && hideSoon()}
      onPointerDown={onRailDown}
    >
      <div
        ref={thumb}
        className="scroll-rail-thumb"
        onPointerDown={onThumbDown}
        onPointerMove={onThumbMove}
        onPointerUp={onThumbUp}
        onPointerCancel={onThumbUp}
      />
    </div>
  );
}

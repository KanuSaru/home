"use client";

import { useEffect, useRef } from "react";

// A white lily in 1-bit pixel art, in 3D, slowly opening and closing.
// Drag (or use the arrow keys) to turn it.
//
// The flower is a real 3D model: six curved petals (tepals), stamens, a pistil,
// a stem and a leaf. Each frame it's drawn into a small pixel buffer with depth
// testing and soft shading, then reduced to on/off pixels with the same ordered
// dithering as the moon, and scaled up with crisp pixels.

type V3 = [number, number, number];

const N = 24; // samples along a tepal
const ACROSS = 9; // samples across a tepal
const D = 4.4; // camera distance
const CENTER_Y = 0.24; // the point the camera looks at
// light comes from over the viewer's shoulder, so the side you look at is lit
const LIGHT_CAM = norm([0.35, 0.7, -0.62]);
const PERIOD = 26; // seconds per open–close cycle
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

function norm(v: V3): V3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** How open the flower is at time t (seconds): opens, stays and breathes, closes, rests. */
function openness(t: number) {
  const p = (((t / PERIOD) % 1) + 1) % 1;
  if (p < 0.3) return ease(p / 0.3);
  if (p < 0.74) return 1 - 0.015 * (1 - Math.cos(((p - 0.3) / 0.44) * Math.PI * 2));
  if (p < 0.94) return 1 - ease((p - 0.74) / 0.2);
  return 0;
}

/** One tepal as a grid of points: ACROSS rows (edge to edge) × N columns (base to tip). */
function tepal(i: number, open: number): V3[][] {
  const outer = i % 2 === 0;
  const phi = (i * Math.PI) / 3;
  const rx = Math.cos(phi), rz = Math.sin(phi);
  const tx = -rz, tz = rx;
  const L = outer ? 1.0 : 0.95;
  const W = outer ? 0.27 : 0.33;
  const theta0 = lerp(0.1, outer ? 1.12 : 1.0, open);
  const curl = lerp(0.04, outer ? 2.15 : 1.95, Math.pow(open, 1.3));
  const cup = lerp(0.6, 0.3, open);
  const y0 = outer ? 0 : 0.025;

  const spine: V3[] = [];
  const nin: V3[] = [];
  let px = rx * 0.04, py = y0, pz = rz * 0.04;
  const ds = L / (N - 1);
  for (let k = 0; k < N; k++) {
    const u = k / (N - 1);
    const th = theta0 + curl * Math.pow(u, 2.2);
    spine.push([px, py, pz]);
    nin.push([-Math.cos(th) * rx, Math.sin(th), -Math.cos(th) * rz]);
    const thm = theta0 + curl * Math.pow(u + 0.5 / (N - 1), 2.2);
    px += ds * Math.sin(thm) * rx;
    py += ds * Math.cos(thm);
    pz += ds * Math.sin(thm) * rz;
  }

  const rows: V3[][] = [];
  for (let a = 0; a < ACROSS; a++) {
    const v = -1 + (2 * a) / (ACROSS - 1);
    rows.push(
      spine.map((p, k) => {
        const u = k / (N - 1);
        const w = W * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.75)), 0.85) + 0.02 * (1 - u);
        const n = nin[k];
        const lift = cup * w * v * v + 0.018 * open * Math.abs(v) ** 3 * Math.sin(u * 15 + i * 1.7);
        return [p[0] + v * w * tx + n[0] * lift, p[1] + n[1] * lift, p[2] + v * w * tz + n[2] * lift] as V3;
      }),
    );
  }
  return rows;
}

function parseColor(css: string): [number, number, number] {
  const m = css.trim().match(/^#?([0-9a-f]{6})$/i);
  const n = m ? parseInt(m[1], 16) : 0xe7e2d6;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function LilyScene({ label }: { label: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, px = 3, f = 1;
    let zbuf = new Float32Array(0);
    let ibuf = new Float32Array(0);
    let obuf = new Int16Array(0); // which part each pixel belongs to, for seams
    let image: ImageData | null = null;
    // negative pitch = camera above, looking down into the flower
    let yaw = 0.5, pitch = -0.55, vyaw = 0, vpitch = 0;
    let lightW: V3 = LIGHT_CAM;
    let partId = 0;
    let drag: null | { x: number; y: number; id: number } = null;
    let lastInput = -1e9;
    let visible = true;
    let frame = 0;
    let lastDraw = 0;
    let ink: [number, number, number] = [231, 226, 214];

    const stars: { p: V3; b: number }[] = [];
    for (let k = 0; k < 140; k++) {
      const a = Math.random() * Math.PI * 2;
      const c = Math.random() * 2 - 1;
      const s = Math.sqrt(1 - c * c);
      stars.push({ p: [9 * s * Math.cos(a), 9 * c, 9 * s * Math.sin(a)], b: Math.random() });
    }

    const resize = () => {
      const cssW = wrap.clientWidth, cssH = wrap.clientHeight;
      px = cssW < 520 ? 2 : 3;
      W = Math.max(40, Math.floor(cssW / px));
      H = Math.max(40, Math.floor(cssH / px));
      canvas.width = W;
      canvas.height = H;
      zbuf = new Float32Array(W * H);
      ibuf = new Float32Array(W * H);
      obuf = new Int16Array(W * H);
      image = ctx.createImageData(W, H);
      f = Math.min(W * 1.85, H * 2.05);
      ink = parseColor(getComputedStyle(wrap).getPropertyValue("--bone"));
    };

    // world -> camera, then -> buffer pixels
    let cy = 1, sy = 0, cp = 1, sp = 0;
    const toCam = (p: V3): V3 => {
      const x = p[0], y = p[1] - CENTER_Y, z = p[2];
      const x1 = x * cy - z * sy;
      const z1 = x * sy + z * cy;
      return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
    };
    const project = (c: V3): V3 => {
      const zz = c[2] + D;
      return [W / 2 + (f * c[0]) / zz, H * 0.5 - (f * c[1]) / zz, zz];
    };
    // camera direction -> world direction
    const fromCam = (v: V3): V3 => {
      const y = v[1] * cp + v[2] * sp;
      const z1 = -v[1] * sp + v[2] * cp;
      return [v[0] * cy + z1 * sy, y, -v[0] * sy + z1 * cy];
    };
    // the camera's position in the world, for lighting the side you're looking at
    const camWorld = (): V3 => {
      const y = -D * sp, z1 = -D * cp;
      return [z1 * sy, y + CENTER_Y, z1 * cy];
    };

    function plot(x: number, y: number, z: number, i: number) {
      const xi = x | 0, yi = y | 0;
      if (xi < 0 || yi < 0 || xi >= W || yi >= H) return;
      const k = yi * W + xi;
      if (z < zbuf[k]) {
        zbuf[k] = z;
        ibuf[k] = i;
        obuf[k] = partId;
      }
    }

    function tri(a: V3, b: V3, c: V3, ia: number, ib: number, ic: number) {
      const area = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      if (Math.abs(area) < 1e-6) return;
      const minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])));
      const maxX = Math.min(W - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
      const minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
      const maxY = Math.min(H - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
      for (let y = minY; y <= maxY; y++) {
        const py = y + 0.5;
        for (let x = minX; x <= maxX; x++) {
          const pxx = x + 0.5;
          const w0 = ((b[0] - pxx) * (c[1] - py) - (b[1] - py) * (c[0] - pxx)) / area;
          const w1 = ((c[0] - pxx) * (a[1] - py) - (c[1] - py) * (a[0] - pxx)) / area;
          const w2 = 1 - w0 - w1;
          if (w0 < 0 || w1 < 0 || w2 < 0) continue;
          const z = w0 * a[2] + w1 * b[2] + w2 * c[2];
          const k = y * W + x;
          if (z < zbuf[k]) {
            zbuf[k] = z;
            ibuf[k] = w0 * ia + w1 * ib + w2 * ic;
            obuf[k] = partId;
          }
        }
      }
    }

    /** Shade and draw a grid surface (rows × cols of world points). */
    function surface(grid: V3[][], albedo: (r: number, c: number) => number) {
      const R = grid.length, C = grid[0].length;
      const eye = camWorld();
      const scr: V3[][] = grid.map((row) => row.map((p) => project(toCam(p))));
      const shade: number[][] = grid.map((row, r) =>
        row.map((p, c) => {
          const du = sub(row[Math.min(C - 1, c + 1)], row[Math.max(0, c - 1)]);
          const dv = sub(grid[Math.min(R - 1, r + 1)][c], grid[Math.max(0, r - 1)][c]);
          let n = norm(cross(du, dv));
          if (dot(n, sub(eye, p)) < 0) n = [-n[0], -n[1], -n[2]]; // light the side we see
          const lam = Math.max(0, dot(n, lightW));
          return albedo(r, c) * (0.2 + 0.95 * Math.pow(lam, 1.25));
        }),
      );
      for (let r = 0; r < R - 1; r++) {
        for (let c = 0; c < C - 1; c++) {
          tri(scr[r][c], scr[r + 1][c], scr[r + 1][c + 1], shade[r][c], shade[r + 1][c], shade[r + 1][c + 1]);
          tri(scr[r][c], scr[r + 1][c + 1], scr[r][c + 1], shade[r][c], shade[r + 1][c + 1], shade[r][c + 1]);
        }
      }
    }

    /** A thin curve, `width` buffer pixels wide. */
    function curve(pts: V3[], intensity: number, width = 1) {
      for (let k = 0; k < pts.length - 1; k++) {
        const a = project(toCam(pts[k])), b = project(toCam(pts[k + 1]));
        const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 2));
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const x = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t), z = lerp(a[2], b[2], t);
          plot(x, y, z, intensity);
          if (width > 1) plot(x + 1, y, z, intensity);
        }
      }
    }

    function blob(p: V3, rx: number, ry: number, intensity: number) {
      const c = project(toCam(p));
      const sx = (f / c[2]) * rx, sy2 = (f / c[2]) * ry;
      const ex = Math.max(1, sx), ey = Math.max(0.8, sy2);
      for (let y = Math.floor(c[1] - ey); y <= Math.ceil(c[1] + ey); y++) {
        for (let x = Math.floor(c[0] - ex); x <= Math.ceil(c[0] + ex); x++) {
          const dx = (x + 0.5 - c[0]) / ex, dy = (y + 0.5 - c[1]) / ey;
          if (dx * dx + dy * dy <= 1) plot(x, y, c[2] - 0.001, intensity * (1 - 0.35 * (dx * dx + dy * dy)));
        }
      }
    }

    function draw(t: number) {
      if (!image) return;
      const open = still ? 1 : openness(t);
      const sway = still ? 0 : 0.035 * Math.sin(t * 0.45);
      cy = Math.cos(yaw); sy = Math.sin(yaw); cp = Math.cos(pitch); sp = Math.sin(pitch);
      zbuf.fill(Infinity);
      ibuf.fill(-1);
      lightW = fromCam(LIGHT_CAM);

      const swayP = (p: V3): V3 => {
        const y = p[1] + 1.1;
        return [p[0] + y * sway, p[1], p[2] + y * sway * 0.4];
      };

      // petals: bright white, a little darker deep in the throat
      for (let i = 0; i < 6; i++) {
        const g = tepal(i, open).map((row) => row.map(swayP));
        partId = i + 1;
        surface(g, (_r, c) => 0.82 + 0.2 * Math.min(1, (c / (N - 1)) * 3));
      }

      // stamens (darker anthers) and the pistil
      for (let i = 0; i < 7; i++) {
        partId = 10 + i;
        const pistil = i === 6;
        const phi = (i * Math.PI) / 3 + Math.PI / 6;
        const reach = pistil ? 0.03 : lerp(0.05, 0.3, open);
        const top = pistil ? 0.78 : lerp(0.45, 0.62, open);
        const pts: V3[] = [];
        for (let k = 0; k <= 10; k++) {
          const u = k / 10;
          const r = reach * Math.pow(u, 1.6);
          pts.push(swayP([Math.cos(phi) * r, 0.05 + top * u, Math.sin(phi) * r]));
        }
        curve(pts, 0.9);
        if (pistil) blob(pts[10], 0.03, 0.03, 0.95);
        else blob(pts[10], 0.06, 0.026, 0.7);
      }

      // stem and a leaf, darker than the petals
      const stem: V3[] = [];
      for (let k = 0; k <= 14; k++) {
        const u = k / 14;
        stem.push(swayP([0.06 * Math.sin(u * 2.4), -1.4 * u, 0.03 * u]));
      }
      partId = 20;
      curve(stem, 0.9, 2);
      partId = 21;
      const leaf: V3[][] = [];
      for (let r = 0; r < 5; r++) {
        const v = -1 + r / 2;
        const row: V3[] = [];
        for (let k = 0; k <= 12; k++) {
          const u = k / 12;
          const wd = 0.075 * Math.sin(Math.PI * Math.pow(u, 0.7));
          row.push(swayP([0.03 + 0.55 * u, -0.72 + 0.32 * u - 0.28 * u * u + v * wd, 0.1 * u - v * wd * 0.3 - 0.04 * v * v]));
        }
        leaf.push(row);
      }
      surface(leaf, () => 0.72);

      // to pixels: dark seams where one part passes in front of another, then dither
      const data = image.data;
      data.fill(0);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const k = y * W + x;
          let i = ibuf[k];
          if (i < 0) continue;
          const z = zbuf[k];
          const id = obuf[k];
          const closer = (kk: number) => ibuf[kk] >= 0 && obuf[kk] !== id && zbuf[kk] < z - 0.03;
          if ((x + 1 < W && closer(k + 1)) || (x > 0 && closer(k - 1)) || (y + 1 < H && closer(k + W)) || (y > 0 && closer(k - W))) {
            i = 0;
          }
          if (i > BAYER[(y & 3) * 4 + (x & 3)]) {
            const p = k * 4;
            data[p] = ink[0];
            data[p + 1] = ink[1];
            data[p + 2] = ink[2];
            data[p + 3] = 255;
          }
        }
      }

      // stars where there's no flower
      for (const s of stars) {
        const c = toCam(s.p);
        if (c[2] + D < 1) continue;
        const [sx, sy2] = project(c);
        const xi = sx | 0, yi = sy2 | 0;
        if (xi < 0 || yi < 0 || xi >= W || yi >= H || ibuf[yi * W + xi] >= 0) continue;
        const tw = still ? 1 : 0.55 + 0.45 * Math.sin(t * (0.5 + s.b) + s.b * 30);
        const a = Math.round(255 * (0.2 + 0.55 * s.b) * tw);
        if (a < 40) continue;
        const p = (yi * W + xi) * 4;
        data[p] = ink[0];
        data[p + 1] = ink[1];
        data[p + 2] = ink[2];
        data[p + 3] = a;
      }

      ctx!.putImageData(image, 0, 0);
    }

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      // a steady, slightly low frame rate suits the pixel look and saves battery
      if (now - lastDraw < 1000 / 30 && !drag) return;
      lastDraw = now;
      if (!drag) {
        yaw += vyaw;
        pitch = clamp(pitch + vpitch, -1.1, 0.5);
        vyaw *= 0.9;
        vpitch *= 0.9;
        if (!still && now - lastInput > 4000) yaw += 0.0025;
      }
      draw(now / 1000);
    };

    const onDown = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
      vyaw = vpitch = 0;
      lastInput = performance.now();
      canvas.setPointerCapture(e.pointerId);
      wrap.dataset.dragging = "true";
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      lastInput = performance.now();
      vyaw = dx * 0.008;
      vpitch = -dy * 0.006;
      yaw += vyaw;
      pitch = clamp(pitch + vpitch, -1.1, 0.5);
    };
    const onUp = (e: PointerEvent) => {
      if (drag && e.pointerId === drag.id) {
        drag = null;
        wrap.dataset.dragging = "";
      }
    };
    const onKey = (e: KeyboardEvent) => {
      const step = 0.12;
      if (e.key === "ArrowLeft") yaw -= step;
      else if (e.key === "ArrowRight") yaw += step;
      else if (e.key === "ArrowUp") pitch = clamp(pitch + step, -1.1, 0.5);
      else if (e.key === "ArrowDown") pitch = clamp(pitch - step, -1.1, 0.5);
      else return;
      e.preventDefault();
      lastInput = performance.now();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(wrap);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("keydown", onKey);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="scene" ref={wrapRef}>
      <canvas ref={canvasRef} role="img" aria-label={label} tabIndex={0} />
    </div>
  );
}

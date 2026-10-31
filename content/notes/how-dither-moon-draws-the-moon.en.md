---
title: How dither-moon draws the Moon
date: 2026-10-31
tags: graphics, astronomy, javascript
summary: The moon on my home page isn't a picture. It's worked out from where the Sun and the Moon are right now, wrapped in NASA's map, and drawn one on-or-off pixel at a time. Here's how, step by step.
---

The moon on my home page isn't an image. A few times a second, a small program works out where the Sun and the Moon are right now, lights a ball to match, wraps NASA's map of the Moon around it, and then decides for every pixel whether it's on or off. I packaged it as [dither-moon](https://github.com/KanuSaru/dither-moon) so anyone can put it on their own page.

This note goes through it one step at a time. Every moon below is live: it shows the date written under it, and you can drag it to turn it.

## 1. Where the Moon is in its cycle

A phase is just geometry. The Sun always lights half of the Moon; what changes is how much of that lit half faces us. That depends on the angle between the Sun and the Earth as seen from the Moon, called the **phase angle**. At 0° we see the whole lit side (full moon); at 180° we see none of it (new moon).

To get that angle, the library computes where the Sun and the Moon are in the sky for the given moment, using the classic low-precision series from Jean Meeus's *Astronomical Algorithms*. The Sun needs a mean position plus a correction for Earth's elliptical orbit. The Moon needs more: its mean position plus the largest wobbles caused by its own tilted, stretched orbit and by the Sun pulling on it. The biggest of those terms alone moves it by more than 6°. From the two positions comes the phase angle, and from that the lit fraction:

```
lit fraction = (1 + cos(phase angle)) / 2
```

I checked it against eclipses, which are the most precisely timed new and full moons there are: it lands within about five minutes. A fixed 29.5-day cycle can be off by up to about half a day, because the real month speeds up and slows down.

::moons dates="2026-11-13,2026-11-17,2026-11-21,2026-11-24" labels="Nov 13|Nov 17|Nov 21|Nov 24" caption="The same code on four dates this November: a 16% crescent, first quarter, 87% gibbous and full moon."

One detail about names: new, first quarter, full and last quarter are instants, not days. So the library only uses those names within about a day of the exact moment, and the in-between names ("waxing gibbous", "waning crescent"…) the rest of the time.

## 2. A ball, lit from the side

The drawing itself starts small: a square canvas about a hundred pixels across. For each pixel, if it falls inside the circle, the program finds the matching point on the front of a sphere. On a sphere of radius 1, that point is also the direction the surface faces there (its *normal*), which is everything we need to light it.

The obvious way to shade a ball is Lambert's law: brightness follows the cosine of the angle between the surface and the light, so a ball darkens toward its edges. The Moon doesn't do that. A full moon looks like a flat, evenly bright disc, because its dusty soil scatters light back toward the Sun. That behavior is closer to the **Lommel–Seeliger** law, which also accounts for the angle you're looking from:

```
brightness ∝ μ₀ / (μ₀ + μ)
μ₀ = cos(angle to the Sun), μ = cos(angle to the viewer)
```

On top of that goes a tone curve that keeps most of the lit side solid and leaves the gradient near the shadow line, where it matters most in 1-bit.

::moon date=2026-11-21 surface=flat caption="Only the lighting: a plain white ball under the Sun's real angle on November 21. Notice how evenly lit it stays all the way to its right edge."

## 3. Wrapping NASA's map around it

Next comes the surface. NASA's Scientific Visualization Studio publishes the [CGI Moon Kit](https://svs.gsfc.nasa.gov/4720), a color map and an elevation map of the whole Moon built from Lunar Reconnaissance Orbiter data, free for anyone to use.

Each point of the sphere becomes a latitude and a longitude, and those become a position on the map. The map was prepared ahead of time: turned into grays, shrunk to 512 × 256, slightly blurred, and pushed toward two tones. The dark seas (*maria*) sit around one level and the bright highlands around another, and at this size it reads best when highlands come out almost solid and the seas as an even dot pattern. Fine detail like small craters and bright rays only turns into noise when there are this few pixels.

Both maps travel inside the library, about 33 KB, so it never has to fetch anything from another site.

::moon date=2026-11-21 relief=0 caption="With NASA's map, no relief yet. The dark seas are the shapes people see as a face or a rabbit."

## 4. Craters that catch the light

Elevation isn't drawn as height. Instead, for each point the library looks at the elevation map just east and west, and just north and south, to get the **slope** there. It tilts the surface normal by that slope before lighting it, so a crater wall facing the Sun gets brighter and the one facing away gets darker.

This barely shows on a full moon, because the light comes from straight behind us. It matters most along the shadow line (the *terminator*), where sunlight arrives low and every slope casts a difference. It's the same reason the Moon looks most textured through binoculars around first quarter.

The tilt is worked out in the Moon's own frame and then turned back to the view. That way the craters stay lit from the correct side even while the Moon sways or you drag it around.

::moon date=2026-11-17 caption="First quarter, with relief. Look along the straight shadow line: that's where the craters show."

## 5. On or off: ordered dithering

At this point every pixel has a brightness between 0 and 1, but the moon is drawn in one color on nothing: each pixel is either ink or empty. The simplest rule is a threshold: on if the brightness is over one half. It throws away everything in between.

**Ordered dithering** gives each pixel its own threshold instead, taken from a small grid that repeats across the image. dither-moon uses the 4 × 4 **Bayer matrix**: the numbers 0 to 15, arranged so that consecutive thresholds land as far apart as possible.

::bayer caption="The 4 × 4 Bayer matrix. Each pixel is compared with the cell it falls on, as (value + 0.5) / 16. Brighter cells mean a higher threshold."

So a 50% gray turns into a checkerboard, 25% into one dot every other pixel and row, and so on: sixteen levels of gray out of pure on and off.

::ramp labels="Smooth gray|One threshold for every pixel|Ordered dithering (4 × 4 Bayer)" caption="The same left-to-right ramp three ways."

Why not error diffusion, like Floyd–Steinberg, which usually looks more natural? Because the moon moves. Error diffusion passes each pixel's rounding error on to its neighbors, so a tiny change anywhere reshuffles the dots across the image, and an animation shimmers. With an ordered grid the pattern stays pinned to the screen, each pixel is decided on its own, and a slowly swaying moon stays calm. It's also very cheap: one comparison per pixel.

The night side isn't completely empty either. It keeps 5% of the surface brightness, which is just enough for the brightest highlands to cross the lowest thresholds as sparse dots, a little like earthshine.

## 6. Pixels, stars and turning it by hand

The small canvas is shown 2 or 3 times bigger with `image-rendering: pixelated`, so every moon pixel becomes a crisp square instead of a blur. It redraws about nine times a second. A low frame rate suits the pixel look and barely uses any battery.

The rest is atmosphere:

- **Sway**: the moon wobbles a few degrees side to side and up and down, a nod to *libration*, the real slow wobble that lets us see a bit more than half of the Moon over a month.
- **Stars**: placed with a hash so they're the same on every visit, each one fading in and out at its own pace.
- **Dragging**: a drag across the whole moon turns it about half a turn, so you can look at the far side. Six seconds after you let go, it eases back to the side that always faces Earth.

::moon size=large drift=sway stars=1 info=1 caption="Today's moon. Drag it to see the far side; it comes back on its own."

## Use it

It works on any page with one script tag, or as a React component:

```html
<script src="https://cdn.jsdelivr.net/npm/dither-moon@1/dist/dither-moon.js"></script>
<dither-moon info style="width: 240px; color: #e7e2d6"></dither-moon>
```

```bash
npm install dither-moon
```

The phase math is also there on its own (`moonPhase()`, `nextFullMoon()`), with no dependencies. The code is on [GitHub](https://github.com/KanuSaru/dither-moon) and the package is on [npm](https://www.npmjs.com/package/dither-moon).

### Sources

- Jean Meeus, *Astronomical Algorithms*, 2nd ed. (Willmann-Bell, 1998): positions of the Sun and the Moon, and the phase angle.
- NASA Scientific Visualization Studio, [CGI Moon Kit](https://svs.gsfc.nasa.gov/4720), from Lunar Reconnaissance Orbiter (LROC and LOLA) data.
- Bryce E. Bayer, "An optimum method for two-level rendition of continuous-tone pictures" (1973): the threshold matrix.

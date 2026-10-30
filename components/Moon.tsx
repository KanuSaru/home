"use client";

import { DitherMoon } from "dither-moon/react";

// The moon itself lives in its own package: github.com/KanuSaru/dither-moon
export function Moon({ label }: { label: string }) {
  return <DitherMoon className="moon" label={label} />;
}

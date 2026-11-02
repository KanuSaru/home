"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type PageId = "home" | "me" | "work" | "notes" | "journal" | "guestbook" | "updates" | "learn";

export function pageHref(id: PageId) {
  return id === "home" ? "/" : `/${id}/`;
}

export function noteHref(slug: string) {
  return `/notes/${slug}/`;
}

export function useCurrentPage(): PageId {
  const path = (usePathname() ?? "/").replace(/\/$/, "");
  if (path.endsWith("/me")) return "me";
  if (path.endsWith("/journal")) return "journal";
  if (path.endsWith("/work")) return "work";
  if (path.endsWith("/guestbook")) return "guestbook";
  if (path.endsWith("/updates")) return "updates";
  if (path.endsWith("/learn")) return "learn";
  if (/\/notes(\/|$)/.test(path)) return "notes";
  return "home";
}

export function PageLink({
  to,
  className,
  children,
  ...rest
}: { to: PageId; className?: string; children: React.ReactNode } & React.AriaAttributes) {
  return (
    <Link href={pageHref(to)} className={className} {...rest}>
      {children}
    </Link>
  );
}

export function NoteLink({ slug, className, children }: { slug: string; className?: string; children: React.ReactNode }) {
  return (
    <Link href={noteHref(slug)} className={className}>
      {children}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang, type Lang } from "@/lib/i18n";

export type PageId = "home" | "me" | "work" | "notes" | "journal" | "guestbook" | "updates" | "learn";

// English lives at the root, Spanish under /es/: /work/ and /es/work/.
const prefix = (lang: Lang) => (lang === "es" ? "/es" : "");

export function pageHref(id: PageId, lang: Lang = "en") {
  return id === "home" ? `${prefix(lang)}/` : `${prefix(lang)}/${id}/`;
}

export function noteHref(slug: string, lang: Lang = "en") {
  return `${prefix(lang)}/notes/${slug}/`;
}

export function useCurrentPage(): PageId {
  const path = (usePathname() ?? "/").replace(/^\/es(?=\/|$)/, "").replace(/\/$/, "");
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
  const { lang } = useLang();
  return (
    <Link href={pageHref(to, lang)} className={className} {...rest}>
      {children}
    </Link>
  );
}

export function NoteLink({ slug, className, children }: { slug: string; className?: string; children: React.ReactNode }) {
  const { lang } = useLang();
  return (
    <Link href={noteHref(slug, lang)} className={className}>
      {children}
    </Link>
  );
}

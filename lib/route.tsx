"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type PageId = "home" | "me" | "journal";

export function pageHref(id: PageId) {
  return id === "home" ? "/" : `/${id}/`;
}

export function useCurrentPage(): PageId {
  const path = (usePathname() ?? "/").replace(/\/$/, "");
  if (path.endsWith("/me")) return "me";
  if (path.endsWith("/journal")) return "journal";
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

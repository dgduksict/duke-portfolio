"use client";

import Link from "next/link";
import { useI18n } from "@/hooks/use-i18n";

export function NotFoundCopy() {
  const { dict } = useI18n();

  return (
    <div className="container-page py-12 sm:py-16">
      <h1 className="type-title">{dict.notFound.title}</h1>
      <p className="type-lead measure mt-4 text-ink-soft">{dict.notFound.body}</p>
      <Link href="/" className="btn btn-primary mt-8">
        {dict.notFound.home}
      </Link>
    </div>
  );
}

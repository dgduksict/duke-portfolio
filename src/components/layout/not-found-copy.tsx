"use client";

import Link from "next/link";
import { useI18n } from "@/hooks/use-i18n";

export function NotFoundCopy() {
  const { dict } = useI18n();

  return (
    <div className="container-page py-12 sm:py-16">
      <h1 className="type-title">{dict.notFound.title}</h1>
      <p className="type-lead measure mt-4 text-ink-soft">{dict.notFound.body}</p>
      {/* "Go to the portfolio" is about 330px of Press Start 2P on one line, wider than a 320px phone's column:
          the label may wrap there (.btn keeps it on one line everywhere else, where it fits anyway). */}
      <Link href="/" className="btn btn-primary mt-8 max-w-full whitespace-normal text-center text-balance">
        {dict.notFound.home}
      </Link>
    </div>
  );
}

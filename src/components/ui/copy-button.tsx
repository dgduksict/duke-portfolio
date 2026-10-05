"use client";

import { Check, Copy } from "lucide-react";
import { useClipboard } from "@/hooks/use-clipboard";
import { cn } from "@/lib/utils";

export interface CopyButtonProps {
  readonly value: string;
  readonly label: string;
  readonly copiedLabel: string;
  readonly className?: string;
}

export function CopyButton({ value, label, copiedLabel, className }: CopyButtonProps) {
  const { copied, copy } = useClipboard();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          void copy(value);
        }}
        className={cn("btn btn-quiet", className)}
        data-print="hide"
      >
        {copied ? (
          <Check aria-hidden className="size-4 text-accent" />
        ) : (
          <Copy aria-hidden className="size-4" />
        )}
        <span>{copied ? copiedLabel : label}</span>
      </button>
      <span role="status" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </>
  );
}

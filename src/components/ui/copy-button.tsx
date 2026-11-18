"use client";

import { PixelIcon } from "@/components/ui/pixel-icons";
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
        {copied ? <PixelIcon name="check" className="text-accent-text" /> : <PixelIcon name="copy" />}
        <span>{copied ? copiedLabel : label}</span>
      </button>
      <span role="status" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </>
  );
}

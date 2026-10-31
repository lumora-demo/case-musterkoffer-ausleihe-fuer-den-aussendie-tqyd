"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

// Meldung unten (Toast): bestätigt eine Änderung in einem Satz, optional mit „Rückgängig“.
// Verschwindet nach 6 s von selbst. Am Handy über der Leiste unten. Wird per aria-live vorgelesen.
export function Toast({
  id,
  text,
  aktion,
  onAktion,
  schliessen,
  schliessenLabel,
}: {
  id: number;
  text: string;
  aktion?: string;
  onAktion?: () => void;
  schliessen: () => void;
  schliessenLabel: string;
}) {
  useEffect(() => {
    const t = window.setTimeout(schliessen, 6000);
    return () => window.clearTimeout(t);
  }, [id, schliessen]);

  return (
    <div
      key={id}
      className="animate-enter fixed inset-x-4 bottom-[calc(72px+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-[480px] items-center gap-2 rounded-pop bg-tile py-2 pr-2 pl-4 text-small text-tile-text shadow-pop sm:bottom-6"
    >
      <p className="min-w-0 flex-1">{text}</p>
      {aktion && onAktion ? (
        <button
          type="button"
          onClick={onAktion}
          className="h-(--ctl-h-s) shrink-0 rounded-control px-3 font-semibold text-tile-text underline-offset-2 hover:underline pointer-coarse:min-h-11"
        >
          {aktion}
        </button>
      ) : null}
      <button
        type="button"
        onClick={schliessen}
        aria-label={schliessenLabel}
        title={schliessenLabel}
        className="flex size-8 shrink-0 items-center justify-center rounded-control text-tile-sub hover:text-tile-text pointer-coarse:size-11"
      >
        <X className="size-4" strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
}

"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Dialog für Formulare (520 px) und Rückfragen (420 px). Am Handy Fenster von unten über die volle Breite.
// Nutzt das native <dialog>: Esc schließt, Fokus bleibt im Dialog. Oben rechts immer ein sichtbarer Schließen-Knopf.
export function Dialog({
  offen,
  schliessen,
  titel,
  text,
  schliessenLabel,
  breite = "formular",
  children,
  aktionen,
  onSubmit,
}: {
  offen: boolean;
  schliessen: () => void;
  titel: string;
  text?: string;
  schliessenLabel: string;
  breite?: "formular" | "rueckfrage";
  children?: React.ReactNode;
  /** Knöpfe unten rechts (am Handy volle Breite) */
  aktionen: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (offen && !d.open) d.showModal();
    if (!offen && d.open) d.close();
  }, [offen]);

  return (
    <dialog
      ref={ref}
      onClose={schliessen}
      aria-labelledby="dialog-titel"
      className={cn(
        "animate-enter m-auto w-[calc(100%-32px)] rounded-card bg-surface p-0 text-text shadow-pop backdrop:bg-(--scrim)",
        breite === "formular" ? "max-w-[520px]" : "max-w-[420px]",
        "max-sm:mb-0 max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none max-sm:pb-[env(safe-area-inset-bottom)]",
      )}
    >
      {offen ? (
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 id="dialog-titel" className="text-h3 font-semibold">
                {titel}
              </h2>
              {text ? <p className="text-small text-text-2">{text}</p> : null}
            </div>
            <button
              type="button"
              onClick={schliessen}
              aria-label={schliessenLabel}
              title={schliessenLabel}
              className="touch-target relative -mt-1 -mr-1 flex size-8 shrink-0 items-center justify-center rounded-control text-text-2 hover:bg-fill hover:text-text"
            >
              <X className="size-[18px]" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
          {children ? <div className="flex flex-col gap-4">{children}</div> : null}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end [&>*]:max-sm:w-full">{aktionen}</div>
        </form>
      ) : null}
    </dialog>
  );
}

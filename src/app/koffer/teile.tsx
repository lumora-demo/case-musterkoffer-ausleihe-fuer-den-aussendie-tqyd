"use client";

import { ChevronRight, MapPin, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { de } from "@/content/de";
import { personName, useAusleihe } from "@/lib/ausleihe";
import { HEUTE, kofferStatus, tageZwischen, type Koffer, type KofferStatus } from "@/lib/demo-daten";
import { cn } from "@/lib/utils";

// Teile, die Übersicht, Kofferliste, Detail und „Meine“ gemeinsam nutzen.

const TON: Record<KofferStatus, "ok" | "neutral" | "danger"> = { verfuegbar: "ok", unterwegs: "neutral", ueberfaellig: "danger" };

export function StatusBadge({ koffer }: { koffer: Koffer }) {
  const s = kofferStatus(koffer);
  return <Badge ton={TON[s]}>{de.status[s]}</Badge>;
}

/** Frist als Text; „bald“ (≤ 2 Tage) gelb, überfällig rot, immer mit Wort */
export function Frist({ bis, className }: { bis?: string; className?: string }) {
  if (!bis) return null;
  const n = tageZwischen(HEUTE, bis);
  const text = n < 0 ? de.frist.seit(-n) : n === 0 ? de.frist.heute : de.frist.in(n);
  return <span className={cn("tabular-nums", n < 0 ? "text-danger" : n <= 2 ? "text-warn" : "text-muted", className)}>{text}</span>;
}

export function wo(k: Koffer) {
  return k.ausgeliehenAn ? de.koffer.bei(personName(k.ausgeliehenAn)) : k.lager;
}

/** Liste der Koffer: am Rechner Zeilen in einer Fläche, am Handy kompakte Karten. Ganze Zeile führt zum Koffer. */
export function KofferListe({ koffer }: { koffer: Koffer[] }) {
  const { meldungen } = useAusleihe();
  const t = de.koffer;
  return (
    <ul className="flex flex-col gap-2 sm:gap-0 sm:overflow-hidden sm:rounded-card sm:bg-surface sm:shadow-card">
      {koffer.map((k) => {
        const offen = meldungen.filter((m) => m.kofferId === k.id && !m.erledigt).length;
        return (
          <li key={k.id} className="sm:not-last:border-b sm:not-last:border-line">
            <Link
              href={`/koffer/${k.id}`}
              className="flex flex-col gap-1.5 rounded-card bg-surface p-4 shadow-card transition-colors duration-(--dur-fast) hover:bg-surface-2 sm:flex-row sm:items-center sm:gap-4 sm:rounded-none sm:px-(--pad-card) sm:py-3 sm:shadow-none"
            >
              <div className="flex items-start justify-between gap-3 sm:min-w-0 sm:flex-1 sm:items-center sm:justify-start sm:gap-4">
                <div className="flex min-w-0 flex-col sm:flex-row sm:items-center sm:gap-4">
                  <span className="font-mono text-small text-muted tabular-nums sm:w-16">{k.nummer}</span>
                  <span className="truncate font-medium">{k.name}</span>
                </div>
                <span className="sm:hidden">
                  <StatusBadge koffer={k} />
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-text-2 sm:w-56 sm:flex-col sm:items-start sm:gap-0">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 shrink-0 text-muted" strokeWidth={1.75} aria-hidden />
                  {wo(k)}
                </span>
                <Frist bis={k.rueckgabeBis} className="text-small" />
              </div>
              <div className="flex items-center gap-3 sm:w-64 sm:justify-end">
                {offen > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-small text-warn">
                    <TriangleAlert className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    {t.offeneMeldungen(offen)}
                  </span>
                ) : null}
                <span className="max-sm:hidden">
                  <StatusBadge koffer={k} />
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted max-sm:hidden" strokeWidth={1.75} aria-hidden />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

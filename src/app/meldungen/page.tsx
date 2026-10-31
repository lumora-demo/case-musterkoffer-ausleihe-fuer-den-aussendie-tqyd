"use client";

import { CircleCheck, Inbox } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge, Button, EmptyState, PageHeader, Segmented } from "@/components/ui";
import { de } from "@/content/de";
import { personName, useAusleihe } from "@/lib/ausleihe";
import { datum } from "@/lib/demo-daten";

const t = de.meldungen;

export default function Meldungen() {
  const a = useAusleihe();
  const [filter, setFilter] = useState<"offen" | "erledigt">("offen");
  const liste = a.meldungen.filter((m) => (filter === "erledigt" ? m.erledigt : !m.erledigt)).sort((x, y) => y.am.localeCompare(x.am));

  return (
    <>
      <PageHeader title={t.title} lead={t.lead} />
      <div className="sticky top-(--mobile-bar-h) z-30 -mx-4 -my-3 bg-bg/90 px-4 py-3 backdrop-blur-md sm:static sm:mx-0 sm:my-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <Segmented
          label={t.filter}
          wert={filter}
          setze={setFilter}
          werte={[
            { id: "offen", name: `${t.offen} (${a.meldungen.filter((m) => !m.erledigt).length})` },
            { id: "erledigt", name: t.erledigt },
          ]}
        />
      </div>

      {liste.length === 0 ? (
        filter === "offen" ? (
          <EmptyState icon={CircleCheck} title={t.leerOffenTitel} text={t.leerOffenText} />
        ) : (
          <EmptyState icon={Inbox} title={t.leerErledigtTitel} text={t.leerErledigtText} />
        )
      ) : (
        <ul className="flex flex-col gap-2 sm:gap-0 sm:overflow-hidden sm:rounded-card sm:bg-surface sm:shadow-card">
          {liste.map((m) => {
            const k = a.koffer.find((x) => x.id === m.kofferId);
            const muster = k?.muster.find((x) => x.id === m.musterId);
            const name = muster?.bezeichnung ?? "";
            return (
              <li
                key={m.id}
                className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:gap-4 sm:rounded-none sm:px-(--pad-card) sm:py-3 sm:shadow-none sm:not-last:border-b sm:not-last:border-line"
              >
                <div className="flex items-start justify-between gap-3 sm:w-24 sm:shrink-0">
                  <Badge ton={m.erledigt ? "ok" : "warn"}>{m.erledigt ? t.erledigt : de.meldungArt[m.art]}</Badge>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">{name}</span>
                  <span className="text-small text-muted">
                    {muster ? `${de.art[muster.art]} · ` : null}
                    <span className="font-mono tabular-nums">{muster?.sap}</span>
                  </span>
                </div>
                <div className="flex flex-col text-small sm:w-56">
                  <Link href={`/koffer/${m.kofferId}`} className="inline-flex min-h-11 w-fit items-center text-accent hover:underline sm:min-h-0">
                    <span className="font-mono tabular-nums">{k?.nummer}</span>&nbsp;{k?.name}
                  </Link>
                  <span className="text-muted">{t.von(personName(m.personId), datum(m.am))}</span>
                </div>
                {m.erledigt ? (
                  <Button groesse="s" variante="ghost" aria-label={t.wiederOeffnenLabel(name)} onClick={() => a.erledigen(m.id, false)}>
                    {t.wiederOeffnen}
                  </Button>
                ) : (
                  <Button groesse="s" variante="secondary" icon={CircleCheck} aria-label={t.alsErledigtLabel(name)} onClick={() => a.erledigen(m.id, true)}>
                    {t.alsErledigt}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

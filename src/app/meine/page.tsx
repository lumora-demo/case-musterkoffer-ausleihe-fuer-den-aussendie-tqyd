"use client";

import { Briefcase, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Badge, Button, ButtonLink, EmptyState, PageHeader, Section } from "@/components/ui";
import { de } from "@/content/de";
import { useAusleihe } from "@/lib/ausleihe";
import { ICH, datum } from "@/lib/demo-daten";
import { KofferListe } from "../koffer/teile";

const t = de.meine;

export default function Meine() {
  const a = useAusleihe();
  const ausgeliehen = a.koffer.filter((k) => k.ausgeliehenAn === ICH);
  const reservierungen = a.reservierungen.filter((r) => r.personId === ICH).sort((x, y) => x.von.localeCompare(y.von));
  const meldungen = a.meldungen.filter((m) => m.personId === ICH);
  const nichts = ausgeliehen.length === 0 && reservierungen.length === 0;

  return (
    <>
      <PageHeader title={t.title} lead={t.lead} />

      {nichts ? (
        <EmptyState icon={Briefcase} title={t.leerTitel} text={t.leerText}>
          <ButtonLink href="/koffer" variante="primary">
            {t.zuDenKoffern}
          </ButtonLink>
        </EmptyState>
      ) : (
        <>
          <Section title={t.ausgeliehen}>
            {ausgeliehen.length === 0 ? <p className="text-small text-muted">{t.ausgeliehenLeer}</p> : <KofferListe koffer={ausgeliehen} />}
          </Section>

          <Section title={t.reservierungen}>
            {reservierungen.length === 0 ? (
              <p className="text-small text-muted">{t.reservierungenLeer}</p>
            ) : (
              <ul className="flex flex-col gap-2 sm:gap-0 sm:overflow-hidden sm:rounded-card sm:bg-surface sm:shadow-card">
                {reservierungen.map((r) => {
                  const k = a.koffer.find((x) => x.id === r.kofferId);
                  const zeitraum = `${datum(r.von)}–${datum(r.bis)}`;
                  return (
                    <li
                      key={r.id}
                      className="flex items-center gap-3 rounded-card bg-surface p-4 shadow-card sm:rounded-none sm:px-(--pad-card) sm:py-3 sm:shadow-none sm:not-last:border-b sm:not-last:border-line"
                    >
                      <Link href={`/koffer/${r.kofferId}`} className="flex min-h-11 min-w-0 flex-1 flex-col justify-center hover:underline sm:flex-row sm:items-center sm:gap-4">
                        <span className="font-mono text-small text-muted tabular-nums sm:w-16">{k?.nummer}</span>
                        <span className="font-medium sm:w-56">{k?.name}</span>
                        <span className="font-mono text-small tabular-nums">{zeitraum}</span>
                        {r.zweck ? <span className="truncate text-small text-muted">{r.zweck}</span> : null}
                      </Link>
                      <Button groesse="s" variante="ghost" aria-label={de.detail.stornierenLabel(zeitraum)} onClick={() => a.stornieren(r.id)}>
                        {de.detail.stornieren}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        </>
      )}

      {meldungen.length > 0 ? (
        <Section title={t.meldungen}>
          <ul className="flex flex-col gap-2 sm:gap-0 sm:overflow-hidden sm:rounded-card sm:bg-surface sm:shadow-card">
            {meldungen.map((m) => {
              const k = a.koffer.find((x) => x.id === m.kofferId);
              const muster = k?.muster.find((x) => x.id === m.musterId);
              return (
                <li
                  key={m.id}
                  className="flex items-center gap-3 rounded-card bg-surface p-4 shadow-card sm:rounded-none sm:px-(--pad-card) sm:py-3 sm:shadow-none sm:not-last:border-b sm:not-last:border-line"
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="font-medium">{muster?.bezeichnung}</span>
                    <span className="text-small text-muted">
                      {k?.nummer} · {datum(m.am)}
                    </span>
                  </div>
                  <Badge ton={m.erledigt ? "ok" : "warn"}>{m.erledigt ? de.meldungen.erledigt : de.meldungArt[m.art]}</Badge>
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}

      <div className="flex flex-col items-start gap-1.5">
        <Button variante="ghost" groesse="s" icon={RotateCcw} onClick={a.zuruecksetzen} className="-ml-3">
          {t.zuruecksetzen}
        </Button>
        <p className="text-small text-muted">{t.zuruecksetzenHinweis}</p>
      </div>
    </>
  );
}

"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { ButtonLink, Kennzahl, PageHeader, Section } from "@/components/ui";
import { de } from "@/content/de";
import { useAusleihe } from "@/lib/ausleihe";
import { HEUTE, ICH, datum, kofferStatus, tageZwischen } from "@/lib/demo-daten";
import { KofferListe } from "./koffer/teile";

const t = de.uebersicht;

export default function Uebersicht() {
  const { koffer, reservierungen, meldungen } = useAusleihe();
  const zahl = (s: string) => koffer.filter((k) => kofferStatus(k) === s).length;
  const offen = meldungen.filter((m) => !m.erledigt).length;

  const meineIds = new Set([...koffer.filter((k) => k.ausgeliehenAn === ICH).map((k) => k.id), ...reservierungen.filter((r) => r.personId === ICH).map((r) => r.kofferId)]);
  const meine = koffer.filter((k) => meineIds.has(k.id));
  const ueberfaellig = koffer.filter((k) => kofferStatus(k) === "ueberfaellig");
  const bald = koffer
    .filter((k) => kofferStatus(k) === "unterwegs" && k.ausgeliehenAn !== ICH && k.rueckgabeBis && tageZwischen(HEUTE, k.rueckgabeBis) <= 7)
    .sort((a, b) => (a.rueckgabeBis ?? "").localeCompare(b.rueckgabeBis ?? ""));
  const hinweis = de.allgemein.stichtag(datum(HEUTE));

  return (
    <>
      <PageHeader title={t.title} lead={t.lead}>
        <ButtonLink href="/koffer" variante="primary" icon={Search}>
          {t.finden}
        </ButtonLink>
      </PageHeader>

      <Section title={t.kennzahlen}>
        <div className="grid grid-cols-2 gap-(--gap) lg:grid-cols-4">
          <Kennzahl label={t.imLager} wert={zahl("verfuegbar")} hinweis={hinweis} />
          <Kennzahl label={t.unterwegs} wert={zahl("unterwegs")} hinweis={hinweis} />
          <Kennzahl label={t.ueberfaellig} wert={zahl("ueberfaellig")} hinweis={hinweis} />
          <Kennzahl label={t.meldungen} wert={offen} hinweis={hinweis} />
        </div>
      </Section>

      <Section title={t.deine} action={<MehrLink href="/meine" />}>
        {meine.length === 0 ? <p className="text-small text-muted">{t.deineLeer}</p> : <KofferListe koffer={meine} />}
      </Section>

      <Section title={t.ueberfaelligTitel}>
        {ueberfaellig.length === 0 ? <p className="text-small text-muted">{t.ueberfaelligLeer}</p> : <KofferListe koffer={ueberfaellig} />}
      </Section>

      {bald.length > 0 ? (
        <Section title={t.baldZurueck} action={<MehrLink href="/koffer" />}>
          <KofferListe koffer={bald} />
        </Section>
      ) : null}
    </>
  );
}

function MehrLink({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-1 text-small font-medium text-accent hover:underline">
      {de.allgemein.alleAnzeigen} <ArrowRight className="size-4" aria-hidden />
    </Link>
  );
}

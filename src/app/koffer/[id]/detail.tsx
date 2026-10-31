"use client";

import { ArrowLeft, CalendarPlus, CircleCheck, PackageCheck, PackageOpen, SearchX, TriangleAlert } from "lucide-react";
import { useRef, useState } from "react";
import { Badge, Button, ButtonLink, Card, Dialog, EmptyState, Field, Hinweis, Input, PageHeader, Section } from "@/components/ui";
import { de } from "@/content/de";
import { personName, useAusleihe } from "@/lib/ausleihe";
import { HEUTE, ICH, datum, plusTage, tageZwischen, ueberschneidet, type Koffer, type Reservierung } from "@/lib/demo-daten";
import { Frist, StatusBadge, wo } from "../teile";

const t = de.detail;
const MAX_TAGE = 28;

export function KofferDetail({ id }: { id: string }) {
  const a = useAusleihe();
  const [dialog, setDialog] = useState<"ausleihen" | "reservieren" | null>(null);
  const k = a.koffer.find((x) => x.id === id);

  if (!k) {
    return (
      <EmptyState icon={SearchX} title={de.koffer.leerTitel} text={de.koffer.leerText}>
        <ButtonLink href="/koffer" icon={ArrowLeft}>
          {t.zurueck}
        </ButtonLink>
      </EmptyState>
    );
  }

  const beiMir = k.ausgeliehenAn === ICH;
  const imLager = !k.ausgeliehenAn;
  const reservierungen = a.reservierungen.filter((r) => r.kofferId === k.id).sort((x, y) => x.von.localeCompare(y.von));
  const offeneMeldung = (musterId: string) => a.meldungen.find((m) => m.musterId === musterId && !m.erledigt);

  return (
    <>
      <div className="-mb-4 flex">
        <ButtonLink href="/koffer" variante="ghost" groesse="s" icon={ArrowLeft} className="-ml-3">
          {t.zurueck}
        </ButtonLink>
      </div>

      <PageHeader title={`${k.nummer} ${k.name}`}>
        {beiMir ? (
          <Button variante="primary" icon={PackageCheck} onClick={() => a.zurueckgeben(k.id)}>
            {t.zurueckgeben}
          </Button>
        ) : imLager ? (
          <Button variante="primary" icon={PackageOpen} onClick={() => setDialog("ausleihen")}>
            {t.ausleihen}
          </Button>
        ) : null}
        <Button variante={beiMir || imLager ? "secondary" : "primary"} icon={CalendarPlus} onClick={() => setDialog("reservieren")}>
          {t.reservieren}
        </Button>
      </PageHeader>

      {/* Steckbrief: am Handy das Wichtigste im ersten Bildschirm */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <span className="font-mono text-small text-muted tabular-nums">{k.nummer}</span>
            <span className="text-h3 font-semibold">{k.name}</span>
            <span className="text-small text-muted">{k.serie}</span>
          </div>
          <StatusBadge koffer={k} />
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-small lg:grid-cols-4">
          <Angabe label={t.wo} wert={beiMir ? t.beiDir : wo(k)} />
          <Angabe label={t.lager} wert={k.lager} />
          {k.ausgeliehenSeit ? <Angabe label={t.seit} wert={datum(k.ausgeliehenSeit)} mono /> : null}
          {k.rueckgabeBis ? (
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted">{t.bis}</dt>
              <dd className="flex flex-col">
                <span className="font-mono tabular-nums">{datum(k.rueckgabeBis)}</span>
                <Frist bis={k.rueckgabeBis} />
              </dd>
            </div>
          ) : null}
        </dl>
      </Card>

      <Section title={t.muster}>
        <p className="-mt-1 max-w-[68ch] text-small text-text-2">{t.musterHinweis}</p>
        <ul className="flex flex-col gap-2 sm:gap-0 sm:overflow-hidden sm:rounded-card sm:bg-surface sm:shadow-card">
          {k.muster.map((m) => {
            const gemeldet = offeneMeldung(m.id);
            return (
              <li
                key={m.id}
                className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:gap-4 sm:rounded-none sm:px-(--pad-card) sm:py-3 sm:shadow-none sm:not-last:border-b sm:not-last:border-line"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">{m.bezeichnung}</span>
                  <span className="text-small text-muted">
                    {de.art[m.art]} · <span className="font-mono tabular-nums">{m.sap}</span>
                  </span>
                </div>
                {gemeldet ? (
                  <Badge ton="warn">
                    <TriangleAlert className="size-3.5" strokeWidth={2} aria-hidden />
                    {t.gemeldet(de.meldungArt[gemeldet.art])}
                  </Badge>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="mr-1 inline-flex items-center gap-1 text-small text-muted max-sm:hidden">
                      <CircleCheck className="size-4" strokeWidth={1.75} aria-hidden />
                      {t.vollstaendig}
                    </span>
                    <Button groesse="s" variante="outline" aria-label={t.meldenFehltLabel(m.bezeichnung)} onClick={() => a.melden(k.id, m.id, "fehlt")} className="max-sm:flex-1">
                      {t.meldenFehlt}
                    </Button>
                    <Button groesse="s" variante="outline" aria-label={t.meldenVeraltetLabel(m.bezeichnung)} onClick={() => a.melden(k.id, m.id, "veraltet")} className="max-sm:flex-1">
                      {t.meldenVeraltet}
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <Hinweis title={t.pimHinweisTitel}>{t.pimHinweis}</Hinweis>
      </Section>

      <Section title={t.reservierungen}>
        {reservierungen.length === 0 ? (
          <p className="text-small text-muted">{t.keineReservierung}</p>
        ) : (
          <ul className="flex flex-col gap-2 sm:gap-0 sm:overflow-hidden sm:rounded-card sm:bg-surface sm:shadow-card">
            {reservierungen.map((r) => {
              const zeitraum = `${datum(r.von)}–${datum(r.bis)}`;
              return (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-card bg-surface p-4 shadow-card sm:rounded-none sm:px-(--pad-card) sm:py-3 sm:shadow-none sm:not-last:border-b sm:not-last:border-line"
                >
                  <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-4">
                    <span className="font-mono text-small tabular-nums sm:w-48">{zeitraum}</span>
                    <span className="font-medium sm:w-40">{personName(r.personId)}</span>
                    {r.zweck ? <span className="truncate text-small text-muted">{r.zweck}</span> : null}
                  </div>
                  {r.personId === ICH ? (
                    <Button groesse="s" variante="ghost" aria-label={t.stornierenLabel(zeitraum)} onClick={() => a.stornieren(r.id)}>
                      {t.stornieren}
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <ZeitraumDialog
        key={dialog ?? "zu"}
        art={dialog}
        koffer={k}
        reservierungen={reservierungen}
        schliessen={() => setDialog(null)}
        ausleihen={(bis) => a.ausleihen(k.id, bis)}
        reservieren={(von, bis, zweck) => a.reservieren({ kofferId: k.id, von, bis, zweck: zweck || undefined })}
      />
    </>
  );
}

function Angabe({ label, wert, mono }: { label: string; wert: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted">{label}</dt>
      <dd className={mono ? "font-mono tabular-nums" : undefined}>{wert}</dd>
    </div>
  );
}

// Formular im Dialog: Ausleihen (nur Rückgabedatum) oder Reservieren (Von, Bis, Zweck).
// Geprüft wird beim Verlassen eines Feldes und beim Absenden; Absenden springt zum ersten Fehler.
type Feld = "von" | "bis";

function ZeitraumDialog({
  art,
  koffer,
  reservierungen,
  schliessen,
  ausleihen,
  reservieren,
}: {
  art: "ausleihen" | "reservieren" | null;
  koffer: Koffer;
  reservierungen: Reservierung[];
  schliessen: () => void;
  ausleihen: (bis: string) => void;
  reservieren: (von: string, bis: string, zweck: string) => void;
}) {
  const d = de.dialog;
  const istAusleihe = art === "ausleihen";
  const [von, setVon] = useState(istAusleihe ? HEUTE : "");
  const [bis, setBis] = useState(istAusleihe ? plusTage(HEUTE, 14) : "");
  const [zweck, setZweck] = useState("");
  const [fehler, setFehler] = useState<Partial<Record<Feld, string>>>({});
  const vonRef = useRef<HTMLInputElement>(null);
  const bisRef = useRef<HTMLInputElement>(null);

  // Belegt: Reservierungen anderer und die laufende Ausleihe (bei Ausleihe zählt die eigene Reservierung nicht)
  const belegt = [
    ...reservierungen.filter((r) => !(istAusleihe && r.personId === ICH)).map((r) => ({ von: r.von, bis: r.bis, wer: personName(r.personId) })),
    ...(koffer.ausgeliehenAn && !istAusleihe
      ? [{ von: koffer.ausgeliehenSeit ?? HEUTE, bis: koffer.rueckgabeBis && koffer.rueckgabeBis > HEUTE ? koffer.rueckgabeBis : HEUTE, wer: personName(koffer.ausgeliehenAn) }]
      : []),
  ];

  function pruefe(feld?: Feld) {
    const f: Partial<Record<Feld, string>> = {};
    if (!von) f.von = d.fehlerPflicht;
    else if (von < HEUTE) f.von = d.fehlerVergangen;
    if (!bis) f.bis = d.fehlerPflicht;
    else if (von && bis < von) f.bis = d.fehlerReihenfolge;
    else if (von && tageZwischen(von, bis) + 1 > MAX_TAGE) f.bis = d.fehlerZuLang;
    else if (von) {
      const konflikt = belegt.find((b) => ueberschneidet({ von, bis }, b));
      if (konflikt) f.bis = d.fehlerBelegt(konflikt.wer, `${datum(konflikt.von)}–${datum(konflikt.bis)}`);
    }
    if (feld) {
      setFehler((alt) => ({ ...alt, [feld]: f[feld] }));
      return f;
    }
    setFehler(f);
    return f;
  }

  function absenden(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = pruefe();
    const erster = (["von", "bis"] as Feld[]).find((x) => f[x]);
    if (erster) {
      (erster === "von" ? vonRef : bisRef).current?.focus();
      return;
    }
    if (istAusleihe) ausleihen(bis);
    else reservieren(von, bis, zweck.trim());
    schliessen();
  }

  return (
    <Dialog
      offen={art !== null}
      schliessen={schliessen}
      schliessenLabel={de.allgemein.schliessen}
      titel={istAusleihe ? d.ausleihenTitel(koffer.nummer) : d.reservierenTitel(koffer.nummer)}
      text={istAusleihe ? d.ausleihenText : d.reservierenText}
      onSubmit={absenden}
      aktionen={
        <>
          <Button variante="outline" onClick={schliessen}>
            {de.allgemein.abbrechen}
          </Button>
          <Button type="submit" variante="primary">
            {istAusleihe ? d.ausleihenBestaetigen : d.reservierenBestaetigen}
          </Button>
        </>
      }
    >
      {istAusleihe ? null : (
        <Field label={d.von} fehler={fehler.von}>
          <Input ref={vonRef} type="date" min={HEUTE} value={von} onChange={(e) => setVon(e.target.value)} onBlur={() => pruefe("von")} aria-invalid={!!fehler.von} />
        </Field>
      )}
      <Field label={istAusleihe ? d.rueckgabe : d.bis} hinweis={d.rueckgabeHinweis} fehler={fehler.bis}>
        <Input ref={bisRef} type="date" min={von || HEUTE} value={bis} onChange={(e) => setBis(e.target.value)} onBlur={() => pruefe("bis")} aria-invalid={!!fehler.bis} />
      </Field>
      {istAusleihe ? null : (
        <Field label={d.zweck} optional={d.optional} hinweis={d.zweckHinweis}>
          <Input value={zweck} onChange={(e) => setZweck(e.target.value)} maxLength={80} />
        </Field>
      )}
    </Dialog>
  );
}

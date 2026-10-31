"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { de } from "@/content/de";
import { HEUTE, ICH, KOFFER, MELDUNGEN, PERSONEN, RESERVIERUNGEN, datum, type Koffer, type Meldung, type MeldungArt, type Reservierung } from "./demo-daten";

// Zustand der Ausleihe in der Vorschau: startet mit den Testdaten, Änderungen bleiben im Browser (localStorage).
// Im Zielbild ersetzen die Aktionen Aufrufe der API in backend/app/main.py (gleiche Felder).

const t = de.toast;

interface Stand {
  koffer: Koffer[];
  reservierungen: Reservierung[];
  meldungen: Meldung[];
}

const START: Stand = { koffer: KOFFER, reservierungen: RESERVIERUNGEN, meldungen: MELDUNGEN };
const SCHLUESSEL = "lumora-musterkoffer-v1";

export interface Toast {
  id: number;
  text: string;
  rueckgaengig?: () => void;
}

interface Ausleihe extends Stand {
  ausleihen: (kofferId: string, bis: string) => void;
  zurueckgeben: (kofferId: string) => void;
  reservieren: (r: Omit<Reservierung, "id" | "personId">) => void;
  stornieren: (reservierungId: string) => void;
  melden: (kofferId: string, musterId: string, art: MeldungArt) => void;
  erledigen: (meldungId: string, erledigt: boolean) => void;
  zuruecksetzen: () => void;
  /** Kurze Meldung unten, optional mit „Rückgängig“ */
  zeige: (text: string, rueckgaengig?: () => void) => void;
  toast: Toast | null;
  schliesseToast: () => void;
}

const Ctx = createContext<Ausleihe | null>(null);

export function AusleiheProvider({ children }: { children: React.ReactNode }) {
  const [stand, setStand] = useState<Stand>(START);
  const [toast, setToast] = useState<Toast | null>(null);
  const geladen = useRef(false);

  // Nach dem ersten Zeichnen den gespeicherten Stand laden (statisch gebaut: der Server kennt keinen Browser-Speicher).
  useEffect(() => {
    try {
      const roh = window.localStorage.getItem(SCHLUESSEL);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- einmalig nach dem Laden aus dem Browser
      if (roh) setStand(JSON.parse(roh) as Stand);
    } catch {
      // kaputter Speicher: mit Testdaten weiterarbeiten
    }
    geladen.current = true;
  }, []);

  useEffect(() => {
    if (!geladen.current) return;
    try {
      window.localStorage.setItem(SCHLUESSEL, JSON.stringify(stand));
    } catch {
      // Speicher voll oder gesperrt: Zustand bleibt bis zum Neuladen erhalten
    }
  }, [stand]);

  const zeige = useCallback((text: string, rueckgaengig?: () => void) => setToast({ id: Date.now(), text, rueckgaengig }), []);
  const schliesseToast = useCallback(() => setToast(null), []);

  const wert = useMemo<Ausleihe>(() => {
    // Jede Änderung merkt sich den Stand davor, damit „Rückgängig“ ihn wiederherstellen kann.
    const aendere = (f: (s: Stand) => Stand, text: string) => {
      setStand(f(stand));
      zeige(text, () => {
        setStand(stand);
        zeige(de.allgemein.rueckgaengigGemacht);
      });
    };
    const nr = (id: string) => stand.koffer.find((k) => k.id === id)?.nummer ?? id;
    return {
      ...stand,
      toast,
      zeige,
      schliesseToast,
      ausleihen: (kofferId, bis) =>
        aendere(
          (s) => ({
            ...s,
            koffer: s.koffer.map((k) => (k.id === kofferId ? { ...k, ausgeliehenAn: ICH, ausgeliehenSeit: HEUTE, rueckgabeBis: bis } : k)),
            // eigene Reservierung, die schon begonnen hat, ist mit dem Abholen eingelöst
            reservierungen: s.reservierungen.filter((r) => !(r.kofferId === kofferId && r.personId === ICH && r.von <= HEUTE)),
          }),
          t.ausgeliehen(nr(kofferId), datum(bis)),
        ),
      zurueckgeben: (kofferId) =>
        aendere(
          (s) => ({
            ...s,
            koffer: s.koffer.map((k) => (k.id === kofferId ? { ...k, ausgeliehenAn: undefined, ausgeliehenSeit: undefined, rueckgabeBis: undefined } : k)),
          }),
          t.zurueckgegeben(nr(kofferId)),
        ),
      reservieren: (r) =>
        aendere(
          (s) => ({ ...s, reservierungen: [...s.reservierungen, { ...r, id: `r${Date.now()}`, personId: ICH }] }),
          t.reserviert(nr(r.kofferId), `${datum(r.von)}–${datum(r.bis)}`),
        ),
      stornieren: (id) => aendere((s) => ({ ...s, reservierungen: s.reservierungen.filter((r) => r.id !== id) }), t.storniert),
      melden: (kofferId, musterId, art) => {
        const muster = stand.koffer.find((k) => k.id === kofferId)?.muster.find((m) => m.id === musterId)?.bezeichnung ?? "";
        aendere(
          (s) => ({
            ...s,
            meldungen: [{ id: `n${Date.now()}`, kofferId, musterId, art, personId: ICH, am: HEUTE, erledigt: false }, ...s.meldungen],
          }),
          t.gemeldet(de.meldungArt[art], muster),
        );
      },
      erledigen: (id, erledigt) =>
        aendere((s) => ({ ...s, meldungen: s.meldungen.map((m) => (m.id === id ? { ...m, erledigt } : m)) }), erledigt ? t.erledigt : t.wiederOffen),
      zuruecksetzen: () => aendere(() => START, t.zurueckgesetzt),
    };
  }, [stand, toast, zeige, schliesseToast]);

  return <Ctx.Provider value={wert}>{children}</Ctx.Provider>;
}

export function useAusleihe() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAusleihe nur innerhalb von <AusleiheProvider>");
  return c;
}

export function person(id?: string) {
  return PERSONEN.find((p) => p.id === id);
}

export function personName(id?: string) {
  return id === ICH ? de.allgemein.du : (person(id)?.name ?? "");
}

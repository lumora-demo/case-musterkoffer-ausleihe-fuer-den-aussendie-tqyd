// Testdaten der erfundenen Lumora Systeme AG. Keine echten Firmen, Personen oder Zahlen.
// Felder wie im Backend (backend/app/main.py). Datumswerte als „JJJJ-MM-TT“.

/** Stichtag der Testdaten: „heute“ in der Vorschau, damit Fristen immer gleich aussehen. */
export const HEUTE = "2026-10-31";

export type MusterArt = "profil" | "beschlag" | "dichtung" | "oberflaeche";
export type MeldungArt = "fehlt" | "veraltet";
export type KofferStatus = "verfuegbar" | "unterwegs" | "ueberfaellig";

export interface Person {
  id: string;
  name: string;
  gebiet: string;
}

export interface Muster {
  id: string;
  /** SAP-Nummer des Artikels (erfunden) */
  sap: string;
  bezeichnung: string;
  art: MusterArt;
}

export interface Koffer {
  id: string;
  /** Kofferkennung, steht auf dem Aufkleber */
  nummer: string;
  name: string;
  serie: string;
  /** Heimatlager, dorthin geht der Koffer zurück */
  lager: string;
  /** Person, die den Koffer gerade hat; leer = im Lager */
  ausgeliehenAn?: string;
  ausgeliehenSeit?: string;
  rueckgabeBis?: string;
  muster: Muster[];
}

export interface Reservierung {
  id: string;
  kofferId: string;
  personId: string;
  von: string;
  bis: string;
  zweck?: string;
}

export interface Meldung {
  id: string;
  kofferId: string;
  musterId: string;
  art: MeldungArt;
  personId: string;
  am: string;
  erledigt: boolean;
}

/** Angemeldete Person in der Vorschau (im Zielbild aus Entra ID) */
export const ICH = "p1";

export const PERSONEN: Person[] = [
  { id: "p1", name: "Jana Brück", gebiet: "Außendienst Süd" },
  { id: "p2", name: "Tobias Kerner", gebiet: "Außendienst Nord" },
  { id: "p3", name: "Mira Olsen", gebiet: "Außendienst West" },
  { id: "p4", name: "Deniz Arslan", gebiet: "Außendienst Ost" },
  { id: "p5", name: "Selma Vogt", gebiet: "Musterlager Werk 1" },
];

export const KOFFER: Koffer[] = [
  {
    id: "k1",
    nummer: "MK-101",
    name: "Fenster Profilserie 70",
    serie: "Serie 70",
    lager: "Musterlager Werk 1",
    muster: [
      { id: "m1", sap: "300 1041", bezeichnung: "Rahmenprofil 70 mm, Eckschnitt", art: "profil" },
      { id: "m2", sap: "300 1042", bezeichnung: "Flügelprofil 70 mm, Eckschnitt", art: "profil" },
      { id: "m3", sap: "410 2210", bezeichnung: "Mitteldichtung EPDM, schwarz", art: "dichtung" },
      { id: "m4", sap: "520 0711", bezeichnung: "Dreh-Kipp-Beschlag, Ecklager", art: "beschlag" },
      { id: "m5", sap: "610 0090", bezeichnung: "Farbfächer Pulverbeschichtung", art: "oberflaeche" },
    ],
  },
  {
    id: "k2",
    nummer: "MK-102",
    name: "Fenster Profilserie 70",
    serie: "Serie 70",
    lager: "Musterlager Werk 1",
    ausgeliehenAn: "p2",
    ausgeliehenSeit: "2026-10-20",
    rueckgabeBis: "2026-11-07",
    muster: [
      { id: "m6", sap: "300 1041", bezeichnung: "Rahmenprofil 70 mm, Eckschnitt", art: "profil" },
      { id: "m7", sap: "300 1042", bezeichnung: "Flügelprofil 70 mm, Eckschnitt", art: "profil" },
      { id: "m8", sap: "410 2210", bezeichnung: "Mitteldichtung EPDM, schwarz", art: "dichtung" },
      { id: "m9", sap: "520 0711", bezeichnung: "Dreh-Kipp-Beschlag, Ecklager", art: "beschlag" },
    ],
  },
  {
    id: "k3",
    nummer: "MK-201",
    name: "Haustür T60",
    serie: "Serie T60",
    lager: "Musterlager Werk 1",
    ausgeliehenAn: "p1",
    ausgeliehenSeit: "2026-10-24",
    rueckgabeBis: "2026-11-04",
    muster: [
      { id: "m10", sap: "320 4410", bezeichnung: "Türrahmenprofil 60 mm", art: "profil" },
      { id: "m11", sap: "320 4415", bezeichnung: "Flachschwelle, barrierefrei", art: "profil" },
      { id: "m12", sap: "530 1120", bezeichnung: "Mehrfachverriegelung, Schnitt", art: "beschlag" },
      { id: "m13", sap: "530 1188", bezeichnung: "Rollenband, 3-teilig", art: "beschlag" },
      { id: "m14", sap: "610 0120", bezeichnung: "Oberflächenmuster Eloxal C0", art: "oberflaeche" },
    ],
  },
  {
    id: "k4",
    nummer: "MK-301",
    name: "Fassade F50",
    serie: "Serie F50",
    lager: "Musterlager Werk 2",
    ausgeliehenAn: "p3",
    ausgeliehenSeit: "2026-10-06",
    rueckgabeBis: "2026-10-27",
    muster: [
      { id: "m15", sap: "340 7001", bezeichnung: "Pfostenprofil 50 mm", art: "profil" },
      { id: "m16", sap: "340 7002", bezeichnung: "Riegelprofil 50 mm", art: "profil" },
      { id: "m17", sap: "420 3300", bezeichnung: "Isolatorsteg, Schnitt", art: "dichtung" },
      { id: "m18", sap: "610 0150", bezeichnung: "Farbfächer Fassade", art: "oberflaeche" },
    ],
  },
  {
    id: "k5",
    nummer: "MK-302",
    name: "Fassade F50",
    serie: "Serie F50",
    lager: "Musterlager Werk 2",
    muster: [
      { id: "m19", sap: "340 7001", bezeichnung: "Pfostenprofil 50 mm", art: "profil" },
      { id: "m20", sap: "340 7002", bezeichnung: "Riegelprofil 50 mm", art: "profil" },
      { id: "m21", sap: "420 3300", bezeichnung: "Isolatorsteg, Schnitt", art: "dichtung" },
    ],
  },
  {
    id: "k6",
    nummer: "MK-401",
    name: "Beschläge kompakt",
    serie: "Beschlag B-12",
    lager: "Musterlager Werk 1",
    muster: [
      { id: "m22", sap: "520 1200", bezeichnung: "Fenstergriff B-12, abschließbar", art: "beschlag" },
      { id: "m23", sap: "520 1210", bezeichnung: "Verdeckt liegendes Band", art: "beschlag" },
      { id: "m24", sap: "520 1230", bezeichnung: "Pilzkopfzapfen, Sicherheit", art: "beschlag" },
      { id: "m25", sap: "520 1240", bezeichnung: "Spaltlüftung, Schere", art: "beschlag" },
    ],
  },
  {
    id: "k7",
    nummer: "MK-402",
    name: "Beschläge kompakt",
    serie: "Beschlag B-12",
    lager: "Musterlager Werk 1",
    ausgeliehenAn: "p4",
    ausgeliehenSeit: "2026-10-13",
    rueckgabeBis: "2026-10-30",
    muster: [
      { id: "m26", sap: "520 1200", bezeichnung: "Fenstergriff B-12, abschließbar", art: "beschlag" },
      { id: "m27", sap: "520 1210", bezeichnung: "Verdeckt liegendes Band", art: "beschlag" },
      { id: "m28", sap: "520 1230", bezeichnung: "Pilzkopfzapfen, Sicherheit", art: "beschlag" },
    ],
  },
  {
    id: "k8",
    nummer: "MK-501",
    name: "Hebe-Schiebetür HS 80",
    serie: "Serie HS 80",
    lager: "Musterlager Werk 2",
    muster: [
      { id: "m29", sap: "360 8800", bezeichnung: "Laufschiene mit Bodenschwelle", art: "profil" },
      { id: "m30", sap: "360 8810", bezeichnung: "Flügelprofil HS 80", art: "profil" },
      { id: "m31", sap: "540 2001", bezeichnung: "Hebe-Schiebe-Getriebe, Schnitt", art: "beschlag" },
      { id: "m32", sap: "410 2290", bezeichnung: "Bürstendichtung, grau", art: "dichtung" },
    ],
  },
];

export const RESERVIERUNGEN: Reservierung[] = [
  { id: "r1", kofferId: "k1", personId: "p3", von: "2026-11-03", bis: "2026-11-14", zweck: "Messe Regional West" },
  { id: "r2", kofferId: "k2", personId: "p1", von: "2026-11-10", bis: "2026-11-21", zweck: "Verarbeiter-Schulung" },
  { id: "r3", kofferId: "k5", personId: "p2", von: "2026-11-16", bis: "2026-11-27" },
  { id: "r4", kofferId: "k8", personId: "p4", von: "2026-11-02", bis: "2026-11-06", zweck: "Bauherrenabend" },
];

export const MELDUNGEN: Meldung[] = [
  { id: "n1", kofferId: "k2", musterId: "m8", art: "fehlt", personId: "p2", am: "2026-10-22", erledigt: false },
  { id: "n2", kofferId: "k4", musterId: "m18", art: "veraltet", personId: "p3", am: "2026-10-15", erledigt: false },
  { id: "n3", kofferId: "k6", musterId: "m25", art: "fehlt", personId: "p4", am: "2026-10-09", erledigt: false },
  { id: "n4", kofferId: "k1", musterId: "m5", art: "veraltet", personId: "p1", am: "2026-09-30", erledigt: true },
];

// Hilfen, die Frontend und Backend gleich rechnen

export function kofferStatus(k: Koffer, heute = HEUTE): KofferStatus {
  if (!k.ausgeliehenAn) return "verfuegbar";
  return k.rueckgabeBis && k.rueckgabeBis < heute ? "ueberfaellig" : "unterwegs";
}

/** Tage zwischen zwei Datumswerten (b − a) */
export function tageZwischen(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

export function plusTage(datum: string, tage: number) {
  const d = new Date(`${datum}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + tage);
  return d.toISOString().slice(0, 10);
}

/** Überschneiden sich zwei Zeiträume (jeweils inklusive)? */
export function ueberschneidet(a: { von: string; bis: string }, b: { von: string; bis: string }) {
  return a.von <= b.bis && b.von <= a.bis;
}

export function datum(iso: string) {
  const [j, m, t] = iso.split("-");
  return `${t}.${m}.${j}`;
}

export function datumKurz(iso: string) {
  const [, m, t] = iso.split("-");
  return `${t}.${m}.`;
}

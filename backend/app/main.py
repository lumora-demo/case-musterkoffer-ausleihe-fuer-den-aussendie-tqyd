"""API der Musterkoffer-Ausleihe (Zielbild: Azure App Service, Azure SQL, Anmeldung über Entra ID).

Läuft in der Live-Vorschau nicht mit; das Frontend nutzt dort die Testdaten aus src/lib/demo-daten.ts
und speichert Änderungen im Browser. Felder wie dort. Daten hier nur im Speicher (Testdaten).
Offen im Zielbild: Musterlisten aus der Produktdaten-API (PIM), angemeldete Person aus dem Entra-ID-Token.
"""

from datetime import date, timedelta
from itertools import count
from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Lumora Musterkoffer")

HEUTE = "2026-10-31"  # Stichtag der Testdaten, im Betrieb date.today()
ICH = "p1"  # im Betrieb aus dem Entra-ID-Token
MAX_TAGE = 28

MusterArt = Literal["profil", "beschlag", "dichtung", "oberflaeche"]
MeldungArt = Literal["fehlt", "veraltet"]


class Person(BaseModel):
    id: str
    name: str
    gebiet: str


class Muster(BaseModel):
    id: str
    sap: str
    bezeichnung: str
    art: MusterArt


class Koffer(BaseModel):
    id: str
    nummer: str
    name: str
    serie: str
    lager: str
    ausgeliehenAn: str | None = None
    ausgeliehenSeit: str | None = None
    rueckgabeBis: str | None = None
    muster: list[Muster]


class Reservierung(BaseModel):
    id: str
    kofferId: str
    personId: str
    von: str
    bis: str
    zweck: str | None = None


class Meldung(BaseModel):
    id: str
    kofferId: str
    musterId: str
    art: MeldungArt
    personId: str
    am: str
    erledigt: bool


class AusleiheNeu(BaseModel):
    rueckgabeBis: str


class ReservierungNeu(BaseModel):
    kofferId: str
    von: str
    bis: str
    zweck: str | None = Field(default=None, max_length=80)


class MeldungNeu(BaseModel):
    kofferId: str
    musterId: str
    art: MeldungArt


class MeldungAenderung(BaseModel):
    erledigt: bool


def _m(id: str, sap: str, bez: str, art: MusterArt) -> Muster:
    return Muster(id=id, sap=sap, bezeichnung=bez, art=art)


PERSONEN = [
    Person(id="p1", name="Jana Brück", gebiet="Außendienst Süd"),
    Person(id="p2", name="Tobias Kerner", gebiet="Außendienst Nord"),
    Person(id="p3", name="Mira Olsen", gebiet="Außendienst West"),
    Person(id="p4", name="Deniz Arslan", gebiet="Außendienst Ost"),
    Person(id="p5", name="Selma Vogt", gebiet="Musterlager Werk 1"),
]

KOFFER = [
    Koffer(id="k1", nummer="MK-101", name="Fenster Profilserie 70", serie="Serie 70", lager="Musterlager Werk 1", muster=[
        _m("m1", "300 1041", "Rahmenprofil 70 mm, Eckschnitt", "profil"),
        _m("m2", "300 1042", "Flügelprofil 70 mm, Eckschnitt", "profil"),
        _m("m3", "410 2210", "Mitteldichtung EPDM, schwarz", "dichtung"),
        _m("m4", "520 0711", "Dreh-Kipp-Beschlag, Ecklager", "beschlag"),
        _m("m5", "610 0090", "Farbfächer Pulverbeschichtung", "oberflaeche"),
    ]),
    Koffer(id="k2", nummer="MK-102", name="Fenster Profilserie 70", serie="Serie 70", lager="Musterlager Werk 1",
           ausgeliehenAn="p2", ausgeliehenSeit="2026-10-20", rueckgabeBis="2026-11-07", muster=[
        _m("m6", "300 1041", "Rahmenprofil 70 mm, Eckschnitt", "profil"),
        _m("m7", "300 1042", "Flügelprofil 70 mm, Eckschnitt", "profil"),
        _m("m8", "410 2210", "Mitteldichtung EPDM, schwarz", "dichtung"),
        _m("m9", "520 0711", "Dreh-Kipp-Beschlag, Ecklager", "beschlag"),
    ]),
    Koffer(id="k3", nummer="MK-201", name="Haustür T60", serie="Serie T60", lager="Musterlager Werk 1",
           ausgeliehenAn="p1", ausgeliehenSeit="2026-10-24", rueckgabeBis="2026-11-04", muster=[
        _m("m10", "320 4410", "Türrahmenprofil 60 mm", "profil"),
        _m("m11", "320 4415", "Flachschwelle, barrierefrei", "profil"),
        _m("m12", "530 1120", "Mehrfachverriegelung, Schnitt", "beschlag"),
        _m("m13", "530 1188", "Rollenband, 3-teilig", "beschlag"),
        _m("m14", "610 0120", "Oberflächenmuster Eloxal C0", "oberflaeche"),
    ]),
    Koffer(id="k4", nummer="MK-301", name="Fassade F50", serie="Serie F50", lager="Musterlager Werk 2",
           ausgeliehenAn="p3", ausgeliehenSeit="2026-10-06", rueckgabeBis="2026-10-27", muster=[
        _m("m15", "340 7001", "Pfostenprofil 50 mm", "profil"),
        _m("m16", "340 7002", "Riegelprofil 50 mm", "profil"),
        _m("m17", "420 3300", "Isolatorsteg, Schnitt", "dichtung"),
        _m("m18", "610 0150", "Farbfächer Fassade", "oberflaeche"),
    ]),
    Koffer(id="k5", nummer="MK-302", name="Fassade F50", serie="Serie F50", lager="Musterlager Werk 2", muster=[
        _m("m19", "340 7001", "Pfostenprofil 50 mm", "profil"),
        _m("m20", "340 7002", "Riegelprofil 50 mm", "profil"),
        _m("m21", "420 3300", "Isolatorsteg, Schnitt", "dichtung"),
    ]),
    Koffer(id="k6", nummer="MK-401", name="Beschläge kompakt", serie="Beschlag B-12", lager="Musterlager Werk 1", muster=[
        _m("m22", "520 1200", "Fenstergriff B-12, abschließbar", "beschlag"),
        _m("m23", "520 1210", "Verdeckt liegendes Band", "beschlag"),
        _m("m24", "520 1230", "Pilzkopfzapfen, Sicherheit", "beschlag"),
        _m("m25", "520 1240", "Spaltlüftung, Schere", "beschlag"),
    ]),
    Koffer(id="k7", nummer="MK-402", name="Beschläge kompakt", serie="Beschlag B-12", lager="Musterlager Werk 1",
           ausgeliehenAn="p4", ausgeliehenSeit="2026-10-13", rueckgabeBis="2026-10-30", muster=[
        _m("m26", "520 1200", "Fenstergriff B-12, abschließbar", "beschlag"),
        _m("m27", "520 1210", "Verdeckt liegendes Band", "beschlag"),
        _m("m28", "520 1230", "Pilzkopfzapfen, Sicherheit", "beschlag"),
    ]),
    Koffer(id="k8", nummer="MK-501", name="Hebe-Schiebetür HS 80", serie="Serie HS 80", lager="Musterlager Werk 2", muster=[
        _m("m29", "360 8800", "Laufschiene mit Bodenschwelle", "profil"),
        _m("m30", "360 8810", "Flügelprofil HS 80", "profil"),
        _m("m31", "540 2001", "Hebe-Schiebe-Getriebe, Schnitt", "beschlag"),
        _m("m32", "410 2290", "Bürstendichtung, grau", "dichtung"),
    ]),
]

RESERVIERUNGEN = [
    Reservierung(id="r1", kofferId="k1", personId="p3", von="2026-11-03", bis="2026-11-14", zweck="Messe Regional West"),
    Reservierung(id="r2", kofferId="k2", personId="p1", von="2026-11-10", bis="2026-11-21", zweck="Verarbeiter-Schulung"),
    Reservierung(id="r3", kofferId="k5", personId="p2", von="2026-11-16", bis="2026-11-27"),
    Reservierung(id="r4", kofferId="k8", personId="p4", von="2026-11-02", bis="2026-11-06", zweck="Bauherrenabend"),
]

MELDUNGEN = [
    Meldung(id="n1", kofferId="k2", musterId="m8", art="fehlt", personId="p2", am="2026-10-22", erledigt=False),
    Meldung(id="n2", kofferId="k4", musterId="m18", art="veraltet", personId="p3", am="2026-10-15", erledigt=False),
    Meldung(id="n3", kofferId="k6", musterId="m25", art="fehlt", personId="p4", am="2026-10-09", erledigt=False),
    Meldung(id="n4", kofferId="k1", musterId="m5", art="veraltet", personId="p1", am="2026-09-30", erledigt=True),
]

_ids = count(100)


def _koffer(koffer_id: str) -> Koffer:
    for k in KOFFER:
        if k.id == koffer_id:
            return k
    raise HTTPException(status_code=404, detail="Koffer nicht gefunden")


def _pruefe_zeitraum(k: Koffer, von: str, bis: str, eigene_reservierungen_ignorieren: bool) -> None:
    try:
        d_von, d_bis = date.fromisoformat(von), date.fromisoformat(bis)
    except ValueError:
        raise HTTPException(status_code=422, detail="Datum im Format JJJJ-MM-TT angeben")
    if von < HEUTE:
        raise HTTPException(status_code=422, detail="Das Datum liegt in der Vergangenheit.")
    if d_bis < d_von:
        raise HTTPException(status_code=422, detail="„Bis“ liegt vor „Von“.")
    if d_bis - d_von >= timedelta(days=MAX_TAGE):
        raise HTTPException(status_code=422, detail="Höchstens 28 Tage am Stück.")
    for r in RESERVIERUNGEN:
        if r.kofferId != k.id or (eigene_reservierungen_ignorieren and r.personId == ICH):
            continue
        if von <= r.bis and r.von <= bis:
            raise HTTPException(status_code=409, detail=f"Schon reserviert {r.von} bis {r.bis}")


@app.get("/api/gesund")
def gesund() -> dict:
    return {"ok": True}


@app.get("/api/personen")
def personen() -> list[Person]:
    return PERSONEN


@app.get("/api/koffer")
def koffer_liste() -> list[Koffer]:
    return KOFFER


@app.get("/api/koffer/{koffer_id}")
def koffer(koffer_id: str) -> Koffer:
    return _koffer(koffer_id)


@app.post("/api/koffer/{koffer_id}/ausleihe")
def ausleihen(koffer_id: str, daten: AusleiheNeu) -> Koffer:
    k = _koffer(koffer_id)
    if k.ausgeliehenAn:
        raise HTTPException(status_code=409, detail="Koffer ist schon ausgeliehen")
    _pruefe_zeitraum(k, HEUTE, daten.rueckgabeBis, eigene_reservierungen_ignorieren=True)
    k.ausgeliehenAn, k.ausgeliehenSeit, k.rueckgabeBis = ICH, HEUTE, daten.rueckgabeBis
    RESERVIERUNGEN[:] = [r for r in RESERVIERUNGEN if not (r.kofferId == k.id and r.personId == ICH and r.von <= HEUTE)]
    return k


@app.post("/api/koffer/{koffer_id}/rueckgabe")
def zurueckgeben(koffer_id: str) -> Koffer:
    k = _koffer(koffer_id)
    if k.ausgeliehenAn != ICH:
        raise HTTPException(status_code=409, detail="Koffer ist nicht bei dir")
    k.ausgeliehenAn = k.ausgeliehenSeit = k.rueckgabeBis = None
    return k


@app.get("/api/reservierungen")
def reservierungen(koffer_id: str | None = None) -> list[Reservierung]:
    return [r for r in RESERVIERUNGEN if koffer_id is None or r.kofferId == koffer_id]


@app.post("/api/reservierungen", status_code=201)
def reservieren(daten: ReservierungNeu) -> Reservierung:
    k = _koffer(daten.kofferId)
    _pruefe_zeitraum(k, daten.von, daten.bis, eigene_reservierungen_ignorieren=False)
    if k.ausgeliehenAn and k.rueckgabeBis and daten.von <= max(k.rueckgabeBis, HEUTE):
        raise HTTPException(status_code=409, detail=f"Ausgeliehen bis {k.rueckgabeBis}")
    r = Reservierung(id=f"r{next(_ids)}", personId=ICH, **daten.model_dump())
    RESERVIERUNGEN.append(r)
    return r


@app.delete("/api/reservierungen/{reservierung_id}", status_code=204)
def stornieren(reservierung_id: str) -> None:
    for r in RESERVIERUNGEN:
        if r.id == reservierung_id:
            if r.personId != ICH:
                raise HTTPException(status_code=403, detail="Nur eigene Reservierungen stornieren")
            RESERVIERUNGEN.remove(r)
            return
    raise HTTPException(status_code=404, detail="Reservierung nicht gefunden")


@app.get("/api/meldungen")
def meldungen(erledigt: bool | None = None) -> list[Meldung]:
    return [m for m in MELDUNGEN if erledigt is None or m.erledigt == erledigt]


@app.post("/api/meldungen", status_code=201)
def melden(daten: MeldungNeu) -> Meldung:
    k = _koffer(daten.kofferId)
    if not any(m.id == daten.musterId for m in k.muster):
        raise HTTPException(status_code=404, detail="Muster nicht in diesem Koffer")
    m = Meldung(id=f"n{next(_ids)}", personId=ICH, am=HEUTE, erledigt=False, **daten.model_dump())
    MELDUNGEN.insert(0, m)
    return m


@app.patch("/api/meldungen/{meldung_id}")
def meldung_aendern(meldung_id: str, daten: MeldungAenderung) -> Meldung:
    for m in MELDUNGEN:
        if m.id == meldung_id:
            m.erledigt = daten.erledigt
            return m
    raise HTTPException(status_code=404, detail="Meldung nicht gefunden")

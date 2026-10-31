"use client";

import { Search, SearchX } from "lucide-react";
import { useState } from "react";
import { Button, EmptyState, Input, PageHeader, Segmented } from "@/components/ui";
import { de } from "@/content/de";
import { personName, useAusleihe } from "@/lib/ausleihe";
import { kofferStatus, type KofferStatus } from "@/lib/demo-daten";
import { KofferListe } from "./teile";

const t = de.koffer;

export default function KofferSeite() {
  const { koffer } = useAusleihe();
  const [filter, setFilter] = useState<KofferStatus | "alle">("alle");
  const [suche, setSuche] = useState("");

  const q = suche.trim().toLowerCase();
  const liste = koffer.filter((k) => {
    if (filter !== "alle" && kofferStatus(k) !== filter) return false;
    if (!q) return true;
    const text = [k.nummer, k.name, k.serie, k.lager, personName(k.ausgeliehenAn), ...k.muster.flatMap((m) => [m.sap, m.sap.replace(/\s/g, ""), m.bezeichnung])]
      .join(" ")
      .toLowerCase();
    return text.includes(q);
  });

  return (
    <>
      <PageHeader title={t.title} lead={t.lead} />
      {/* Handy: Suche und Filter bleiben unter der Kopfzeile stehen */}
      <div className="sticky top-(--mobile-bar-h) z-30 -mx-4 -my-3 flex flex-col gap-3 bg-bg/90 px-4 py-3 backdrop-blur-md sm:static sm:mx-0 sm:my-0 sm:flex-row sm:items-center sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <label className="relative sm:w-80">
          <span className="sr-only">{t.suche}</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" strokeWidth={1.75} aria-hidden />
          <Input type="search" value={suche} onChange={(e) => setSuche(e.target.value)} placeholder={t.suchePlatzhalter} className="pl-9" />
        </label>
        <Segmented
          label={t.filter}
          wert={filter}
          setze={setFilter}
          werte={[
            { id: "alle", name: t.alle },
            { id: "verfuegbar", name: de.status.verfuegbar },
            { id: "unterwegs", name: de.status.unterwegs },
            { id: "ueberfaellig", name: de.status.ueberfaellig },
          ]}
        />
      </div>
      {liste.length === 0 ? (
        <EmptyState icon={SearchX} title={t.leerTitel} text={t.leerText}>
          <Button
            variante="secondary"
            onClick={() => {
              setSuche("");
              setFilter("alle");
            }}
          >
            {t.filterZuruecksetzen}
          </Button>
        </EmptyState>
      ) : (
        <KofferListe koffer={liste} />
      )}
    </>
  );
}

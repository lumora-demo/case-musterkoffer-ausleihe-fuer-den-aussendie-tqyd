"use client";

import { Toast } from "@/components/ui";
import { de } from "@/content/de";
import { AusleiheProvider, useAusleihe } from "@/lib/ausleihe";

// Zustand der Ausleihe für alle Seiten und die Meldung unten (Toast).
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AusleiheProvider>
      {children}
      <ToastAnzeige />
    </AusleiheProvider>
  );
}

function ToastAnzeige() {
  const { toast, schliesseToast } = useAusleihe();
  return (
    <div aria-live="polite" role="status">
      {toast ? (
        <Toast
          key={toast.id}
          id={toast.id}
          text={toast.text}
          aktion={toast.rueckgaengig ? de.allgemein.rueckgaengig : undefined}
          onAktion={toast.rueckgaengig}
          schliessen={schliesseToast}
          schliessenLabel={de.allgemein.schliessen}
        />
      ) : null}
    </div>
  );
}

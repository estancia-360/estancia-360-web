import { useEffect } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { BulkImportWizard } from "../components/bulk-import-wizard";
import { useBulkImportCatalogs } from "../lib/catalogs";
import { parseGestationFile } from "../lib/parsers/gestation-parser";
import { bulkImportGestation } from "../api/bulk-import-api";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { translateError } from "@/lib/error-messages";
import type { ImportSection, SectionOutcome } from "../types";

export function GestationImportPage() {
  const { session } = useAuth();
  const { ranch } = useRanchSubscription();
  const { catalogs, isLoading, load } = useBulkImportCatalogs();

  useEffect(() => {
    if (!session) return;
    load(ranch.id, session.accessToken).catch((error) => toast.error(translateError(error, "No se pudieron cargar los catálogos de la estancia.")));
  }, [session, ranch.id, load]);

  if (isLoading || !catalogs || !session) {
    return (
      <div className="flex flex-1 items-center justify-center py-16 text-muted-foreground">
        <Spinner className="mr-2" /> Cargando catálogos de la estancia…
      </div>
    );
  }

  return (
    <BulkImportWizard
      title="Carga masiva — Diagnóstico de gestación / Tactos"
      description="Resultados de tacto de preñez, vinculados al último servicio reproductivo de cada animal."
      templateUrl="/plantillas/Planilla_Gestacion.xlsx"
      templateFileName="Planilla_Gestacion.xlsx"
      columns={["CÓDIGO DEL ANIMAL", "FECHA DE TACTO", "DIAGNÓSTICO (Preñada/Vacía)", "MESES DE GESTACIÓN", "OBSERVACIONES"]}
      parseFile={(file) => parseGestationFile(file, catalogs)}
      commit={async (sections: ImportSection[]): Promise<SectionOutcome[]> => {
        const section = sections[0];
        const result = await bulkImportGestation(ranch.id, section.rows.map((r) => r.payload), session.accessToken);
        return [{ key: section.key, label: section.label, result }];
      }}
    />
  );
}

import { useEffect } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { BulkImportWizard } from "../components/bulk-import-wizard";
import { useBulkImportCatalogs } from "../lib/catalogs";
import { parseWeightsFile } from "../lib/parsers/weights-parser";
import { bulkImportWeights } from "../api/bulk-import-api";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { translateError } from "@/lib/error-messages";
import type { ImportSection, SectionOutcome } from "../types";

export function WeightsImportPage() {
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
      title="Carga masiva — Pesajes"
      description="Historial de pesos y condición corporal de Recría/Engorde desde Excel."
      templateUrl="/plantillas/Registros_Pesajes.xlsx"
      templateFileName="Registros_Pesajes.xlsx"
      columns={["CÓDIGO DEL ANIMAL", "FECHA DE PESAJE", "PESO KG", "CONDICIÓN CORPORAL", "OBSERVACIONES"]}
      parseFile={(file) => parseWeightsFile(file, catalogs)}
      commit={async (sections: ImportSection[]): Promise<SectionOutcome[]> => {
        const section = sections[0];
        const result = await bulkImportWeights(ranch.id, section.rows.map((r) => r.payload), session.accessToken);
        return [{ key: section.key, label: section.label, result }];
      }}
    />
  );
}

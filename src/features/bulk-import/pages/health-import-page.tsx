import { useEffect } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { BulkImportWizard } from "../components/bulk-import-wizard";
import { useBulkImportCatalogs } from "../lib/catalogs";
import { parseHealthFile } from "../lib/parsers/health-parser";
import { bulkImportHealth } from "../api/bulk-import-api";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { translateError } from "@/lib/error-messages";
import type { ImportSection, SectionOutcome } from "../types";

export function HealthImportPage() {
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
      title="Carga masiva — Sanidad"
      description="Vacunas, tratamientos e incidentes sanitarios desde una única plantilla con 3 hojas."
      templateUrl="/plantillas/Plantilla_Carga_Masiva_Sanidad_Estancia360.xlsx"
      templateFileName="Plantilla_Carga_Masiva_Sanidad_Estancia360.xlsx"
      columns={["Hoja Carga_Vacunas", "Hoja Carga_Tratamientos", "Hoja Carga_Incidentes"]}
      parseFile={(file) => parseHealthFile(file, catalogs)}
      commit={async (sections: ImportSection[]): Promise<SectionOutcome[]> => {
        const bySection = Object.fromEntries(sections.map((s) => [s.key, s]));
        const result = await bulkImportHealth(
          ranch.id,
          {
            vaccinations: bySection.vaccinations?.rows.map((r) => r.payload) ?? [],
            treatments: bySection.treatments?.rows.map((r) => r.payload) ?? [],
            healthIncidents: bySection.healthIncidents?.rows.map((r) => r.payload) ?? [],
          },
          session.accessToken,
        );
        return [
          { key: "vaccinations", label: "Vacunas", result: result.vaccinations },
          { key: "treatments", label: "Tratamientos", result: result.treatments },
          { key: "healthIncidents", label: "Incidentes sanitarios", result: result.healthIncidents },
        ];
      }}
    />
  );
}

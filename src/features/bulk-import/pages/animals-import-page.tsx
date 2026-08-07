import { useEffect } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { BulkImportWizard } from "../components/bulk-import-wizard";
import { useBulkImportCatalogs } from "../lib/catalogs";
import { parseAnimalsFile } from "../lib/parsers/animals-parser";
import { bulkImportAnimals } from "../api/bulk-import-api";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { translateError } from "@/lib/error-messages";
import type { ImportSection, SectionOutcome } from "../types";

export function AnimalsImportPage() {
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
      title="Carga masiva — Animales"
      description="Alta de inventario inicial o incorporación masiva de animales desde Excel."
      templateUrl="/plantillas/Planilla_Alta_Inventario.xlsx"
      templateFileName="Planilla_Alta_Inventario.xlsx"
      columns={["CÓDIGO DEL ANIMAL", "SEXO", "CATEGORÍA", "RAZA", "FECHA DE NACIMIENTO", "LOTE ACTUAL (opcional)", "PESO ACTUAL"]}
      parseFile={(file) => parseAnimalsFile(file, catalogs)}
      commit={async (sections: ImportSection[]): Promise<SectionOutcome[]> => {
        const section = sections[0];
        const result = await bulkImportAnimals(ranch.id, section.rows.map((r) => r.payload), session.accessToken);
        return [{ key: section.key, label: section.label, result }];
      }}
    />
  );
}

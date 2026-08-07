import { useEffect } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { BulkImportWizard } from "../components/bulk-import-wizard";
import { useBulkImportCatalogs } from "../lib/catalogs";
import { parseMovementsFile } from "../lib/parsers/movements-parser";
import { bulkImportMovements } from "../api/bulk-import-api";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { translateError } from "@/lib/error-messages";
import type { ImportSection, SectionOutcome } from "../types";

export function MovementsImportPage() {
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
      title="Carga masiva — Movimientos"
      description="Compras, ventas, traslados, salidas a otra estancia y bajas — plantilla con 5 hojas agrupadas por ID_CARGA."
      templateUrl="/plantillas/Plantilla_Carga_Masiva_Movimientos_Estancia360.xlsx"
      templateFileName="Plantilla_Carga_Masiva_Movimientos_Estancia360.xlsx"
      columns={["Carga_Compras", "Carga_Ventas", "Carga_Traslados", "Carga_Salidas_Estancia", "Carga_Bajas"]}
      parseFile={(file) => parseMovementsFile(file, catalogs)}
      commit={async (sections: ImportSection[]): Promise<SectionOutcome[]> => {
        const bySection = Object.fromEntries(sections.map((s) => [s.key, s]));
        const result = await bulkImportMovements(
          ranch.id,
          {
            groups: bySection.groups?.rows.map((r) => r.payload) ?? [],
            exits: bySection.exits?.rows.map((r) => r.payload) ?? [],
          },
          session.accessToken,
        );
        return [
          { key: "movements", label: "Compras / Ventas / Traslados / Salidas", result: result.movements },
          { key: "exits", label: "Bajas", result: result.exits },
        ];
      }}
    />
  );
}

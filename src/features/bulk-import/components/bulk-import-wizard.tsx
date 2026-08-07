import { useRef, useState } from "react";
import { Upload, Download, CircleCheck, CircleX, RefreshCcw, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import type { ImportSection, SectionOutcome } from "../types";

type Step = "idle" | "parsing" | "preview" | "committing" | "done" | "error";

interface BulkImportWizardProps {
  title: string;
  description: string;
  templateUrl: string;
  templateFileName: string;
  columns: string[];
  parseFile: (file: File) => Promise<ImportSection[]>;
  commit: (sections: ImportSection[]) => Promise<SectionOutcome[]>;
}

export function BulkImportWizard({ title, description, templateUrl, templateFileName, columns, parseFile, commit }: BulkImportWizardProps) {
  const [step, setStep] = useState<Step>("idle");
  const [sections, setSections] = useState<ImportSection[]>([]);
  const [outcomes, setOutcomes] = useState<SectionOutcome[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalRows = sections.reduce((acc, s) => acc + s.rows.length, 0);
  const validRows = sections.reduce((acc, s) => acc + s.rows.filter((r) => !r.hasError).length, 0);
  const invalidRows = totalRows - validRows;

  const handleFile = async (file: File) => {
    setStep("parsing");
    setErrorMsg(null);
    try {
      const parsed = await parseFile(file);
      if (parsed.every((s) => s.rows.length === 0)) {
        setErrorMsg("El archivo no contiene filas de datos. Verificá que sea la plantilla correcta.");
        setStep("error");
        return;
      }
      setSections(parsed);
      setStep("preview");
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "No se pudo leer el archivo.");
      setStep("error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCommit = async () => {
    setStep("committing");
    try {
      const cleanSections = sections.map((s) => ({ ...s, rows: s.rows.filter((r) => !r.hasError) }));
      const results = await commit(cleanSections);
      setOutcomes(results);
      setStep("done");
      const succeeded = results.reduce((acc, r) => acc + r.result.succeeded, 0);
      const failed = results.reduce((acc, r) => acc + r.result.failed, 0);
      if (failed === 0) toast.success(`${succeeded} registro(s) importado(s) correctamente.`);
      else toast.warning(`${succeeded} importado(s), ${failed} con error — revisá el detalle abajo.`);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "No se pudo completar la carga.");
      setStep("error");
    }
  };

  const reset = () => {
    setStep("idle");
    setSections([]);
    setOutcomes([]);
    setErrorMsg(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <a href={templateUrl} download={templateFileName}>
            <Button type="button" variant="outline" size="sm">
              <Download data-icon="inline-start" />
              Descargar plantilla
            </Button>
          </a>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            id={`bulk-import-file-${title}`}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <Button type="button" size="sm" disabled={step === "parsing" || step === "committing"} onClick={() => fileInputRef.current?.click()}>
            {step === "parsing" ? <Spinner data-icon="inline-start" /> : <Upload data-icon="inline-start" />}
            Subir archivo lleno
          </Button>

          {step !== "idle" ? (
            <Button type="button" variant="ghost" size="sm" onClick={reset}>
              <RefreshCcw data-icon="inline-start" />
              Empezar de nuevo
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {step === "error" ? (
        <Card className="border-destructive/40">
          <CardContent className="flex items-center gap-3 py-4 text-sm text-destructive">
            <TriangleAlert className="size-5 shrink-0" />
            {errorMsg}
          </CardContent>
        </Card>
      ) : null}

      {step === "idle" ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Upload className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Descargá la plantilla, completala y subila</EmptyTitle>
            <EmptyDescription>
              Columnas de la plantilla: {columns.join(", ")}.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {step === "preview" || step === "committing" ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">{totalRows} fila(s) leídas</Badge>
            <Badge variant="default">{validRows} lista(s) para importar</Badge>
            {invalidRows > 0 ? <Badge variant="destructive">{invalidRows} con error</Badge> : null}
            <div className="flex-1" />
            <Button type="button" onClick={handleCommit} disabled={validRows === 0 || step === "committing"}>
              {step === "committing" ? <Spinner data-icon="inline-start" /> : <CircleCheck data-icon="inline-start" />}
              Importar {validRows} fila(s)
            </Button>
          </div>

          {sections.map((section) => (
            <SectionPreview key={section.key} section={section} />
          ))}
        </>
      ) : null}

      {step === "done" ? (
        <div className="flex flex-col gap-4">
          {outcomes.map((outcome) => (
            <ResultCard key={outcome.key} outcome={outcome} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SectionPreview({ section }: { section: ImportSection }) {
  if (section.rows.length === 0) return null;
  const columnKeys = Object.keys(section.rows[0].preview);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{section.label}</CardTitle>
        <CardDescription>{section.rows.length} fila(s)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                {columnKeys.map((k) => (
                  <TableHead key={k}>{k}</TableHead>
                ))}
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {section.rows.map((row) => (
                <TableRow key={row.rowIndex} className={row.hasError ? "bg-destructive/5" : undefined}>
                  <TableCell className="text-muted-foreground">{row.rowIndex}</TableCell>
                  {columnKeys.map((k) => (
                    <TableCell key={k}>{row.preview[k]}</TableCell>
                  ))}
                  <TableCell>
                    {row.hasError ? (
                      <span className="text-xs text-destructive">{row.errors.join(" · ")}</span>
                    ) : (
                      <Badge variant="default">OK</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultCard({ outcome }: { outcome: SectionOutcome }) {
  const { result } = outcome;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {outcome.label}
          <Badge variant={result.failed === 0 ? "default" : "destructive"}>
            {result.succeeded} / {result.totalRows} importados
          </Badge>
        </CardTitle>
      </CardHeader>
      {result.results.length > 0 ? (
        <CardContent>
          <div className="max-h-72 overflow-y-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.results.map((r) => (
                  <TableRow key={r.rowIndex}>
                    <TableCell className="text-muted-foreground">{r.rowIndex}</TableCell>
                    <TableCell>
                      {r.success ? (
                        <span className="flex items-center gap-1.5 text-sm text-brand-green">
                          <CircleCheck className="size-4" /> Importado (ID {r.id})
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-sm text-destructive">
                          <CircleX className="size-4" /> {r.message}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RanchAnimal } from "@/features/animals/types";

interface AnimalMultiSelectProps {
  animals: RanchAnimal[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

/** Lista de animales con toggle por fila — no hay componente de multi-select en el kit instalado. */
export function AnimalMultiSelect({ animals, selectedIds, onChange }: AnimalMultiSelectProps) {
  const toggle = (id: number) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]);
  };

  if (animals.length === 0) {
    return <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">No hay animales disponibles.</p>;
  }

  return (
    <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-lg border border-border p-1.5">
      {animals.map((animal) => {
        const selected = selectedIds.includes(animal.id);
        return (
          <button
            type="button"
            key={animal.id}
            onClick={() => toggle(animal.id)}
            className={cn(
              "flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
              selected ? "bg-brand-blue/10 text-brand-blue" : "hover:bg-muted",
            )}
          >
            <span className="font-medium">{animal.code}</span>
            {selected ? <Check className="size-4" /> : null}
          </button>
        );
      })}
    </div>
  );
}

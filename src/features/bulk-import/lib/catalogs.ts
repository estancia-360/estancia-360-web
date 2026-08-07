import { useCallback, useState } from "react";
import { getAnimalBreeds, getAnimalClasses, getRanchAnimals, getRanchLots } from "@/features/animals/api/animals-api";
import type { AnimalBreed, AnimalClass, RanchAnimal, RanchLot } from "@/features/animals/types";
import { normalizeText } from "./parse-helpers";

export interface BulkImportCatalogs {
  animalsByCode: Map<string, RanchAnimal>;
  lotsByName: Map<string, RanchLot>;
  breedsByName: Map<string, AnimalBreed>;
  classesByName: Map<string, AnimalClass>;
  breeds: AnimalBreed[];
  classes: AnimalClass[];
  lots: RanchLot[];
}

/**
 * Trae animales/lotes/razas/clases UNA sola vez por sesión de importación (evita N+1) y arma
 * mapas por código/nombre normalizado — misma estrategia que usa el móvil con SQLite local,
 * solo que acá se pide en vivo al backend porque la web es online.
 */
export function useBulkImportCatalogs() {
  const [catalogs, setCatalogs] = useState<BulkImportCatalogs | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async (idRanch: number, accessToken: string): Promise<BulkImportCatalogs> => {
    setIsLoading(true);
    try {
      const [animalsRes, lots, breedsRes, classes] = await Promise.all([
        getRanchAnimals(idRanch, 1, accessToken, 5000),
        getRanchLots(idRanch, accessToken),
        getAnimalBreeds(accessToken),
        getAnimalClasses(accessToken),
      ]);

      const animalsByCode = new Map(animalsRes.data.map((a) => [normalizeText(a.code), a]));
      const lotsByName = new Map(lots.map((l) => [normalizeText(l.name), l]));
      const breedsByName = new Map(breedsRes.breeds.map((b) => [normalizeText(b.name), b]));
      const classesByName = new Map(classes.map((c) => [normalizeText(c.name), c]));

      const result: BulkImportCatalogs = { animalsByCode, lotsByName, breedsByName, classesByName, breeds: breedsRes.breeds, classes, lots };
      setCatalogs(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { catalogs, isLoading, load };
}

/** Best-effort match: exact normalized name first, then substring in either direction. */
export function fuzzyMatchByName<T>(map: Map<string, T>, rawName: string | null): T | null {
  if (!rawName) return null;
  const needle = normalizeText(rawName);
  const exact = map.get(needle);
  if (exact) return exact;
  for (const [key, value] of map) {
    if (key.includes(needle) || needle.includes(key)) return value;
  }
  return null;
}

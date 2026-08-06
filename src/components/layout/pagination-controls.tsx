import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/** 1 … page-1 [page] page+1 … pages — siempre incluye la primera y la última. */
function getPageWindow(page: number, pages: number): (number | "ellipsis")[] {
  const keep = new Set<number>([1, pages, page - 1, page, page + 1]);
  const sorted = [...keep].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  let previous = 0;
  for (const p of sorted) {
    if (previous && p - previous > 1) result.push("ellipsis");
    result.push(p);
    previous = p;
  }
  return result;
}

/** Envuelve el componente Pagination de shadcn — no renderiza nada si hay una sola página. */
export function PaginationControls({ page, pages, onPageChange, className }: PaginationControlsProps) {
  if (pages <= 1) return null;

  const items = getPageWindow(page, pages);
  const goTo = (target: number) => (event: React.MouseEvent) => {
    event.preventDefault();
    if (target !== page) onPageChange(target);
  };

  return (
    <Pagination className={cn("mt-4", className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" aria-disabled={page <= 1} className={page <= 1 ? "pointer-events-none opacity-50" : ""} onClick={goTo(page - 1)} />
        </PaginationItem>
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink href="#" isActive={item === page} onClick={goTo(item)}>
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page >= pages}
            className={page >= pages ? "pointer-events-none opacity-50" : ""}
            onClick={goTo(page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

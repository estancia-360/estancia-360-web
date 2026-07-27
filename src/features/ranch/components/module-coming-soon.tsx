import { Construction } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

export function ModuleComingSoon({ moduleName }: { moduleName: string }) {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <Empty className="max-w-md">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Construction className="size-8 text-brand-blue" />
          </EmptyMedia>
          <EmptyTitle>{moduleName} está en construcción</EmptyTitle>
          <EmptyDescription>
            Muy pronto vas a poder gestionar {moduleName.toLowerCase()} desde acá. Por ahora, usá la app móvil para tus operaciones
            diarias.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}

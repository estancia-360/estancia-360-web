import { Container } from "@/components/layout/container";
import { departments } from "@/features/landing/data/bolivia-features";

export function TrustBar() {
  return (
    <section className="border-y border-brand-blue/6 bg-white py-5.5" aria-label="Confianza y respaldo">
      <Container className="flex flex-wrap items-center justify-center gap-6">
        <span className="text-[0.82rem] font-semibold tracking-[0.08em] text-brand-text-muted uppercase">
          Respaldado por productores de todo el país
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2.5" aria-label="Departamentos de Bolivia">
          {departments.map((department, index) => (
            <span key={department} className="flex items-center gap-2.5">
              <span className="text-[0.88rem] font-semibold text-brand-blue/70 transition-opacity hover:opacity-100">
                {department}
              </span>
              {index < departments.length - 1 ? (
                <span className="text-lg text-brand-blue/10">·</span>
              ) : null}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}

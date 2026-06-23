import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { AnimateIn } from "@/components/layout/animate-in";
import { solutions } from "@/features/landing/data/solutions";

export function SolutionsSection() {
  return (
    <section id="soluciones" className="bg-white py-[clamp(64px,8vw,120px)]">
      <Container>
        <AnimateIn>
          <SectionHeading
            label="La solución"
            title={
              <>
                Todo lo que necesitas para
                <br />
                gestionar tu operación.
              </>
            }
            description="Un sistema integral diseñado desde cero para la realidad del productor ganadero boliviano."
            align="center"
            className="mx-auto"
          />
        </AnimateIn>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {solutions.map((solution, index) => (
            <AnimateIn key={solution.title} delay={index * 100}>
              <div
                role="listitem"
                className={cn(
                  "group relative flex h-full flex-col rounded-[20px] border p-8 transition-all duration-300 hover:-translate-y-1",
                  solution.emphasis === "primary"
                    ? "border-brand-green/15 bg-[linear-gradient(160deg,#f3f1e8,#fff)]"
                    : solution.emphasis === "accent"
                      ? "border-brand-orange/15 bg-[linear-gradient(160deg,#fdf3ea,#fff)]"
                      : "border-brand-blue/6 bg-white hover:border-brand-green/15 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)]",
                )}
              >
                <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-brand-green/8 text-brand-green">
                  <solution.icon className="size-8" strokeWidth={1.8} />
                </div>
                <h3 className="mb-2.5 font-heading text-xl font-bold text-brand-blue">{solution.title}</h3>
                <p className="mb-5 flex-1 text-[0.94rem] leading-relaxed text-brand-text-muted">
                  {solution.description}
                </p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {solution.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-brand-blue/5 px-3 py-1 text-xs font-medium text-brand-text-mid"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <ArrowRight className="size-5 text-brand-green opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
              </div>
            </AnimateIn>
          ))}
        </div>
      </Container>
    </section>
  );
}

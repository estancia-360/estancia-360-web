import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { AnimateIn } from "@/components/layout/animate-in";
import { problems } from "@/features/landing/data/problems";

export function ProblemsSection() {
  return (
    <section id="problemas" className="bg-brand-cream py-[clamp(64px,8vw,120px)]">
      <Container>
        <AnimateIn>
          <SectionHeading
            label="El problema"
            title="¿Te suena familiar?"
            description="Sabemos que gestionar una estancia es complejo. Estos son los desafíos que enfrentan a diario los productores bolivianos."
            align="center"
            className="mx-auto"
          />
        </AnimateIn>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5" role="list">
          {problems.map((problem, index) => (
            <AnimateIn key={problem.title} delay={index * 100}>
              <div
                role="listitem"
                className="group relative h-full overflow-hidden rounded-[20px] border border-brand-blue/6 bg-white p-7 pt-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/15 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)]"
              >
                <span className="absolute inset-x-0 top-0 h-0.75 origin-left scale-x-0 bg-[linear-gradient(90deg,#e2772a,transparent)] transition-transform duration-300 group-hover:scale-x-100" />
                <div className="mb-4.5 flex size-13 items-center justify-center rounded-xl bg-brand-orange/8 text-brand-orange">
                  <problem.icon className="size-7" strokeWidth={2} />
                </div>
                <h3 className="mb-2 font-heading text-base font-bold text-brand-blue">{problem.title}</h3>
                <p className="text-[0.9rem] leading-relaxed text-brand-text-muted">{problem.description}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </Container>
    </section>
  );
}

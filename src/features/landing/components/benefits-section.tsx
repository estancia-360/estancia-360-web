import { Check } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { AnimateIn } from "@/components/layout/animate-in";
import { CtaLink } from "@/features/landing/components/cta-link";
import { benefits } from "@/features/landing/data/benefits";

export function BenefitsSection() {
  return (
    <section id="beneficios" className="bg-brand-cream py-[clamp(64px,8vw,120px)]">
      <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <AnimateIn direction="right">
          <SectionHeading
            label="Beneficios"
            title="Diseñado para ayudarte a tomar mejores decisiones."
            description="Estancia360 transforma la manera en que gestionas tu operación, dándote claridad y control en cada paso."
          />
          <CtaLink href="#demo" variant="primary" size="md">
            Solicitar demostración
          </CtaLink>
        </AnimateIn>

        <AnimateIn direction="left">
          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit, index) => (
              <AnimateIn key={benefit.title} delay={index * 100}>
                <div className="flex gap-3.5 rounded-2xl bg-white/60 p-1">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-green text-white">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <div>
                    <h3 className="mb-1 font-heading text-[0.98rem] font-bold text-brand-blue">
                      {benefit.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-brand-text-muted">{benefit.description}</p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </AnimateIn>
      </Container>
    </section>
  );
}

import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { AnimateIn } from "@/components/layout/animate-in";
import { timelineSteps } from "@/features/landing/data/timeline-steps";

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="bg-white py-[clamp(64px,8vw,120px)]">
      <Container>
        <AnimateIn>
          <SectionHeading
            label="Cómo funciona"
            title={
              <>
                Empieza en minutos,
                <br />
                gestiona para siempre.
              </>
            }
            description="Un proceso simple y guiado para que puedas comenzar sin complicaciones."
            align="center"
            className="mx-auto"
          />
        </AnimateIn>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {timelineSteps.map((step, index) => (
            <AnimateIn key={step.title} delay={index * 150}>
              <div role="listitem" className="relative flex flex-col items-center text-center">
                <div
                  className={cn(
                    "relative mb-5 flex size-16 items-center justify-center rounded-full border-2 bg-white",
                    step.accent ? "border-brand-orange text-brand-orange" : "border-brand-green/30 text-brand-green",
                  )}
                >
                  <step.icon className="size-6.5" strokeWidth={2} />
                  <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-brand-blue text-[0.7rem] font-bold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mb-2 font-heading text-base font-bold text-brand-blue">{step.title}</h3>
                <p className="text-[0.9rem] leading-relaxed text-brand-text-muted">{step.description}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </Container>
    </section>
  );
}

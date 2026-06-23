import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { AnimateIn } from "@/components/layout/animate-in";
import { boliviaFeatures } from "@/features/landing/data/bolivia-features";
import boliviaBg from "@/assets/landing/bolivia_bg.png";

export function BoliviaSection() {
  return (
    <section id="bolivia" className="relative overflow-hidden py-[clamp(64px,8vw,120px)]">
      <img
        src={boliviaBg}
        alt="Paisaje de las tierras bajas bolivianas con ganado pastando"
        className="absolute inset-0 size-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(36,52,83,0.92),rgba(38,79,42,0.88))]" />

      <Container className="relative z-10">
        <AnimateIn>
          <div className="mx-auto max-w-2xl rounded-[28px] border border-white/10 bg-white/5 p-9 backdrop-blur-md sm:p-12">
            <SectionHeading
              label="Hecho en Bolivia"
              title={
                <>
                  Desarrollado pensando en
                  <br />
                  la ganadería boliviana.
                </>
              }
              description="Conocemos las particularidades del sector ganadero boliviano: sus regiones, sus desafíos logísticos y su forma de operar. Estancia360 no es un software genérico adaptado — es una plataforma construida desde adentro."
              variant="light"
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {boliviaFeatures.map((feature) => (
                <div key={feature.title} className="flex gap-3.5">
                  <div className="text-2xl" aria-hidden="true">
                    {feature.emoji}
                  </div>
                  <div>
                    <strong className="block text-[0.95rem] font-bold text-white">{feature.title}</strong>
                    <span className="text-sm leading-relaxed text-white/70">{feature.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimateIn>
      </Container>
    </section>
  );
}

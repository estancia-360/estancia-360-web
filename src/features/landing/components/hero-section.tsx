import { useRef } from "react";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/layout/container";
import { CtaLink } from "@/features/landing/components/cta-link";
import { HeroParticles } from "@/features/landing/components/hero-particles";
import { AnimatedStat } from "@/features/landing/components/animated-stat";
import dashboardMockup from "@/assets/landing/dashboard_mockup.png";

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const visualY = useTransform(scrollY, [0, 600], [0, 150]);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[linear-gradient(160deg,#243453_0%,#1a2a44_40%,#2a4a2e_80%,#264f2a_100%)] pt-[calc(4.5rem+clamp(48px,7vw,100px))] pb-[clamp(48px,6vw,80px)]"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(122,166,65,0.2) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 80%, rgba(226,119,42,0.12) 0%, transparent 50%), radial-gradient(ellipse 70% 60% at 10% 90%, rgba(51,108,56,0.18) 0%, transparent 50%)",
        }}
      />
      <HeroParticles />

      <Container className="relative z-10 max-w-3xl text-center">
        <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4.5 py-1.5 text-[0.82rem] font-medium text-white/90 backdrop-blur-md">
          <span className="size-2 animate-pulse rounded-full bg-brand-accent" />
          Plataforma para productores bolivianos
        </span>

        <h1 className="mb-5 font-heading text-[clamp(2.4rem,6vw,4.2rem)] leading-[1.08] font-black tracking-tight text-white">
          La gestión ganadera,
          <br />
          <span className="bg-[linear-gradient(135deg,#7aa641_0%,#e2772a_60%,#f0a060_100%)] bg-clip-text text-transparent">
            más fácil, más clara,
            <br />
            más tuya.
          </span>
        </h1>

        <p className="mx-auto mb-9 max-w-xl text-[clamp(1rem,2vw,1.2rem)] leading-relaxed text-white/75">
          Controla animales, movimientos y registros desde una sola plataforma diseñada para productores
          bolivianos.
        </p>

        <div className="mb-12 flex flex-wrap items-center justify-center gap-3.5">
          <CtaLink href="#demo" variant="primary" size="lg">
            <CalendarCheck className="size-5" />
            Solicitar demostración
          </CtaLink>
          <CtaLink href="#soluciones" variant="ghost" size="lg">
            Conocer más
            <ArrowRight className="size-4.5" />
          </CtaLink>
        </div>

        <div className="mb-14 flex flex-wrap items-center justify-center gap-y-3 rounded-3xl border border-white/12 bg-white/8 px-5 py-4 backdrop-blur-md sm:px-9 sm:py-5">
          <AnimatedStat value="500+" label="Estancias activas" />
          <span className="hidden h-10 w-px bg-white/15 sm:block" />
          <AnimatedStat value="120k+" label="Animales registrados" />
          <span className="hidden h-10 w-px bg-white/15 sm:block" />
          <AnimatedStat value="9" label="Departamentos" />
        </div>
      </Container>

      <motion.div style={{ y: visualY }} className="relative z-10 mx-auto w-full max-w-4xl px-5">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="overflow-hidden rounded-[28px] bg-[#1a1f2e] shadow-[0_32px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06)]"
        >
          <div className="flex items-center gap-1.5 bg-[#252a3a] px-4 py-3">
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
            <span className="flex-1 pr-15 text-center text-xs text-white/40">app.estancia360.bo</span>
          </div>
          <img
            src={dashboardMockup}
            alt="Plataforma Estancia360 — Dashboard de gestión ganadera"
            className="block max-h-[480px] w-full object-cover"
            loading="eager"
          />
        </motion.div>
      </motion.div>

      <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2" aria-hidden="true">
        <div className="size-7 animate-[scroll-bounce_2s_ease-in-out_infinite] border-r-2 border-b-2 border-white/30" />
      </div>
    </section>
  );
}

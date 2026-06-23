import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { BrandLogo, BrandWordmark } from "@/features/landing/components/brand-logo";
import { CtaLink } from "@/features/landing/components/cta-link";
import { navLinks } from "@/features/landing/data/nav-links";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  return (
    <header
      ref={navRef}
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-18 bg-brand-cream/85 backdrop-blur-xl transition-all duration-300",
        isScrolled && "bg-brand-cream/95 shadow-[0_4px_20px_rgba(0,0,0,0.07)]",
      )}
    >
      <Container className="flex h-full items-center justify-between gap-8">
        <a href="#" className="flex shrink-0 items-center gap-2.5" aria-label="Estancia360 inicio">
          <BrandLogo />
          <BrandWordmark />
        </a>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Navegación principal">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-xl px-4 py-2 text-[0.92rem] font-medium text-brand-text-mid transition-colors hover:bg-brand-green/7 hover:text-brand-green"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2.5 lg:flex">
          <CtaLink href="#demo" variant="nav-outline" size="sm">
            Ingresar
          </CtaLink>
          <CtaLink href="#demo" variant="nav-primary" size="sm">
            Solicitar demo
          </CtaLink>
        </div>

        <button
          type="button"
          className="flex items-center justify-center p-2 lg:hidden"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X className="size-6 text-brand-blue" /> : <Menu className="size-6 text-brand-blue" />}
        </button>
      </Container>

      <div
        className={cn(
          "absolute inset-x-0 top-18 flex flex-col gap-1 border-b border-brand-blue/10 bg-brand-cream px-5 pt-5 pb-7 transition-all duration-250 lg:hidden",
          isMenuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
        )}
        aria-hidden={!isMenuOpen}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setIsMenuOpen(false)}
            className="rounded-xl px-4 py-3 text-base font-medium text-brand-text-mid transition-colors hover:bg-brand-green/7 hover:text-brand-green"
          >
            {link.label}
          </a>
        ))}
        <div className="mt-3 flex gap-2.5 border-t border-brand-blue/10 pt-4">
          <CtaLink href="#demo" variant="nav-outline" size="sm" onClick={() => setIsMenuOpen(false)}>
            Ingresar
          </CtaLink>
          <CtaLink href="#demo" variant="nav-primary" size="sm" onClick={() => setIsMenuOpen(false)}>
            Solicitar demo
          </CtaLink>
        </div>
      </div>
    </header>
  );
}

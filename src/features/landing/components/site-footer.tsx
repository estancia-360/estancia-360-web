import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/layout/container";
import { BrandLogo, BrandWordmark } from "@/features/landing/components/brand-logo";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "@/features/landing/components/social-icons";

const platformLinks = ["Cría", "Recría", "Engorde", "Movimientos", "Sanidad"];

export function SiteFooter() {
  return (
    <footer className="bg-brand-blue text-white/70" role="contentinfo">
      <div className="border-b border-white/10">
        <Container className="grid grid-cols-1 gap-12 py-16 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <a href="#" className="flex items-center gap-2.5" aria-label="Estancia360">
              <BrandLogo size={36} />
              <BrandWordmark className="text-white" />
            </a>
            <p className="mt-4 font-heading text-base font-semibold text-white">
              Más fácil, más claro, más tuyo.
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed">
              La plataforma integral de gestión ganadera para productores bolivianos.
            </p>
            <div className="mt-5 flex items-center gap-3" aria-label="Redes sociales">
              <a href="#" aria-label="Facebook" className="flex size-9 items-center justify-center rounded-full bg-white/8 transition-colors hover:bg-white/15">
                <FacebookIcon className="size-4.5" />
              </a>
              <a href="#" aria-label="Instagram" className="flex size-9 items-center justify-center rounded-full bg-white/8 transition-colors hover:bg-white/15">
                <InstagramIcon className="size-4.5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="flex size-9 items-center justify-center rounded-full bg-white/8 transition-colors hover:bg-white/15">
                <LinkedinIcon className="size-4.5" />
              </a>
            </div>
          </div>

          <nav className="grid grid-cols-1 gap-8 sm:grid-cols-3" aria-label="Navegación del footer">
            <div>
              <h4 className="mb-4 text-sm font-bold text-white">Plataforma</h4>
              <ul className="flex flex-col gap-2.5">
                {platformLinks.map((link) => (
                  <li key={link}>
                    <a href="#soluciones" className="text-sm transition-colors hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-bold text-white">Empresa</h4>
              <ul className="flex flex-col gap-2.5">
                <li><a href="#bolivia" className="text-sm transition-colors hover:text-white">Nosotros</a></li>
                <li><a href="#como-funciona" className="text-sm transition-colors hover:text-white">Cómo funciona</a></li>
                <li><a href="#demo" className="text-sm transition-colors hover:text-white">Solicitar demo</a></li>
                <li><a href="#" className="text-sm transition-colors hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-bold text-white">Contacto</h4>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li>
                  <a href="mailto:hola@estancia360.bo" className="flex items-center gap-2 transition-colors hover:text-white">
                    <Mail className="size-3.5" />
                    hola@estancia360.bo
                  </a>
                </li>
                <li>
                  <a href="tel:+59175555555" className="flex items-center gap-2 transition-colors hover:text-white">
                    <Phone className="size-3.5" />
                    +591 7XX XXX XXX
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="size-3.5" />
                  Santa Cruz, Bolivia
                </li>
              </ul>
            </div>
          </nav>
        </Container>
      </div>

      <Container className="flex flex-col items-center justify-between gap-3 py-6 text-xs sm:flex-row">
        <p>© {new Date().getFullYear()} Estancia360. Todos los derechos reservados.</p>
        <div className="flex items-center gap-3">
          <a href="#" className="transition-colors hover:text-white">Privacidad</a>
          <span>·</span>
          <a href="#" className="transition-colors hover:text-white">Términos de uso</a>
        </div>
      </Container>
    </footer>
  );
}

import Link from "next/link";
import { MoveUpRight } from "lucide-react";
import { ROUTES } from "@/app/shared/routes/routes";

const navigationItems = [
  { label: "Inicio", href: ROUTES.HOME },
  { label: "Colección", href: ROUTES.COLECCION },
  { label: "Personalización", href: ROUTES.PERSONALIZACION },
  { label: "Contacto", href: ROUTES.CONTACTO },
] as const;

const socialItems = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61593105921106",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/",
  },
] as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      aria-labelledby="footer-title"
      className=" bg-hard-brown text-white"
    >
      <div className="px-6 max-w-full">

        {/* Información */}
        <div className="grid grid-cols-1 border-b border-white/40 md:grid-cols-12">
          {/* Navegación */}
          <nav
            aria-label="Navegación del pie de página"
            className="border-b border-white/40 p-6 md:col-span-4 md:border-b-0  lg:p-10"
          >
            <span className="font-dm-sans text-[0.65rem] uppercase tracking-[0.22em] text-white/60">
              Navegación
            </span>

            <ul className="mt-10 space-y-3">
              {navigationItems.map((item, index) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="
                      group flex items-center justify-between
                      border-b border-white/20 pb-3
                      font-dm-sans text-sm
                      transition-opacity hover:opacity-60
                      focus-visible:outline focus-visible:outline-2
                      focus-visible:outline-offset-4 focus-visible:outline-white
                    "
                  >
                    <span>{item.label}</span>

                    <span
                      aria-hidden="true"
                      className="text-xs text-white/50"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacto */}
          <div className="border-b border-white/40 p-6 md:col-span-4 md:border-b-0  lg:p-10">
            <span className="font-dm-sans text-[0.65rem] uppercase tracking-[0.22em] text-white/60">
              Contacto
            </span>

            <div className="mt-10 flex flex-col gap-8">
              <div>
                <span className="block font-dm-sans text-[0.65rem] uppercase tracking-[0.18em] text-white/50">
                  WhatsApp
                </span>

                <a
                  href="https://wa.me/51974137694"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-mileast text-2xl transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  +51 974 137 694
                </a>
              </div>

              <div>
                <span className="block font-dm-sans text-[0.65rem] uppercase tracking-[0.18em] text-white/50">
                  Correo
                </span>

                <a
                  href="mailto:hola@aroma.pe"
                  className="mt-2 inline-block break-all font-dm-sans text-sm transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  hola@aroma.pe
                </a>
              </div>

              <div>
                <span className="block font-dm-sans text-[0.65rem] uppercase tracking-[0.18em] text-white/50">
                  Ubicación
                </span>

                <p className="mt-2 font-dm-sans text-sm leading-6">
                  Huaral, Perú
                </p>
              </div>
            </div>
          </div>

          {/* Redes sociales */}
          <div className="p-6 md:col-span-4 lg:p-10">
            <span className="font-dm-sans text-[0.65rem] uppercase tracking-[0.22em] text-white/60">
              Síguenos
            </span>

            <ul className="mt-10">
              {socialItems.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      group flex items-center justify-between
                      border-b border-white/20 py-4
                      font-mileast text-2xl
                      transition-opacity hover:opacity-60
                      focus-visible:outline focus-visible:outline-2
                      focus-visible:outline-offset-4 focus-visible:outline-white
                    "
                  >
                    <span>{social.label}</span>

                    <MoveUpRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                </li>
              ))}
            </ul>

            <p className="mt-10 max-w-xs font-dm-sans text-sm leading-6 text-white/70">
              Piezas, procesos y espacios creados alrededor de la luz y el
              aroma.
            </p>
          </div>
        </div>

        {/* Información legal */}
        <div
          className="
            flex flex-col gap-5 px-5 py-5
            font-dm-sans text-[0.6rem] uppercase
            tracking-[0.18em] text-white/60
            sm:px-8
            md:flex-row md:items-center md:justify-between
            lg:px-12
          "
        >
          <span>© {currentYear} Aroma.</span>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
           
          </div>
        </div>
      </div>
    </footer>
  );
}

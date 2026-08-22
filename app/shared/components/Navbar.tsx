"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/app/shared/routes/routes";

const navigationItems = [
  { label: "Inicio", href: ROUTES.HOME },
  { label: "Colección", href: ROUTES.COLECCION },
  { label: "Personalización", href: ROUTES.PERSONALIZACION },
] as const;

export default function Navbar() {
  const pathname = usePathname();

  return <NavbarContent key={pathname} pathname={pathname} />;
}

interface NavbarContentProps {
  pathname: string;
}

function NavbarContent({ pathname }: NavbarContentProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileMenuId = useId();

  const isLightPage = pathname.startsWith(ROUTES.PERSONALIZACION);

  const handleToggleMenu = () => {
    setIsMenuOpen((currentState) => !currentState);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseMenu();
      }
    };

    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isMenuOpen]);

  const navbarClasses = isLightPage
    ? "border-hard-brown/20 bg-[#FCFAF7]/90 text-hard-brown"
    : "border-white/15 bg-black/35 text-white";

  const interactiveClasses = isLightPage
    ? "hover:bg-hard-brown/5 focus-visible:ring-hard-brown"
    : "hover:bg-white/10 focus-visible:ring-white";

  return (
    <nav
      aria-label="Navegación principal"
      className={`
        fixed inset-x-0 top-0 z-50
        border-b backdrop-blur-md
        ${navbarClasses}
      `}
    >
      <div
        className="
          flex h-20 w-full
          items-center justify-between
          px-5 sm:px-8 lg:px-12
        "
      >
        <Link
          href={ROUTES.HOME}
          aria-label="Ir al inicio"
          className="
            rounded-sm
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-current
            focus-visible:ring-offset-4
          "
        >
          <Image
            src="/aroma-logo.png"
            alt="Aroma"
            width={150}
            height={60}
            sizes="128px"
            className={`
              h-auto w-28 object-contain md:w-32"brightness-[0.6] contrast-125
            `}
          />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`
                    relative block py-2
                    font-dm-sans text-sm
                    transition-opacity duration-300
                    hover:opacity-65
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-current
                    focus-visible:ring-offset-4
                    ${
                      isActive
                        ? "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-current"
                        : ""
                    }
                  `}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:flex">
          <Link
            href={ROUTES.CART}
            aria-label="Abrir carrito"
            className={`
              rounded-full p-2
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-2
              ${interactiveClasses}
            `}
          >
            <ShoppingBag aria-hidden="true" className="size-5" />
          </Link>
        </div>

        <button
          type="button"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMenuOpen}
          aria-controls={mobileMenuId}
          onClick={handleToggleMenu}
          className={`
            rounded-md p-2
            transition-colors
            focus-visible:outline-none
            focus-visible:ring-2
            md:hidden
            ${interactiveClasses}
          `}
        >
          {isMenuOpen ? (
            <X aria-hidden="true" />
          ) : (
            <Menu aria-hidden="true" />
          )}
        </button>
      </div>

      <MobileNavbar
        id={mobileMenuId}
        isOpen={isMenuOpen}
        pathname={pathname}
        onClose={handleCloseMenu}
      />
    </nav>
  );
}

interface MobileNavbarProps {
  id: string;
  isOpen: boolean;
  pathname: string;
  onClose: () => void;
}

function MobileNavbar({
  id,
  isOpen,
  pathname,
  onClose,
}: MobileNavbarProps) {
  return (
    <div
      id={id}
      aria-hidden={!isOpen}
      className={`
        fixed inset-x-0 top-20
        h-[calc(100svh-5rem)]
        overflow-y-auto
        border-t border-hard-brown/20
        bg-[#FCFAF7]
        text-hard-brown
        md:hidden

        transition-[clip-path,opacity,visibility]
        duration-500
        ease-[cubic-bezier(0.76,0,0.24,1)]

        motion-reduce:transition-none

        ${
          isOpen
            ? `
              visible
              pointer-events-auto
              opacity-100
              [clip-path:circle(150%_at_100%_0%)]
            `
            : `
              invisible
              pointer-events-none
              opacity-0
              [clip-path:circle(0%_at_100%_0%)]
            `
        }
      `}
    >
      <ul className="flex min-h-full flex-col">
        {navigationItems.map((item, index) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <li
              key={item.href}
              className={`
                border-b border-hard-brown/20
                transition-all
                duration-500

                ${
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "translate-x-8 opacity-0"
                }
              `}
              style={{
                transitionDelay: isOpen
                  ? `${100 + index * 50}ms`
                  : "0ms",
              }}
            >
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={onClose}
                tabIndex={isOpen ? 0 : -1}
                className={`
                  flex items-center justify-between
                  px-6 py-6
                  font-mileast text-3xl
                  transition-colors
                  hover:bg-hard-brown/5
                  focus-visible:bg-hard-brown/5
                  focus-visible:outline-none

                  ${isActive ? "bg-hard-brown/5" : ""}
                `}
              >
                <span>{item.label}</span>

                {isActive && (
                  <span
                    className="
                      font-dm-sans
                      text-[0.6rem]
                      uppercase
                      tracking-[0.2em]
                    "
                  >
                    Actual
                  </span>
                )}
              </Link>
            </li>
          );
        })}

        <li
          className={`
            mt-auto
            border-t border-hard-brown/20
            transition-all duration-500

            ${
              isOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }
          `}
          style={{
            transitionDelay: isOpen ? "300ms" : "0ms",
          }}
        >
          <Link
            href={ROUTES.CART}
            onClick={onClose}
            tabIndex={isOpen ? 0 : -1}
            className="
              flex items-center justify-between
              px-6 py-6
              font-mileast text-3xl
              transition-colors
              hover:bg-hard-brown/5
              focus-visible:bg-hard-brown/5
              focus-visible:outline-none
            "
          >
            <span>Carrito</span>

            <ShoppingBag aria-hidden="true" />
          </Link>
        </li>
      </ul>
    </div>
  );
}

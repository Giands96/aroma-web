"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import Image from "next/image";

const navigationItems = [
  { label: "Inicio", href: "/home" },
  { label: "Colección", href: "/coleccion" },
  { label: "Personalización", href: "/personalizacion" },
  { label: "Contacto", href: "/contacto" },
] as const;

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileMenuId = useId();

  const handleToggleMenu = () => {
    setIsMenuOpen((currentState) => !currentState);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseMenu();
      }
    };

    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/10 backdrop-blur-md"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/home"
          aria-label="Ir al inicio"
          className="font-dm-sans text-xl font-bold text-white"
          onClick={handleCloseMenu}
        >
          <Image src="/aroma-logo.png" alt="Hero" width={150} height={150} />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navigationItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="font-dm-sans text-lg text-white transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex">
          <Link
            href="/carrito"
            aria-label="Abrir carrito"
            className="rounded-full p-2 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ShoppingBag aria-hidden="true" />
          </Link>
        </div>

        <button
          type="button"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMenuOpen}
          aria-controls={mobileMenuId}
          onClick={handleToggleMenu}
          className="rounded-md p-2 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:hidden"
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
        onClose={handleCloseMenu}
      />
    </nav>
  );
}

interface MobileNavbarProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
}

function MobileNavbar({
  id,
  isOpen,
  onClose,
}: MobileNavbarProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      id={id}
      className="absolute inset-x-0 top-full border-t border-neutral-200 bg-white shadow-lg md:hidden"
    >
      <ul className="flex flex-col h-dvh">
        {navigationItems.map((item) => (
          <li key={item.href} className="border-b border-neutral-200">
            <Link
              href={item.href}
              onClick={onClose}
              className="block px-6 py-6 font-mileast text-3xl text-hard-brown transition-colors hover:bg-neutral-100 focus-visible:bg-neutral-100 focus-visible:outline-none"
            >
              {item.label}
            </Link>
          </li>
        ))}

        <li>
          <Link
            href="/carrito"
            onClick={onClose}
            className="flex items-center gap-3 px-6 py-6 font-mileast text-3xl text-hard-brown transition-colors hover:bg-neutral-100 focus-visible:bg-neutral-100 focus-visible:outline-none"
          >
            <ShoppingBag aria-hidden="true" />
            Carrito
          </Link>
        </li>
      </ul>
    </div>
  );
}
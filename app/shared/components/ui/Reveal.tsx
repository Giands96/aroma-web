'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Retraso en segundos — útil para escalonar hermanos (0.06–0.1). */
  delay?: number;
  /** Desplazamiento vertical inicial en px. Sutil: 12–16. */
  y?: number;
}

/**
 * Fade-up al entrar/salir del viewport (IntersectionObserver + CSS).
 * - Entrada: opacity 0→1, y→0, 450ms, ease-out.
 * - Salida: vuelve a ocultarse al salir hacia arriba (como el reverse anterior).
 * - Sin JS o con reduced-motion: contenido siempre visible, sin animación.
 * - Sin dependencias: GSAP queda fuera del bundle del cliente.
 */
export default function Reveal({ children, className, delay = 0, y = 16 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') return;

    el.style.setProperty('--reveal-delay', `${delay}s`);
    el.style.setProperty('--reveal-y', `${y}px`);
    // Se arma en JS para que sin-JS el contenido nazca visible.
    el.classList.add('reveal');

    const io = new IntersectionObserver(
      ([entry]) => el.classList.toggle('is-visible', entry.isIntersecting),
      { threshold: 0.12, rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

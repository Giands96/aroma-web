import { useLayoutEffect, useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import '@app/FoldText.css';

gsap.registerPlugin(ScrollTrigger);

type SplitBy = 'char' | 'word' | 'line';
type Hinge = 'top' | 'bottom' | 'left' | 'right';
type Trigger = 'mount' | 'hover' | 'scroll' | 'loop';

export interface FoldTextProps {
  text?: string;
  splitBy?: SplitBy;
  hinge?: Hinge;
  duration?: number;
  stagger?: number;
  ease?: string;
  perspective?: number;
  creaseShading?: number;
  trigger?: Trigger;
  fontSize?: string | number;
  fontWeight?: string | number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

type HingeConfig = {
  origin: string;
  rotateX: number;
  rotateY: number;
};

const HINGE_CONFIG: Record<Hinge, HingeConfig> = {
  top: { origin: '50% 0%', rotateX: -92, rotateY: 0 },
  bottom: { origin: '50% 100%', rotateX: 92, rotateY: 0 },
  left: { origin: '0% 50%', rotateX: 0, rotateY: 92 },
  right: { origin: '100% 50%', rotateX: 0, rotateY: -92 }
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const withTextPositionKeys = (parts: Iterable<string>) => {
  let position = 0;

  return Array.from(parts, (value) => {
    const key = `${position}:${value}`;
    position += value.length;
    return { value, key };
  });
};

const renderWhitespace = (value: string, key: string): ReactNode[] =>
  withTextPositionKeys(value.split(/(\n)/)).map(({ value: part, key: partKey }) => {
    if (part === '\n') return <br key={`${key}-br-${partKey}`} />;
    if (!part) return null;

    return (
      <span className="fold-text-whitespace" key={`${key}-space-${partKey}`}>
        {part.replace(/ /g, '\u00A0')}
      </span>
    );
  });

const FoldText = ({
  text = 'Design unfolds',
  splitBy = 'char',
  hinge = 'top',
  duration = 0.65,
  stagger = 0.045,
  ease = 'power3.out',
  perspective = 700,
  creaseShading = 0.55,
  trigger = 'mount',
  fontSize = 80,
  fontWeight = 800,
  color = '#f7f2e8',
  className = '',
  style = {}
}: FoldTextProps) => {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const hingeConfig = HINGE_CONFIG[hinge] || HINGE_CONFIG.top;
  const safeCrease = clamp(creaseShading, 0, 1);
  const safePerspective = Math.max(120, perspective);

  const segments = useMemo(() => {
    const renderSegment = (content: string, key: string, split: SplitBy = splitBy): ReactNode => {
      return (
        <span
          className="fold-text-segment"
          data-fold-split={split}
          key={key}
          style={
            { "--fold-perspective": `${safePerspective}px` } as CSSProperties
          }
        >
          <span
            className="fold-text-piece"
            data-fold-hinge={hinge}
            style={
              {
                transformOrigin: hingeConfig.origin,
                "--fold-crease": 0,
                opacity: trigger === "hover" ? 1 : 0,
              } as CSSProperties
            }
          >
            {content || "\u00A0"}
          </span>
        </span>
      );
    };

    if (splitBy === 'line') {
      return withTextPositionKeys(text.split('\n')).map(({ value: line, key }) => (
        <span className="fold-text-line" key={`line-${key}`}>
          {renderSegment(line || '\u00A0', `segment-line-${key}`, 'line')}
        </span>
      ));
    }

    if (splitBy === 'word') {
      return withTextPositionKeys(text.split(/(\s+)/)).flatMap(({ value: part, key }) => {
        if (!part) return [];
        if (/^\s+$/.test(part)) return renderWhitespace(part, `ws-${key}`);
        return renderSegment(part, `segment-word-${key}`);
      });
    }

    return withTextPositionKeys(Array.from(text)).map(({ value: char, key }) => {
      if (char === '\n') return <br key={`br-${key}`} />;
      return renderSegment(char === ' ' ? '\u00A0' : char, `segment-char-${key}`);
    });
  }, [text, splitBy, hinge, hingeConfig.origin, safePerspective, trigger]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const root = rootRef.current;
    if (!root) return undefined;

    const pieces = Array.from(root.querySelectorAll<HTMLElement>('.fold-text-piece'));
    if (!pieces.length) return undefined;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const activeDuration = reduceMotion ? Math.min(duration, 0.22) : duration;
    const activeStagger = reduceMotion ? Math.min(stagger, 0.02) : stagger;
    const fromVars = {
      opacity: 0,
      rotateX: reduceMotion ? 0 : hingeConfig.rotateX,
      rotateY: reduceMotion ? 0 : hingeConfig.rotateY,
      '--fold-crease': reduceMotion ? 0 : safeCrease,
      transformOrigin: hingeConfig.origin,
      force3D: true
    };
    const toVars = {
      opacity: 1,
      rotateX: 0,
      rotateY: 0,
      '--fold-crease': 0,
      duration: activeDuration,
      ease: reduceMotion ? 'power1.out' : ease,
      stagger: activeStagger,
      clearProps: 'willChange'
    };

    const killTimeline = () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
      gsap.killTweensOf(pieces);
    };

    const play = (repeat: boolean): gsap.core.Timeline => {
      killTimeline();
      timelineRef.current = gsap.timeline({ repeat: repeat ? -1 : 0, repeatDelay: repeat ? 0.75 : 0 });
      timelineRef.current.fromTo(pieces, fromVars, toVars);
      return timelineRef.current;
    };

    let scrollTrigger: ReturnType<typeof ScrollTrigger.create> | undefined;
    let hoverHandler: (() => void) | undefined;

    if (trigger === 'hover') {
      gsap.set(pieces, { opacity: 1, rotateX: 0, rotateY: 0, '--fold-crease': 0, transformOrigin: hingeConfig.origin });
      hoverHandler = () => play(false);
      root.addEventListener('mouseenter', hoverHandler);
    } else if (trigger === 'scroll') {
      gsap.set(pieces, fromVars);
      scrollTrigger = ScrollTrigger.create({
        trigger: root,
        start: 'top 82%',
        once: true,
        onEnter: () => play(false)
      });
    } else if (trigger === 'loop') {
      play(true);
    } else {
      play(false);
    }

    return () => {
      if (hoverHandler) root.removeEventListener('mouseenter', hoverHandler);
      scrollTrigger?.kill();
      killTimeline();
    };
  }, [
    text,
    splitBy,
    hinge,
    duration,
    stagger,
    ease,
    perspective,
    safeCrease,
    trigger,
    hingeConfig.origin,
    hingeConfig.rotateX,
    hingeConfig.rotateY
  ]);

  const rootStyle: CSSProperties = {
    '--fold-text-font-size': typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
    '--fold-text-font-weight': fontWeight,
    '--fold-text-color': color,
    ...style
  } as CSSProperties;

  return (
    <span ref={rootRef} className={`fold-text ${className}`.trim()} style={rootStyle}>
      <span className="fold-text-sr-only">{text}</span>
      <span className="fold-text-visual" aria-hidden="true">
        {segments}
      </span>
    </span>
  );
};

export default FoldText;

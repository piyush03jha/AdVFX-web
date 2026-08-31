"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useScroll,
  useTransform,
} from "motion/react";

const CARD_COUNT = 40;
const TOTAL_TWIST = 180;
const CARD_WIDTH = 240;
const CARD_HEIGHT = 138;
const CARD_SPACING = 0.96;

// Set any card's X/Y/Z rotation independently.
// X = tilt toward/away from camera
// Y = left/right twist
// Z = roll
const CARD_ROTATION_OVERRIDES: Partial<
  Record<number, { x?: number; y?: number; z?: number }>
> = {};

const COLOR_STOPS: Array<[number, number, number]> = [
  [43, 18, 46],
  [117, 41, 92],
  [201, 79, 128],
  [237, 178, 194],
  [111, 209, 205],
];

function lerpColor(t: number) {
  const seg = t * (COLOR_STOPS.length - 1);
  const i0 = Math.min(
    Math.floor(seg),
    COLOR_STOPS.length - 2,
  );
  const f = seg - i0;
  const [r0, g0, b0] = COLOR_STOPS[i0];
  const [r1, g1, b1] = COLOR_STOPS[i0 + 1];

  return `rgb(${Math.round(r0 + (r1 - r0) * f)},${Math.round(
    g0 + (g1 - g0) * f,
  )},${Math.round(b0 + (b1 - b0) * f)})`;
}

function pathY(t: number, h: number) {
  return (
    h / 2 -
    34 +
    120 * Math.sin(t * Math.PI * 2 * 1.05 + 0.5) +
    25 * Math.sin(t * Math.PI * 2 * 3.1 + 1.1) +
    t * 80
  );
}

interface CardGeometry {
  x: number;
  y: number;
  z: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
}

export function HeroProductStage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const geometry = useRef<CardGeometry[]>([]);

  const cards = useMemo(
    () =>
      Array.from({ length: CARD_COUNT }, (_, i) => ({
        i,
        phase: i * 0.34,
        color: lerpColor(i / (CARD_COUNT - 1)),
      })),
    [],
  );

  useEffect(() => {
    function layout() {
      const stage = stageRef.current;
      if (!stage) return;

      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const twistPerCard = TOTAL_TWIST / (CARD_COUNT - 1);

      geometry.current = cards.map((card, i) => {
        const t = i / (CARD_COUNT - 1);
        const y = pathY(t, h);
        const dt = 0.001;
        const yNext = pathY(Math.min(t + dt, 1), h);
        const slope = (yNext - y) / (dt * w);
        const bank = Math.max(
          -20,
          Math.min(20, Math.atan(slope) * (180 / Math.PI) * 0.55),
        );

        const normalized = t * 2 - 1;
        const abs = Math.abs(normalized);
        const override = CARD_ROTATION_OVERRIDES[i];

        const automaticRotateY =
          i * twistPerCard +
          Math.sin(t * Math.PI * 2) * 8;
        const automaticRotateX = bank + Math.sin(t * Math.PI * 2.5) * 4;
        const automaticRotateZ =
          Math.sin(t * Math.PI * 2 * 1.15) * 10 - normalized * 4;

        return {
          x:
            t * w * CARD_SPACING +
            (w * (1 - CARD_SPACING)) / 2,
          y,
          z: 290 - 580 * t - abs * 70,
          rotateX: override?.x ?? automaticRotateX,
          rotateY: override?.y ?? automaticRotateY,
          rotateZ: override?.z ?? automaticRotateZ,
        };
      });
    }

    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, [cards]);

  useAnimationFrame((elapsed) => {
    const time = elapsed / 1000;

    cards.forEach((card, i) => {
      const el = cardRefs.current[i];
      const geo = geometry.current[i];
      if (!el || !geo) return;

      const idleY = 16 * Math.sin(time * 1.05 - card.phase);
      const idleTwist = 4 * Math.sin(time * 0.82 - card.phase * 0.8);
      const idleRoll = 2.5 * Math.sin(time * 0.72 - card.phase * 0.55);

      el.style.transform =
        `translate3d(${geo.x}px, ${geo.y + idleY}px, ${geo.z}px) ` +
        `rotateX(${geo.rotateX}deg) ` +
        `rotateY(${geo.rotateY + idleTwist}deg) ` +
        `rotateZ(${geo.rotateZ + idleRoll}deg)`;
    });
  });

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const groupY = useTransform(scrollYProgress, [0, 1], [0, -460]);
  const groupX = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const groupRotateZ = useTransform(scrollYProgress, [0, 1], [0, -4]);
  const groupOpacity = useTransform(
    scrollYProgress,
    [0, 0.86, 1],
    [1, 1, 0],
  );

  return (
    <div ref={heroRef} className="relative">
      <section
        className="relative flex h-screen min-h-[640px] flex-col items-center justify-center overflow-hidden"
      >
        <div
          ref={stageRef}
          className="relative h-[520px] w-screen"
          style={{ perspective: 1100 }}
        >
          <motion.div
            style={{
              x: groupX,
              y: groupY,
              rotateZ: groupRotateZ,
              opacity: groupOpacity,
              transformStyle: "preserve-3d",
            }}
            className="absolute inset-0"
          >
            {cards.map((card, i) => (
              <div
                key={card.i}
                ref={(node) => {
                  cardRefs.current[i] = node;
                }}
                className="absolute left-0 top-0 rounded-2xl border border-white/10"
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  marginLeft: -CARD_WIDTH / 2,
                  marginTop: -CARD_HEIGHT / 2,
                  transformStyle: "preserve-3d",
                  background:
                    "linear-gradient(115deg, rgba(255,255,255,0.32), rgba(255,255,255,0) 40%, rgba(0,0,0,0.34)), " +
                    card.color,
                  boxShadow:
                    "0 24px 70px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)",
                }}
              />
            ))}
          </motion.div>
        </div>

        <div className="mt-8 max-w-md px-5 text-center">
          <p className="text-[15px] leading-relaxed text-muted">
            Are you ready to take the first step and bring your next
            model to life?
          </p>

          <button
            type="button"
            className="mt-5 rounded-full bg-gradient-to-br from-[#a86bd6] to-[#7757c9] px-8 py-3 text-xs font-medium uppercase tracking-wider text-white"
          >
            Get started
          </button>
        </div>
      </section>
    </div>
  );
}

"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

// components/motion/motion-tokens.ts — langage d'animation UNIQUE de la boutique.
// Règle d'homogénéité : mêmes durées, même easing, mêmes distances partout.
// - fade-up : apparition au scroll (sections, titres, cartes en grille)
// - stagger : cascade dans les grilles/listes (delay enfants 0.06s)
// - pop : micro-interaction boutons/badges (scale)
// - slide : panneaux latéraux, menus, drawers
// - shrink/expand : accordéons, filtres (hauteur auto)
// Respecte prefers-reduced-motion via MotionConfig (voir providers ci-dessous).

export const EASE = [0.22, 1, 0.36, 1] as const; // easeOutExpo — signature de la boutique
export const DURATION = { fast: 0.25, base: 0.45, slow: 0.7 } as const;
export const RISE = 24; // distance verticale standard (px)
export const STAGGER = 0.06; // délai entre enfants (s)

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: RISE },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.base, ease: EASE } },
};

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER, delayChildren: 0.05 } },
};

export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: DURATION.fast, ease: EASE } },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  show: { opacity: 1, x: 0, transition: { duration: DURATION.base, ease: EASE } },
  exit: { opacity: 0, x: 48, transition: { duration: DURATION.fast, ease: EASE } },
};

/** Props standard : joue une fois à l'entrée dans le viewport. */
export const viewportOnce = { once: true, margin: "-80px" } as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "span";
}

// components/motion/reveal.tsx — wrapper fade-up au scroll (le plus utilisé).
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      transition={{ delay }}
    >
      {children}
    </Tag>
  );
}

// components/motion/stagger.tsx — conteneur + item pour cascades homogènes.
export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}

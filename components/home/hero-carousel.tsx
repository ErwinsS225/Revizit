"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { DURATION, EASE } from "@/components/motion/motion-tokens";
import { HERO_AUTOPLAY_MS, HERO_SLIDES, type HeroSlide } from "@/lib/hero-slides";
import { cn } from "@/lib/utils";

// components/home/hero-carousel.tsx — Hero carousel (fond + texte animés framer-motion).
//
// `slides` permet à la page d'accueil d'injecter les textes administrables
// (/admin/contenu). Sans prop, on retombe sur HERO_SLIDES : le composant reste
// utilisable seul, en test ou ailleurs.
export function HeroCarousel({ slides }: { slides?: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const list = slides && slides.length > 0 ? slides : HERO_SLIDES;
  const total = list.length;

  const goTo = useCallback(
    (i: number) => {
      setDirection(i > index ? 1 : -1);
      setIndex(((i % total) + total) % total);
    },
    [index, total],
  );
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % total);
    }, HERO_AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, total]);

  const slide = list[index];
  if (!slide) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Collections en avant"
      className="relative min-h-[460px] h-[75vh] max-h-[720px] w-full overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Fond : zoom lent + fondu */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={slide.title}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.slow, ease: EASE }}
        >
          <Image src={slide.image} alt={slide.imageAlt} fill priority={index === 0} sizes="100vw" className="object-cover" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" />

      {/* Texte : cascade homogène */}
      <div className="container-shop relative z-10 flex h-full flex-col justify-center py-12 text-ivory">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slide.title + "-text"}
            aria-live="polite"
            className="max-w-xl"
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -16 * direction, transition: { duration: DURATION.fast, ease: EASE } }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
          >
            <motion.p
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } } }}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-gold sm:text-sm"
            >
              {slide.eyebrow}
            </motion.p>
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } } }}
              className="mt-2 font-serif text-3xl leading-tight sm:mt-3 sm:text-5xl lg:text-6xl"
            >
              {slide.title}
            </motion.h1>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } } }}
              className="mt-3 max-w-md text-sm text-ivory/85 sm:mt-4 sm:text-lg"
            >
              {slide.subtitle}
            </motion.p>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } } }}
            >
              <Link
                href={slide.ctaHref as never}
                className={cn(buttonVariants({ variant: "gold", size: "lg" }), "mt-6 h-12 px-6 text-base sm:mt-8")}
              >
                {slide.ctaLabel}
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Flèches : 44x44 minimum */}
      <button
        type="button"
        onClick={prev}
        aria-label="Slide précédente"
        className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-ivory transition hover:scale-110 hover:bg-black/70 active:scale-95 sm:left-4"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Slide suivante"
        className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-ivory transition hover:scale-110 hover:bg-black/70 active:scale-95 sm:right-4"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots avec padding tactile pour atteindre 44px de hauteur */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 sm:bottom-6" role="tablist" aria-label="Choisir une slide">
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.title}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Aller à la slide ${i + 1} : ${s.title}`}
            onClick={() => goTo(i)}
            className="flex h-11 items-center px-1.5"
          >
            <span
              className={cn(
                "h-2 rounded-full transition-all block",
                i === index ? "w-8 bg-ivory" : "w-2 bg-ivory/50 hover:bg-ivory/80",
              )}
            />
          </button>
        ))}
      </div>
    </section>
  );
}


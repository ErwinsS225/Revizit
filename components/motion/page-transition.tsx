"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DURATION, EASE } from "@/components/motion/motion-tokens";

// components/motion/page-transition.tsx — fondu homogène entre les pages.
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: DURATION.fast, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// components/motion/motion-provider.tsx — réduit les animations si l'OS le demande.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

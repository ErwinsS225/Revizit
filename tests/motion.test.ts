import { describe, expect, it } from "vitest";
import { DURATION, EASE, RISE, STAGGER, fadeUp, pop, slideFromRight, staggerParent } from "@/components/motion/motion-tokens";

describe("motion tokens (homogénéité)", () => {
  it("easing unique easeOutExpo", () => {
    expect([...EASE]).toEqual([0.22, 1, 0.36, 1]);
  });
  it("durées ordonnées fast < base < slow", () => {
    expect(DURATION.fast).toBeLessThan(DURATION.base);
    expect(DURATION.base).toBeLessThan(DURATION.slow);
  });
  it("montée standard 24px + cascade 0.06s", () => {
    expect(RISE).toBe(24);
    expect(STAGGER).toBe(0.06);
  });
  it("variants fade-up / pop / slide / stagger définis", () => {
    expect(fadeUp.hidden).toMatchObject({ opacity: 0, y: RISE });
    expect(pop.show).toMatchObject({ opacity: 1, scale: 1 });
    expect(slideFromRight.hidden).toMatchObject({ opacity: 0 });
    expect(staggerParent.show).toBeDefined();
  });
});

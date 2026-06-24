"use client";

import { StoreShell } from "./StoreShell";
import { Hero } from "./Hero";
import { FeelingIndex } from "./FeelingIndex";
import { Manifesto } from "./Manifesto";
import { Atelier } from "./Atelier";

export function Storefront() {
  return (
    <StoreShell>
      <main>
        <Hero />
        <FeelingIndex />
        <Manifesto />
        <Atelier />
      </main>
    </StoreShell>
  );
}

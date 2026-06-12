"use client";

import { StoreShell } from "./StoreShell";
import { Hero } from "./Hero";
import { CatalogIndex } from "./CatalogIndex";
import { Manifesto } from "./Manifesto";
import { Atelier } from "./Atelier";

export function Storefront() {
  return (
    <StoreShell>
      <main>
        <Hero />
        <CatalogIndex />
        <Manifesto />
        <Atelier />
      </main>
    </StoreShell>
  );
}

"use client";

import { Suspense } from "react";
import { PartiparContent } from "./participar-content";

export default function ParticiparPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="font-orbitron text-[#00F0FF] animate-pulse">Cargando...</div>
      </div>
    }>
      <PartiparContent />
    </Suspense>
  );
}

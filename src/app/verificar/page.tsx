"use client";

import { Suspense } from "react";
import { VerificarContent } from "./verificar-content";

export default function VerificarPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="font-orbitron text-[#00F0FF] animate-pulse">Cargando...</div>
      </div>
    }>
      <VerificarContent />
    </Suspense>
  );
}

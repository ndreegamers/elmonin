"use client";

import { useState, useCallback } from "react";
import { Loader2, CheckCircle2, XCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { DniLookupResult } from "@/lib/types";

interface DniInputProps {
  onSuccess: (result: DniLookupResult) => void;
  onClear?: () => void;
}

export function DniInput({ onSuccess, onClear }: DniInputProps) {
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DniLookupResult | null>(null);

  const lookup = useCallback(
    async (value: string) => {
      if (value.length !== 8 || !/^\d{8}$/.test(value)) return;

      setLoading(true);
      setResult(null);

      try {
        const res = await fetch(`/api/dni?dni=${value}`);
        const data: DniLookupResult = await res.json();

        if (res.ok && data.success) {
          setResult(data);
          onSuccess(data);
        } else {
          setResult({ success: false, error: data.error ?? "No encontrado" });
        }
      } catch {
        setResult({ success: false, error: "Error de conexión" });
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
    setDni(value);

    if (value.length < 8) {
      setResult(null);
      onClear?.();
    }

    if (value.length === 8) {
      lookup(value);
    }
  }

  const isSuccess = result?.success === true;
  const isError = result?.success === false;

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-orbitron text-[#94A3B8] uppercase tracking-widest">
        Tu DNI
      </label>

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={dni}
          onChange={handleChange}
          maxLength={8}
          placeholder="12345678"
          className={cn(
            "w-full bg-[#1A1A2E] border rounded-xl px-4 py-3.5 text-[#F1F5F9] font-orbitron text-lg tracking-widest text-center focus:outline-none transition-all duration-200 pr-12",
            isSuccess && "border-[#22C55E] focus:border-[#22C55E]",
            isError && "border-[#EF4444] focus:border-[#EF4444]",
            !result && "border-[#2A2A3E] focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/30"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading && <Loader2 className="w-5 h-5 text-[#00F0FF] animate-spin" />}
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />}
          {isError && <XCircle className="w-5 h-5 text-[#EF4444]" />}
          {!loading && !result && dni.length < 8 && (
            <Search className="w-5 h-5 text-[#94A3B8]/40" />
          )}
        </div>
      </div>

      {/* Result display */}
      {isSuccess && result && (
        <div className="flex items-center gap-3 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
          <div className="flex flex-col">
            <span className="text-[#22C55E] font-inter text-xs">Identidad verificada</span>
            <span className="text-[#F1F5F9] font-inter font-medium text-sm">
              {result.first_name} {result.last_name}
            </span>
          </div>
        </div>
      )}

      {isError && result && (
        <div className="flex items-center gap-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl px-4 py-3">
          <XCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
          <span className="text-[#EF4444] font-inter text-sm">{result.error}</span>
        </div>
      )}

      {dni.length > 0 && dni.length < 8 && (
        <p className="text-xs text-[#94A3B8] text-center">
          {8 - dni.length} dígito{8 - dni.length !== 1 ? "s" : ""} restante{8 - dni.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

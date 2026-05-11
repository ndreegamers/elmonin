"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Loader2, ArrowLeft, Ticket } from "lucide-react";
import { TicketList } from "@/components/ticket-list";
import { VerifyResult } from "@/lib/types";
import { cn } from "@/lib/utils";

export function VerificarContent() {
  const searchParams = useSearchParams();
  const initialDni = searchParams.get("dni") ?? "";

  const [dni, setDni] = useState(initialDni);
  const [inputVal, setInputVal] = useState(initialDni);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [searched, setSearched] = useState(false);

  // Auto-search if DNI comes from query param
  useEffect(() => {
    if (initialDni && /^\d{8}$/.test(initialDni)) {
      handleSearch(initialDni);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(searchDni = dni) {
    if (!/^\d{8}$/.test(searchDni)) return;

    setLoading(true);
    setSearched(false);

    try {
      const res = await fetch(`/api/tickets/verify?dni=${searchDni}`);
      const data: VerifyResult = await res.json();
      setResult(data);
      setSearched(true);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, "").slice(0, 8);
    setInputVal(val);
    setDni(val);
    if (searched) {
      setSearched(false);
      setResult(null);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <main className="flex-1 flex flex-col min-h-screen hero-gradient">
      <div className="w-full max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Back */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[#94A3B8] hover:text-[#00F0FF] font-inter text-sm transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al sorteo
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-1"
        >
          <p className="text-xs font-semibold text-[#00F0FF] uppercase tracking-widest">
            Verificación
          </p>
          <h1 className="font-extrabold text-2xl sm:text-3xl text-[#F1F5F9]">
            Mis Tickets
          </h1>
          <p className="text-[#94A3B8] text-sm font-medium">
            Ingresa tu DNI para consultar tus boletos
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl border border-[#2A2A3E] p-5 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">
              Número de DNI
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={inputVal}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                maxLength={8}
                placeholder="12345678"
                className="w-full bg-[#1A1A2E] border border-[#2A2A3E] rounded-xl px-4 py-3.5 text-[#F1F5F9] font-extrabold text-2xl tracking-[0.3em] text-center focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/30 transition-all"
              />
            </div>
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={loading || inputVal.length !== 8}
            className={cn(
              "w-full flex items-center justify-center gap-3 font-extrabold text-lg rounded-2xl py-4 transition-all duration-300",
              inputVal.length === 8 && !loading
                ? "bg-[#00F0FF] text-[#0A0A0F] hover:brightness-110 glow-cyan"
                : "bg-[#1A1A2E] text-[#94A3B8] cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Buscar mis tickets
              </>
            )}
          </button>
        </motion.div>

        {/* Results */}
        {searched && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl border border-[#2A2A3E] p-5"
          >
            <TicketList result={result} />
          </motion.div>
        )}

        {/* Promo link */}
        {(!searched || (result?.tickets.length === 0 && result?.pending_purchases === 0)) && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-3 py-4"
          >
            <Ticket className="w-10 h-10 text-[#94A3B8]/20" />
            <p className="text-[#94A3B8] text-sm font-inter text-center">
              ¿Aún no tienes tickets?
            </p>
            <Link
              href="/"
              className="flex items-center gap-2 bg-[#00F0FF] text-[#0A0A0F] font-orbitron font-bold text-sm rounded-xl px-5 py-2.5 hover:brightness-110 transition-all glow-cyan"
            >
              <Ticket className="w-4 h-4" />
              Participar ahora
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}

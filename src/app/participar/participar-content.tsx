"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Ticket, User, CreditCard, CheckCircle2,
  ChevronLeft, ChevronRight, Loader2, Phone, ArrowLeft
} from "lucide-react";
import { TicketSelector } from "@/components/ticket-selector";
import { DniInput } from "@/components/dni-input";
import { PaymentModal } from "@/components/payment-modal";
import { calculateBonus } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { DniLookupResult, RaffleWithStats } from "@/lib/types";
import { cn } from "@/lib/utils";

type Step = 0 | 1 | 2;

const STEPS = [
  { icon: Ticket, label: "Tickets" },
  { icon: User, label: "Datos" },
  { icon: CreditCard, label: "Pago" },
];

export function PartiparContent() {
  const searchParams = useSearchParams();
  const raffleId = searchParams.get("raffle");
  const router = useRouter();

  const [raffle, setRaffle] = useState<RaffleWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>(0);

  // Form state
  const [ticketCount, setTicketCount] = useState(1);
  const [dniData, setDniData] = useState<DniLookupResult | null>(null);
  const [phone, setPhone] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRaffle() {
      try {
        const res = await fetch("/api/raffles");
        const data = await res.json();
        const raffles: RaffleWithStats[] = data.raffles ?? [];

        if (raffleId) {
          const found = raffles.find((r) => r.id === raffleId);
          setRaffle(found ?? raffles[0] ?? null);
        } else {
          setRaffle(raffles[0] ?? null);
        }
      } catch {
        setRaffle(null);
      } finally {
        setLoading(false);
      }
    }
    fetchRaffle();
  }, [raffleId]);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin" />
      </main>
    );
  }

  if (!raffle) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-[#94A3B8] font-inter mb-4">No hay sorteos activos.</p>
        <Link href="/" className="text-[#00F0FF] font-orbitron text-sm">
          ← Volver al inicio
        </Link>
      </main>
    );
  }

  // Success screen
  if (purchaseId) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 hero-gradient">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl border border-[#22C55E]/30 p-8 max-w-md w-full flex flex-col items-center gap-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle2 className="w-16 h-16 text-[#22C55E]" />
          </motion.div>

          <div>
            <h2 className="font-extrabold text-3xl text-[#F1F5F9] mb-2">
              ¡Compra enviada!
            </h2>
            <p className="text-[#94A3B8] font-inter text-sm leading-relaxed">
              Tu comprobante fue recibido. Estamos verificando tu pago.
              Te asignaremos tus tickets una vez confirmado.
            </p>
          </div>

          <div className="bg-[#1A1A2E] rounded-xl px-6 py-4 border border-[#2A2A3E] w-full">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-1">Tu DNI</p>
            <p className="font-extrabold text-2xl text-[#00F0FF] tracking-widest">
              {dniData?.success ? dniData.dni : "—"}
            </p>
            <p className="text-xs text-[#94A3B8] mt-2">
              Úsalo para verificar tus tickets
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Link
              href={`/verificar?dni=${dniData?.success ? dniData.dni : ""}`}
              className="w-full flex items-center justify-center gap-2 bg-[#00F0FF] text-[#0A0A0F] font-orbitron font-black rounded-2xl py-4 transition-all hover:brightness-110 glow-cyan"
            >
              <Ticket className="w-5 h-5" />
              Ver mis tickets
            </Link>
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 border border-[#2A2A3E] text-[#94A3B8] font-orbitron text-sm rounded-2xl py-3 transition-all hover:border-[#00F0FF]/30 hover:text-[#00F0FF]"
            >
              Volver al sorteo
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  const bonus = calculateBonus(ticketCount);
  const totalAmount = ticketCount * raffle.ticket_price;
  const isPhoneValid = /^9\d{8}$/.test(phone);
  const canProceedStep0 = ticketCount > 0;
  const canProceedStep1 = dniData?.success === true && isPhoneValid;

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
        <div>
          <p className="text-xs font-semibold text-[#00F0FF] uppercase tracking-widest mb-1">
            Participa
          </p>
          <h1 className="font-extrabold text-2xl sm:text-3xl text-[#F1F5F9]">
            {raffle.title}
          </h1>
          <p className="text-[#94A3B8] text-sm font-medium mt-1">
            {formatCurrency(raffle.ticket_price)} por ticket
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === i;
            const isDone = step > i;
            return (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300",
                      isActive && "border-[#00F0FF] bg-[#00F0FF]/20 text-[#00F0FF]",
                      isDone && "border-[#22C55E] bg-[#22C55E]/20 text-[#22C55E]",
                      !isActive && !isDone && "border-[#2A2A3E] bg-[#12121A] text-[#94A3B8]"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-wide",
                      isActive ? "text-[#00F0FF]" : isDone ? "text-[#22C55E]" : "text-[#94A3B8]"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-px mb-4 transition-all duration-300",
                      step > i ? "bg-[#22C55E]/50" : "bg-[#2A2A3E]"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="glass-card rounded-2xl border border-[#2A2A3E] p-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <h2 className="font-bold text-[#F1F5F9] text-xl mb-1">
                    Elige tus tickets
                  </h2>
                  <p className="text-[#94A3B8] text-sm font-medium">
                    Más tickets = más chances de ganar
                  </p>
                </div>
                <TicketSelector
                  ticketPrice={raffle.ticket_price}
                  value={ticketCount}
                  onChange={setTicketCount}
                />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <h2 className="font-bold text-[#F1F5F9] text-xl mb-1">
                    Tus datos
                  </h2>
                  <p className="text-[#94A3B8] text-sm font-medium">
                    Usamos tu DNI para identificarte y asignarte los tickets
                  </p>
                </div>

                <DniInput
                  onSuccess={(result) => setDniData(result)}
                  onClear={() => setDniData(null)}
                />

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-orbitron text-[#94A3B8] uppercase tracking-widest">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone className={cn(
                      "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                      phone.length > 0 && !isPhoneValid ? "text-[#EF4444]" : isPhoneValid ? "text-[#22C55E]" : "text-[#94A3B8]"
                    )} />
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                        setPhone(digits);
                      }}
                      placeholder="9xxxxxxxx"
                      className={cn(
                        "w-full bg-[#1A1A2E] border rounded-xl px-4 py-3.5 pl-10 text-[#F1F5F9] font-inter focus:outline-none focus:ring-1 transition-all",
                        phone.length > 0 && !isPhoneValid
                          ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/30"
                          : isPhoneValid
                          ? "border-[#22C55E] focus:border-[#22C55E] focus:ring-[#22C55E]/30"
                          : "border-[#2A2A3E] focus:border-[#00F0FF] focus:ring-[#00F0FF]/30"
                      )}
                    />
                  </div>
                  {phone.length > 0 && !isPhoneValid && (
                    <p className="text-xs text-[#EF4444] font-inter">
                      Ingresa un número válido de 9 dígitos que empiece en 9
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <div>
                  <h2 className="font-bold text-[#F1F5F9] text-xl mb-1">
                    Confirmar y pagar
                  </h2>
                  <p className="text-[#94A3B8] text-sm font-medium">
                    Revisa tu pedido antes de pagar
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-[#1A1A2E] rounded-xl p-4 border border-[#2A2A3E] flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#94A3B8] text-sm font-inter">Participante</span>
                    <span className="text-[#F1F5F9] font-inter text-sm font-medium">
                      {dniData?.first_name} {dniData?.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#94A3B8] text-sm font-inter">DNI</span>
                    <span className="font-orbitron text-[#00F0FF]">{dniData?.dni}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#94A3B8] text-sm font-inter">Tickets</span>
                    <span className="font-orbitron font-bold text-[#F1F5F9]">
                      {ticketCount}
                      {bonus > 0 && (
                        <span className="text-[#8B5CF6] ml-1">+{bonus}</span>
                      )}
                      {" "}= {ticketCount + bonus} total
                    </span>
                  </div>
                  <div className="border-t border-[#2A2A3E] pt-3 flex justify-between items-center">
                    <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Total</span>
                    <span className="font-extrabold text-2xl text-[#00F0FF]">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setPaymentOpen(true)}
                  className="w-full flex items-center justify-center gap-3 bg-[#00F0FF] text-[#0A0A0F] font-orbitron font-black text-base rounded-2xl py-4 transition-all hover:brightness-110 animate-pulse-glow active:scale-95"
                >
                  <CreditCard className="w-5 h-5" />
                  Ver QR y pagar
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="flex items-center gap-2 border border-[#2A2A3E] text-[#94A3B8] font-orbitron text-sm rounded-2xl px-5 py-3.5 hover:border-[#2A2A3E] hover:text-[#F1F5F9] transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Atrás
            </button>
          )}

          {step < 2 && (
            <button
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={step === 0 ? !canProceedStep0 : !canProceedStep1}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 font-orbitron font-black text-base rounded-2xl py-3.5 transition-all",
                (step === 0 ? canProceedStep0 : canProceedStep1)
                  ? "bg-[#00F0FF] text-[#0A0A0F] hover:brightness-110 glow-cyan"
                  : "bg-[#1A1A2E] text-[#94A3B8] cursor-not-allowed"
              )}
            >
              Continuar
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onSuccess={(id) => {
          setPaymentOpen(false);
          setPurchaseId(id);
        }}
        raffleId={raffle.id}
        dni={dniData?.dni ?? ""}
        firstName={dniData?.first_name ?? ""}
        lastName={dniData?.last_name ?? ""}
        phone={phone}
        ticketsPaid={ticketCount}
        ticketsBonus={bonus}
        totalAmount={totalAmount}
      />
    </main>
  );
}

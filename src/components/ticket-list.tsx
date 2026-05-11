"use client";

import { motion } from "framer-motion";
import { Ticket, Calendar, Clock, AlertCircle, XCircle } from "lucide-react";
import { VerifyResult, TicketWithRaffle } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface TicketListProps {
  result: VerifyResult;
}

function TicketCard({ ticket }: { ticket: TicketWithRaffle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border border-[#00F0FF]/30 bg-[#12121A] overflow-hidden group hover:border-[#00F0FF]/60 transition-all duration-300"
    >
      {/* Top glow bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent opacity-60" />

      <div className="p-5 flex flex-col gap-3">
        {/* Ticket code — the hero element */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-xs text-[#94A3B8] font-inter">Tu ticket</span>
          </div>
          <div className="bg-[#00F0FF]/10 rounded-lg px-2 py-0.5 border border-[#00F0FF]/20">
            <span className="text-[10px] font-orbitron text-[#22C55E] font-bold uppercase">
              Confirmado
            </span>
          </div>
        </div>

        <div className="font-orbitron font-black text-2xl text-[#00F0FF] tracking-wider glow-cyan-sm text-center py-2 bg-[#00F0FF]/5 rounded-xl border border-[#00F0FF]/10">
          {ticket.ticket_code}
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-[#F1F5F9] font-inter font-medium text-sm">
            {ticket.raffle?.title}
          </p>
          {ticket.raffle?.draw_date && (
            <div className="flex items-center gap-1.5 text-[#94A3B8] text-xs font-inter">
              <Calendar className="w-3 h-3" />
              Sorteo: {formatDate(ticket.raffle.draw_date)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function TicketList({ result }: TicketListProps) {
  const { participant, tickets, pending_purchases, rejected_purchases } = result;

  if (!participant) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <Ticket className="w-12 h-12 text-[#94A3B8]/30" />
        <p className="text-[#94A3B8] font-inter">
          No encontramos registros con ese DNI.
        </p>
        <p className="text-xs text-[#94A3B8]/60 font-inter">
          Si realizaste una compra reciente, es posible que aún esté en proceso.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Participant greeting */}
      <div className="bg-[#1A1A2E] rounded-xl px-5 py-4 border border-[#2A2A3E]">
        <p className="text-xs text-[#94A3B8] font-orbitron uppercase tracking-wide mb-1">
          Participante
        </p>
        <p className="font-inter font-semibold text-[#F1F5F9] text-lg">
          {participant.first_name} {participant.last_name}
        </p>
        <p className="font-orbitron text-[#00F0FF] tracking-widest text-sm">
          DNI {participant.dni}
        </p>
      </div>

      {/* Approved tickets */}
      {tickets.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-orbitron text-[#94A3B8] uppercase tracking-widest">
              Tus tickets confirmados
            </p>
            <span className="font-orbitron font-bold text-[#00F0FF] text-sm">
              {tickets.length}
            </span>
          </div>
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-[#94A3B8] text-sm font-inter">
          Aún no tienes tickets confirmados.
        </div>
      )}

      {/* Pending purchases */}
      {pending_purchases > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-3 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl px-4 py-3.5"
        >
          <Clock className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <div>
            <p className="text-[#F59E0B] font-inter font-medium text-sm">
              {pending_purchases} compra{pending_purchases !== 1 ? "s" : ""} pendiente{pending_purchases !== 1 ? "s" : ""}
            </p>
            <p className="text-[#F59E0B]/70 font-inter text-xs mt-0.5">
              Estamos verificando tu pago. Te asignaremos los tickets pronto.
            </p>
          </div>
        </motion.div>
      )}

      {/* Rejected purchases */}
      {rejected_purchases > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl px-4 py-3.5"
        >
          <XCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
          <div>
            <p className="text-[#EF4444] font-inter font-medium text-sm">
              {rejected_purchases} pago{rejected_purchases !== 1 ? "s" : ""} rechazado{rejected_purchases !== 1 ? "s" : ""}
            </p>
            <p className="text-[#EF4444]/70 font-inter text-xs mt-0.5">
              Si crees que es un error, contáctanos.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

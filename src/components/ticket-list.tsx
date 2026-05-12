"use client";

import { motion } from "framer-motion";
import { Ticket, Clock, XCircle } from "lucide-react";
import { VerifyResult, TicketWithRaffle } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface TicketListProps {
  result: VerifyResult;
}

function parseTicketCode(code: string): { prefix: string; number: string; hash: string } {
  const parts = code.split("-");
  if (parts.length >= 3) {
    return { prefix: parts[0], number: parts[1], hash: parts[2] };
  }
  return { prefix: code, number: "", hash: "" };
}

function TicketRow({ ticket, isLast }: { ticket: TicketWithRaffle; isLast: boolean }) {
  const { prefix, number, hash } = parseTicketCode(ticket.ticket_code);
  return (
    <div className={`flex items-center gap-3 py-2.5 px-4 ${!isLast ? "border-b border-[#2A2A3E]/40" : ""}`}>
      <Ticket className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
      <span className="font-orbitron text-[11px] text-[#94A3B8] w-8 shrink-0">{prefix}</span>
      <span className="font-orbitron font-black text-sm text-[#00F0FF] w-12 shrink-0 tabular-nums">
        {number}
      </span>
      <span className="font-orbitron text-[11px] text-[#8B5CF6] tracking-widest flex-1 tabular-nums">
        {hash}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
        <span className="text-[10px] font-orbitron text-[#22C55E] uppercase">OK</span>
      </div>
    </div>
  );
}

function TicketGroup({ raffleTitle, drawDate, tickets }: {
  raffleTitle: string;
  drawDate?: string;
  tickets: TicketWithRaffle[];
}) {
  return (
    <div className="flex flex-col">
      {/* Group header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A3E]">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-orbitron text-[#F1F5F9] font-bold leading-tight">
            {raffleTitle}
          </span>
          {drawDate && (
            <span className="text-[10px] text-[#94A3B8]">
              Sorteo: {formatDate(drawDate)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-[#00F0FF]/10 rounded-lg px-2.5 py-1 border border-[#00F0FF]/20">
          <Ticket className="w-3 h-3 text-[#00F0FF]" />
          <span className="font-orbitron font-black text-sm text-[#00F0FF]">{tickets.length}</span>
        </div>
      </div>

      {/* Column labels */}
      <div className="flex items-center gap-3 px-4 py-1.5 bg-[#0A0A0F]/30">
        <span className="w-3.5 shrink-0" />
        <span className="text-[9px] font-orbitron text-[#94A3B8]/50 uppercase w-8 shrink-0">Serie</span>
        <span className="text-[9px] font-orbitron text-[#94A3B8]/50 uppercase w-12 shrink-0">Nro.</span>
        <span className="text-[9px] font-orbitron text-[#94A3B8]/50 uppercase flex-1">Hash</span>
        <span className="text-[9px] font-orbitron text-[#94A3B8]/50 uppercase shrink-0">Est.</span>
      </div>

      {/* Ticket rows */}
      {tickets.map((ticket, idx) => (
        <TicketRow key={ticket.id} ticket={ticket} isLast={idx === tickets.length - 1} />
      ))}
    </div>
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

  // Group tickets by raffle
  const groups = tickets.reduce<Record<string, { title: string; drawDate?: string; tickets: TicketWithRaffle[] }>>(
    (acc, ticket) => {
      const key = ticket.raffle_id;
      if (!acc[key]) {
        acc[key] = {
          title: ticket.raffle?.title ?? "Sorteo",
          drawDate: ticket.raffle?.draw_date,
          tickets: [],
        };
      }
      acc[key].tickets.push(ticket);
      return acc;
    },
    {}
  );

  return (
    <div className="flex flex-col gap-4">
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
        <div className="flex flex-col gap-1">
          <p className="text-xs font-orbitron text-[#94A3B8] uppercase tracking-widest px-1">
            Tickets confirmados
          </p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#00F0FF]/20 bg-[#12121A] overflow-hidden"
          >
            {Object.entries(groups).map(([key, group], groupIdx) => (
              <div key={key} className={groupIdx > 0 ? "border-t border-[#2A2A3E]/60 mt-1" : ""}>
                <TicketGroup
                  raffleTitle={group.title}
                  drawDate={group.drawDate}
                  tickets={group.tickets}
                />
              </div>
            ))}
          </motion.div>
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

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Ticket, ChevronRight, Calendar } from "lucide-react";
import { RaffleWithStats } from "@/lib/types";
import { CountdownTimer } from "@/components/countdown-timer";
import { ProgressBar } from "@/components/progress-bar";
import { formatCurrency, formatDate } from "@/lib/utils";

interface RaffleHeroProps {
  raffle: RaffleWithStats;
}

export function RaffleHero({ raffle }: RaffleHeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#8B5CF6]/6 blur-[100px] rounded-full pointer-events-none" />

      {/* Page title above card */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center mb-6"
      >
        <h1 className="font-black text-3xl sm:text-4xl text-[#00F0FF] tracking-tight leading-tight">
          LOS PREMIOS<br className="sm:hidden" /> DEL MONIN
        </h1>
      </motion.div>

      {/* Raffle Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="relative z-10 w-full max-w-sm sm:max-w-md"
      >
        <div className="animate-card-glow rounded-2xl overflow-hidden bg-[#12121A] border border-[#2A2A3E]">

          {/* Image */}
          <div className="relative aspect-[4/3] w-full overflow-hidden group">
            <Image
              src={raffle.image_url}
              alt={raffle.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#12121A] via-[#12121A]/20 to-transparent" />

            {/* Date badge — top left */}
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1.5 bg-[#0A0A0F]/80 backdrop-blur-sm border border-[#2A2A3E] rounded-lg px-2.5 py-1">
                <Calendar className="w-3 h-3 text-[#00F0FF]" />
                <span className="text-[10px] font-semibold text-[#F1F5F9] uppercase tracking-wide">
                  Sorteo · {formatDate(raffle.draw_date)}
                </span>
              </div>
            </div>
          </div>

          {/* Card body */}
          <div className="flex flex-col gap-4 p-4 sm:p-5">

            {/* Prize name + price */}
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-extrabold text-lg sm:text-xl text-[#F1F5F9] leading-tight flex-1">
                {raffle.title}
              </h2>
              <div className="flex-shrink-0 bg-[#D97706] text-white rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5" />
                <span className="font-extrabold text-base leading-none whitespace-nowrap">
                  {formatCurrency(raffle.ticket_price)}
                </span>
              </div>
            </div>

            {/* Description */}
            {raffle.description && (
              <p className="text-[#94A3B8] text-sm font-medium leading-relaxed -mt-1">
                {raffle.description}
              </p>
            )}

            {/* Countdown */}
            <div className="bg-[#0A0A0F] rounded-xl p-3 border border-[#2A2A3E]/60">
              <CountdownTimer targetDate={raffle.draw_date} compact />
            </div>

            {/* Progress bar */}
            <ProgressBar
              soldPercentage={raffle.sold_percentage}
              totalTickets={raffle.total_tickets}
              ticketsSold={raffle.tickets_sold}
            />

            {/* CTA */}
            <Link
              href={`/participar?raffle=${raffle.id}`}
              className="w-full flex items-center justify-center gap-2 bg-[#00F0FF] text-[#0A0A0F] font-extrabold text-lg rounded-xl py-4 transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
            >
              <Ticket className="w-5 h-5" />
              PARTICIPA AHORA
              <ChevronRight className="w-4 h-4" />
            </Link>

            {/* Secondary */}
            <Link
              href="/verificar"
              className="w-full flex items-center justify-center gap-2 text-[#94A3B8] text-sm font-medium transition-colors hover:text-[#00F0FF]"
            >
              Ver mis tickets
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative z-10 mt-6 text-center text-xs text-[#94A3B8]/50"
      >
        Pago via Yape / Plin · Verificación manual · Solo Perú
      </motion.p>
    </section>
  );
}

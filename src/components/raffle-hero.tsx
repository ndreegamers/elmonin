"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Ticket, ChevronRight } from "lucide-react";
import { RaffleWithStats } from "@/lib/types";
import { CountdownTimer } from "@/components/countdown-timer";
import { ProgressBar } from "@/components/progress-bar";
import { formatCurrency } from "@/lib/utils";

interface RaffleHeroProps {
  raffle: RaffleWithStats;
  index?: number;
}

export function RaffleHero({ raffle, index = 0 }: RaffleHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1 + index * 0.08 }}
      className="w-full max-w-sm sm:max-w-none"
    >
      <div className="animate-card-glow rounded-2xl overflow-hidden bg-[#12121A] border border-[#2A2A3E] h-full flex flex-col">

        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden group">
          <Image
            src={raffle.image_url}
            alt={raffle.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12121A] via-[#12121A]/20 to-transparent" />
        </div>

        {/* Card body */}
        <div className="flex flex-col gap-4 p-4 sm:p-5 flex-1">

          {/* Prize name + price */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-extrabold text-lg sm:text-xl text-[#F1F5F9] leading-tight flex-1 line-clamp-2">
              {raffle.title}
            </h2>
            <div className="flex-shrink-0 bg-[#D97706] text-white rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5" />
              <span className="font-extrabold text-base leading-none whitespace-nowrap">
                {formatCurrency(raffle.ticket_price)}
              </span>
            </div>
          </div>

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
            className="mt-auto w-full flex items-center justify-center gap-2 bg-[#00F0FF] text-[#0A0A0F] font-extrabold text-lg rounded-xl py-4 transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
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
            <Ticket className="w-4 h-4" />
            Ver mis tickets
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

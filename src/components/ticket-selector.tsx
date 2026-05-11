"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { QUICK_PICKS, PROMO_TIERS, calculateBonus, getActivePromo } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

interface TicketSelectorProps {
  ticketPrice: number;
  value: number;
  onChange: (value: number) => void;
}

export function TicketSelector({ ticketPrice, value, onChange }: TicketSelectorProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const bonus = calculateBonus(value);
  const activePromo = getActivePromo(value);
  const total = value + bonus;
  const totalAmount = value * ticketPrice;

  function handleQuickPick(qty: number) {
    setCustomMode(false);
    onChange(qty);
  }

  function handleCustomChange(val: string) {
    setCustomInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) onChange(num);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Promo cards */}
      <div className="grid grid-cols-2 gap-3">
        {PROMO_TIERS.map((tier) => {
          const isActive = activePromo?.minTickets === tier.minTickets;
          return (
            <motion.button
              key={tier.minTickets}
              onClick={() => handleQuickPick(tier.minTickets)}
              whileTap={{ scale: 0.96 }}
              style={isActive ? {
                borderColor: tier.color,
                backgroundColor: `${tier.color}15`,
              } : {}}
              className={cn(
                "flex flex-col items-center justify-center gap-2 pixel-corners p-4 min-h-[110px] border transition-all duration-200",
                isActive
                  ? "border-transparent"
                  : "border-[#2A2A3E] bg-[#12121A] hover:border-[#2A2A3E]"
              )}
            >
              <Star
                className="w-6 h-6 transition-colors duration-200"
                style={{ color: isActive ? tier.color : "#94A3B8" }}
                fill={isActive ? tier.color : "none"}
              />
              <span
                className={cn(
                  "font-inter text-[11px] text-center leading-snug",
                  isActive ? "text-[#F1F5F9]" : "text-[#94A3B8]"
                )}
              >
                {tier.label}
              </span>
              <span
                className="font-orbitron text-[10px] font-bold px-2 py-0.5 pixel-corners transition-colors duration-200"
                style={isActive
                  ? { backgroundColor: tier.color, color: "#0A0A0F" }
                  : { backgroundColor: "#2A2A3E", color: "#94A3B8" }
                }
              >
                {tier.badge}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Quick picks */}
      <div>
        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-3">
          Seleccionar cantidad
        </p>
        <div className="grid grid-cols-5 gap-2">
          {QUICK_PICKS.map((qty) => {
            const qBonus = calculateBonus(qty);
            const isSelected = value === qty && !customMode;
            return (
              <motion.button
                key={qty}
                onClick={() => handleQuickPick(qty)}
                whileTap={{ scale: 0.93 }}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-xl py-3 border transition-all duration-200",
                  isSelected
                    ? "border-[#00F0FF] bg-[#00F0FF]/10 glow-cyan-sm"
                    : "border-[#2A2A3E] bg-[#12121A] hover:border-[#00F0FF]/40"
                )}
              >
                <span
                  className={cn(
                    "font-extrabold text-xl leading-none",
                    isSelected ? "text-[#00F0FF]" : "text-[#F1F5F9]"
                  )}
                >
                  {qty}
                </span>
                <span className="text-[10px] font-medium text-[#94A3B8] mt-0.5">
                  {qty === 1 ? "ticket" : "tickets"}
                </span>
                {qBonus > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#FF3E9A] text-white text-[8px] font-bold rounded-full px-1 leading-4">
                    +{qBonus}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom quantity */}
      <div>
        <button
          onClick={() => { setCustomMode(true); setCustomInput(value.toString()); }}
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-xl py-2.5 border text-sm transition-all duration-200",
            customMode
              ? "border-[#00F0FF]/50 bg-[#1A1A2E] text-[#00F0FF]"
              : "border-[#2A2A3E] bg-[#12121A] text-[#94A3B8] hover:border-[#2A2A3E]"
          )}
        >
          <Zap className="w-3.5 h-3.5" />
          Cantidad personalizada
        </button>
        <AnimatePresence>
          {customMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <input
                type="number"
                min={1}
                value={customInput}
                onChange={(e) => handleCustomChange(e.target.value)}
                placeholder="Ej: 15"
                autoFocus
                className="mt-2 w-full bg-[#1A1A2E] border border-[#00F0FF]/30 rounded-xl px-4 py-3 text-[#F1F5F9] font-extrabold text-center text-2xl focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/30 transition-all"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <AnimatePresence>
        {value > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card rounded-xl border border-[#2A2A3E] p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
                <Ticket className="w-4 h-4" />
                <span>
                  {value} ticket{value !== 1 ? "s" : ""} × {formatCurrency(ticketPrice)}
                </span>
              </div>
              <span className="font-bold text-[#F1F5F9]">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            {bonus > 0 && (
              <div className="flex items-center justify-between text-[#8B5CF6]">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4" />
                  <span>Bonus promo &quot;{activePromo?.badge}&quot;</span>
                </div>
                <span className="font-bold">+{bonus} gratis</span>
              </div>
            )}

            <div className="border-t border-[#2A2A3E] pt-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">
                Total tickets
              </span>
              <span className="font-extrabold text-2xl text-[#00F0FF]">
                {total}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">
                A pagar
              </span>
              <span className="font-extrabold text-2xl text-[#F1F5F9]">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

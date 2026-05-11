"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTimeRemaining } from "@/lib/utils";

interface TimeUnit {
  value: number;
  label: string;
}

function TimeBox({ value, label }: TimeUnit) {
  const display = value.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div className="relative w-full bg-[#1A1A2E] border border-[#2A2A3E] rounded-lg flex items-center justify-center py-2 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00F0FF]/30 to-transparent" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={display}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-2xl font-extrabold text-[#00F0FF] tabular-nums leading-none"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

interface CountdownTimerProps {
  targetDate: string;
  compact?: boolean;
}

export function CountdownTimer({ targetDate, compact = false }: CountdownTimerProps) {
  const [time, setTime] = useState(getTimeRemaining(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getTimeRemaining(targetDate);
      setTime(next);
      if (next.total <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (time.total <= 0) {
    return (
      <div className="text-[#FF3E9A] text-center font-bold text-base animate-pulse">
        ¡EL SORTEO HA FINALIZADO!
      </div>
    );
  }

  const units: TimeUnit[] = [
    { value: time.days, label: "días" },
    { value: time.hours, label: "horas" },
    { value: time.minutes, label: "min" },
    { value: time.seconds, label: "seg" },
  ];

  if (compact) {
    return (
      <div className="flex items-start gap-1.5">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-start gap-1.5 flex-1">
            <TimeBox {...unit} />
            {i < units.length - 1 && (
              <span className="text-lg font-bold text-[#00F0FF]/50 leading-none mt-1.5 flex-shrink-0">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Full (non-compact) mode — kept for potential standalone use
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">
        El sorteo se realiza en
      </p>
      <div className="flex items-start gap-2 sm:gap-3">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-start gap-2 sm:gap-3">
            <TimeBox {...unit} />
            {i < units.length - 1 && (
              <span className="text-2xl font-bold text-[#00F0FF]/60 mt-1 leading-none select-none">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

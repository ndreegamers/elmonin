"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { FOMO_HOT_THRESHOLD } from "@/lib/constants";

interface ProgressBarProps {
  soldPercentage: number;
  totalTickets: number;
  ticketsSold: number;
}

export function ProgressBar({
  soldPercentage,
  totalTickets,
  ticketsSold,
}: ProgressBarProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 80, damping: 20 });

  const isHot = soldPercentage >= FOMO_HOT_THRESHOLD;

  useEffect(() => {
    if (isInView) {
      motionValue.set(soldPercentage);
    }
  }, [isInView, soldPercentage, motionValue]);

  return (
    <div ref={ref} className="w-full flex flex-col gap-2">
      {/* Header row */}
      <div className="flex items-center gap-1.5">
        {isHot && (
          <Flame className="w-4 h-4 text-[#FF3E9A] animate-pulse" />
        )}
        <span
          className={cn(
            "text-sm font-semibold uppercase tracking-wide",
            isHot ? "text-[#FF3E9A]" : "text-[#94A3B8]"
          )}
        >
          {isHot ? "¡CASI AGOTADO!" : "PROGRESO..."}
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-6 bg-[#1A1A2E] rounded-full overflow-hidden border border-[#2A2A3E]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full flex items-center justify-end pr-2 min-w-[2.5rem]"
          style={{
            background:
              "linear-gradient(90deg, #92400E 0%, #D97706 60%, #F59E0B 100%)",
          }}
          initial={{ width: "0%" }}
          animate={{ width: isInView ? `${soldPercentage}%` : "0%" }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        >
          {/* Scan line shimmer */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan-line" />
          </div>
          <span className="relative text-[11px] font-extrabold text-white/90 leading-none whitespace-nowrap">
            {soldPercentage.toFixed(0)}%
          </span>
        </motion.div>
      </div>

    </div>
  );
}

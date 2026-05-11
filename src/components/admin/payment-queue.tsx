"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, Clock, ExternalLink, Loader2,
  User, Ticket, CreditCard, Calendar
} from "lucide-react";
import { PurchaseWithDetails } from "@/lib/types";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PaymentQueueProps {
  purchases: PurchaseWithDetails[];
  receiptUrls: Record<string, string>;
  onRefresh: () => void;
}

export function PaymentQueue({ purchases, receiptUrls, onRefresh }: PaymentQueueProps) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function handleAction(purchaseId: string, action: "approve" | "reject") {
    setProcessing(purchaseId);
    try {
      const res = await fetch(`/api/payments/${purchaseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          action === "approve" ? "✅ Pago aprobado y tickets asignados" : "❌ Pago rechazado"
        );
        onRefresh();
      } else {
        toast.error(data.error ?? "Error al procesar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setProcessing(null);
    }
  }

  if (purchases.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Clock className="w-12 h-12 text-[#94A3B8]/20" />
        <p className="text-[#94A3B8] font-inter">No hay pagos pendientes</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence>
        {purchases.map((purchase) => {
          const isProcessing = processing === purchase.id;
          const isExpanded = expanded === purchase.id;
          const receiptUrl = receiptUrls[purchase.id];

          return (
            <motion.div
              key={purchase.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card rounded-xl border border-[#2A2A3E] overflow-hidden"
            >
              {/* Main row */}
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                      <span className="font-inter font-medium text-[#F1F5F9] text-sm truncate">
                        {purchase.participant?.first_name} {purchase.participant?.last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-orbitron text-[#00F0FF] text-xs tracking-wider">
                        DNI {purchase.participant?.dni}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={cn(
                        "font-orbitron text-xs font-bold uppercase px-2 py-0.5 rounded-full",
                        purchase.payment_method === "yape"
                          ? "bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30"
                          : "bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20"
                      )}
                    >
                      {purchase.payment_method}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Ticket className="w-3 h-3" />
                      <span className="font-orbitron font-bold text-[#F1F5F9]">
                        {purchase.total_tickets}
                      </span>
                      <span>tickets</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      <span className="font-orbitron font-bold text-[#00F0FF]">
                        {formatCurrency(purchase.total_amount)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDateShort(purchase.created_at)}</span>
                  </div>
                </div>

                {/* Receipt preview */}
                {receiptUrl && (
                  <button
                    onClick={() => setExpanded(isExpanded ? null : purchase.id)}
                    className="flex items-center gap-2 text-xs text-[#00F0FF] hover:underline w-fit"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {isExpanded ? "Ocultar" : "Ver"} comprobante
                  </button>
                )}

                <AnimatePresence>
                  {isExpanded && receiptUrl && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <img
                        src={receiptUrl}
                        alt="Comprobante"
                        className="w-full max-h-72 object-contain rounded-xl border border-[#2A2A3E] bg-[#1A1A2E]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons */}
                {purchase.payment_status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleAction(purchase.id, "approve")}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#22C55E]/10 border border-[#22C55E]/30 hover:bg-[#22C55E]/20 text-[#22C55E] font-orbitron text-sm font-bold rounded-xl py-2.5 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleAction(purchase.id, "reject")}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#EF4444]/10 border border-[#EF4444]/30 hover:bg-[#EF4444]/20 text-[#EF4444] font-orbitron text-sm font-bold rounded-xl py-2.5 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

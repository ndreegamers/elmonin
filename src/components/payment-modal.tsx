"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Loader2, Send, CheckCircle2, Ticket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReceiptUploader } from "@/components/receipt-uploader";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (purchaseId: string) => void;
  raffleId: string;
  dni: string;
  firstName: string;
  lastName: string;
  phone: string;
  ticketsPaid: number;
  ticketsBonus: number;
  totalAmount: number;
}

export function PaymentModal({
  open,
  onClose,
  onSuccess,
  raffleId,
  dni,
  firstName,
  lastName,
  phone,
  ticketsPaid,
  ticketsBonus,
  totalAmount,
}: PaymentModalProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalTickets = ticketsPaid + ticketsBonus;

  async function handleSubmit() {
    if (!receiptFile) {
      toast.error("Debes subir tu comprobante de pago");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("raffle_id", raffleId);
      formData.append("dni", dni);
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      if (phone) formData.append("phone", phone);
      formData.append("tickets_paid", ticketsPaid.toString());
      formData.append("payment_method", "yape");
      formData.append("receipt", receiptFile);

      const res = await fetch("/api/tickets", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Error al procesar tu compra");
        return;
      }

      onSuccess(data.purchase_id);
    } catch {
      toast.error("Error de conexión. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !submitting) onClose(); }}>
      <DialogContent className="bg-[#12121A] border-[#2A2A3E] max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-[#F1F5F9] text-lg">
            Realizar pago
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* Order summary */}
          <div className="bg-[#1A1A2E] rounded-xl p-4 flex flex-col gap-2 border border-[#2A2A3E]">
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8] text-sm">Tickets</span>
              <span className="font-orbitron font-bold text-[#F1F5F9]">
                {ticketsPaid}
                {ticketsBonus > 0 && (
                  <span className="text-[#8B5CF6] ml-1">+{ticketsBonus} gratis</span>
                )}
              </span>
            </div>
            {ticketsBonus > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[#94A3B8] text-sm">Total tickets</span>
                <span className="font-orbitron font-bold text-[#00F0FF]">{totalTickets}</span>
              </div>
            )}
            <div className="border-t border-[#2A2A3E] pt-2 flex justify-between items-center">
              <span className="font-orbitron text-sm text-[#94A3B8] uppercase">Monto a pagar</span>
              <span className="font-orbitron font-black text-xl text-[#00F0FF]">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Payment method logos */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-orbitron text-[#94A3B8] uppercase tracking-widest">
              Paga con
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white flex items-center justify-center p-1">
                <Image
                  src="/yape-app-logo-png_seeklogo-399697.png"
                  alt="Yape"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
              <span className="text-[#94A3B8] text-lg font-bold">·</span>
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white flex items-center justify-center p-1">
                <Image
                  src="/plin-logo-png_seeklogo-386806.png"
                  alt="Plin"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-orbitron text-[#94A3B8] uppercase tracking-widest">
              Escanea el QR y paga exactamente
            </p>
            <div className="bg-white rounded-2xl p-3 border-2 border-[#00F0FF]/30 glow-cyan-sm">
              <Image
                src="/qr-yape.png"
                alt="QR de pago"
                width={200}
                height={200}
                className="rounded-xl"
              />
            </div>
            <div className="font-orbitron font-black text-2xl text-[#00F0FF]">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-xs text-[#94A3B8] text-center">
              Envía exactamente este monto por Yape o Plin
            </p>
          </div>

          {/* Receipt uploader */}
          <ReceiptUploader
            onFile={setReceiptFile}
            onClear={() => setReceiptFile(null)}
          />

          {/* Submit */}
          <motion.button
            onClick={handleSubmit}
            disabled={submitting || !receiptFile}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "w-full flex items-center justify-center gap-3 rounded-2xl py-4 font-orbitron font-black text-base transition-all duration-300",
              receiptFile && !submitting
                ? "bg-[#00F0FF] text-[#0A0A0F] animate-pulse-glow hover:brightness-110"
                : "bg-[#1A1A2E] text-[#94A3B8] cursor-not-allowed"
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar comprobante
              </>
            )}
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

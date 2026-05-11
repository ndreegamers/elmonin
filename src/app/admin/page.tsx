"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Clock, Trophy, LogOut, RefreshCcw, Shield, Plus, Loader2, ChevronDown, ChevronUp, Pencil
} from "lucide-react";
import { PaymentQueue } from "@/components/admin/payment-queue";
import { RaffleForm } from "@/components/admin/raffle-form";
import { PurchaseWithDetails, Raffle } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"pending" | "raffles">("pending");
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [receiptUrls, setReceiptUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showNewRaffle, setShowNewRaffle] = useState(false);
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [purchasesRes, rafflesRes] = await Promise.all([
        fetch("/api/admin/purchases"),
        fetch("/api/raffles"),
      ]);

      const purchasesData = await purchasesRes.json();
      const rafflesData = await rafflesRes.json();

      const fetchedPurchases: PurchaseWithDetails[] = purchasesData.purchases ?? [];
      setPurchases(fetchedPurchases);
      setRaffles(rafflesData.raffles ?? []);

      // Fetch signed receipt URLs
      const urls: Record<string, string> = {};
      await Promise.all(
        fetchedPurchases.map(async (p) => {
          if (p.receipt_url) {
            const res = await fetch(`/api/admin/receipt-url?path=${encodeURIComponent(p.receipt_url)}`);
            if (res.ok) {
              const { url } = await res.json();
              urls[p.id] = url;
            }
          }
        })
      );
      setReceiptUrls(urls);
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  const pendingCount = purchases.filter((p) => p.payment_status === "pending").length;

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      <div className="w-full max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#00F0FF]" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-[#F1F5F9]">
                Admin Panel
              </h1>
              <p className="text-xs text-[#94A3B8] font-inter">Elmonin Sorteos</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="p-2 rounded-xl border border-[#2A2A3E] text-[#94A3B8] hover:text-[#00F0FF] hover:border-[#00F0FF]/40 transition-all"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#2A2A3E] text-[#94A3B8] hover:text-[#EF4444] hover:border-[#EF4444]/40 font-inter text-sm transition-all"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-[#12121A] rounded-2xl border border-[#2A2A3E]">
          <button
            onClick={() => setActiveTab("pending")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-orbitron text-sm font-bold transition-all duration-200",
              activeTab === "pending"
                ? "bg-[#1A1A2E] text-[#00F0FF] border border-[#00F0FF]/20"
                : "text-[#94A3B8] hover:text-[#F1F5F9]"
            )}
          >
            <Clock className="w-4 h-4" />
            Pagos
            {pendingCount > 0 && (
              <span className="bg-[#FF3E9A] text-white text-[10px] font-bold rounded-full px-1.5 min-w-[18px] text-center leading-5">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("raffles")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-orbitron text-sm font-bold transition-all duration-200",
              activeTab === "raffles"
                ? "bg-[#1A1A2E] text-[#00F0FF] border border-[#00F0FF]/20"
                : "text-[#94A3B8] hover:text-[#F1F5F9]"
            )}
          >
            <Trophy className="w-4 h-4" />
            Sorteos
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === "pending" && (
              <motion.div
                key="pending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <PaymentQueue
                  purchases={purchases}
                  receiptUrls={receiptUrls}
                  onRefresh={fetchData}
                />
              </motion.div>
            )}

            {activeTab === "raffles" && (
              <motion.div
                key="raffles"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-4"
              >
                {/* Existing raffles */}
                {raffles.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {raffles.map((r) => (
                      <div
                        key={r.id}
                        className="glass-card rounded-xl border border-[#2A2A3E] p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-inter font-medium text-[#F1F5F9] text-sm">{r.title}</p>
                          <p className="font-orbitron text-xs text-[#00F0FF] mt-0.5">
                            {r.code_prefix}-XXXX · {formatCurrency(r.ticket_price)}/ticket · {r.total_tickets} total
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-xs font-orbitron font-bold px-2 py-0.5 rounded-full",
                            r.status === "active"
                              ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20"
                              : "bg-[#94A3B8]/10 text-[#94A3B8] border border-[#94A3B8]/20"
                          )}>
                            {r.status}
                          </span>
                          <button
                            onClick={() => { setEditingRaffle(r); setShowNewRaffle(false); }}
                            className="p-1.5 rounded-lg border border-[#2A2A3E] text-[#94A3B8] hover:text-[#00F0FF] hover:border-[#00F0FF]/40 transition-all"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Edit raffle form */}
                {editingRaffle && (
                  <div className="glass-card rounded-xl border border-[#00F0FF]/20 overflow-hidden">
                    <div className="p-4 border-b border-[#2A2A3E] flex items-center gap-2">
                      <Pencil className="w-4 h-4 text-[#00F0FF]" />
                      <span className="font-orbitron font-bold text-sm text-[#00F0FF]">Editar sorteo</span>
                    </div>
                    <div className="px-4 pb-4 pt-4">
                      <RaffleForm
                        editRaffle={editingRaffle}
                        onCreated={fetchData}
                        onCancel={() => setEditingRaffle(null)}
                      />
                    </div>
                  </div>
                )}

                {/* New raffle form */}
                {!editingRaffle && (
                  <div className="glass-card rounded-xl border border-[#2A2A3E] overflow-hidden">
                    <button
                      onClick={() => setShowNewRaffle(!showNewRaffle)}
                      className="w-full flex items-center justify-between p-4 font-orbitron font-bold text-sm text-[#F1F5F9] hover:text-[#00F0FF] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Crear nuevo sorteo
                      </div>
                      {showNewRaffle ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {showNewRaffle && (
                      <div className="px-4 pb-4 border-t border-[#2A2A3E] pt-4">
                        <RaffleForm onCreated={fetchData} />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

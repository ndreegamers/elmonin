"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Pencil, Trophy, Calendar, Hash, Tag, Image as ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Raffle } from "@/lib/types";

interface RaffleFormProps {
  onCreated: () => void;
  editRaffle?: Raffle | null;
  onCancel?: () => void;
}

export function RaffleForm({ onCreated, editRaffle, onCancel }: RaffleFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!editRaffle;
  const [form, setForm] = useState({
    title: "",
    description: "",
    image_url: "",
    ticket_price: "",
    total_tickets: "",
    draw_date: "",
    code_prefix: "",
  });

  useEffect(() => {
    if (editRaffle) {
      setForm({
        title: editRaffle.title,
        description: editRaffle.description ?? "",
        image_url: editRaffle.image_url,
        ticket_price: String(editRaffle.ticket_price),
        total_tickets: String(editRaffle.total_tickets),
        draw_date: editRaffle.draw_date.slice(0, 16),
        code_prefix: editRaffle.code_prefix,
      });
      setImagePreview(editRaffle.image_url);
    }
  }, [editRaffle]);

  async function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }
    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al subir imagen");
        setImagePreview(null);
        return;
      }
      set("image_url", data.url);
      toast.success("Imagen subida");
    } catch {
      toast.error("Error de conexión al subir imagen");
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  }

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title || !form.image_url || !form.ticket_price || !form.total_tickets || !form.draw_date || !form.code_prefix) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    if (form.code_prefix.length < 2 || form.code_prefix.length > 3) {
      toast.error("El prefijo debe tener 2-3 letras");
      return;
    }

    if (uploadingImage) {
      toast.error("Espera a que termine de subir la imagen");
      return;
    }

    setLoading(true);
    try {
      const url = isEditMode ? `/api/raffles/${editRaffle!.id}` : "/api/raffles";
      const method = isEditMode ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ticket_price: parseFloat(form.ticket_price),
          total_tickets: parseInt(form.total_tickets, 10),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(isEditMode ? "✅ Sorteo actualizado" : "✅ Sorteo creado exitosamente");
        if (!isEditMode) {
          setForm({
            title: "",
            description: "",
            image_url: "",
            ticket_price: "",
            total_tickets: "",
            draw_date: "",
            code_prefix: "",
          });
        }
        onCreated();
        onCancel?.();
      } else {
        toast.error(data.error ?? (isEditMode ? "Error al actualizar sorteo" : "Error al crear sorteo"));
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-[#1A1A2E] border border-[#2A2A3E] rounded-xl px-4 py-3 text-[#F1F5F9] font-inter focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/30 transition-all placeholder:text-[#94A3B8]/40";

  const labelClass = "text-xs font-semibold text-[#94A3B8] uppercase tracking-widest";

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 flex flex-col gap-2">
          <label className={labelClass}>
            <Trophy className="w-3 h-3 inline mr-1" />
            Nombre del premio *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="iPhone 16 Pro Max 256GB"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2 flex flex-col gap-2">
          <label className={labelClass}>Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe el premio..."
            rows={3}
            className={inputClass + " resize-none"}
          />
        </div>

        <div className="sm:col-span-2 flex flex-col gap-2">
          <label className={labelClass}>
            <ImageIcon className="w-3 h-3 inline mr-1" />
            Imagen del premio *
          </label>

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-[#2A2A3E] bg-[#1A1A2E]">
              <div className="relative w-full aspect-[4/3]">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              {uploadingImage && (
                <div className="absolute inset-0 bg-[#0A0A0F]/70 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-[#00F0FF] animate-spin" />
                  <span className="text-[#00F0FF] text-sm font-inter">Subiendo...</span>
                </div>
              )}
              {!uploadingImage && (
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); set("image_url", ""); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute top-2 right-2 bg-[#0A0A0F]/80 text-[#94A3B8] hover:text-[#EF4444] rounded-full p-1.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#2A2A3E] hover:border-[#00F0FF]/40 bg-[#1A1A2E] rounded-xl py-8 transition-all duration-200 text-[#94A3B8] hover:text-[#00F0FF]"
            >
              <Upload className="w-8 h-8" />
              <span className="text-sm font-inter">Haz clic para seleccionar imagen</span>
              <span className="text-xs text-[#94A3B8]/50">PNG, JPG, WEBP</span>
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
            className="hidden"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            <Tag className="w-3 h-3 inline mr-1" />
            Precio por ticket (S/.) *
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={form.ticket_price}
            onChange={(e) => set("ticket_price", e.target.value)}
            placeholder="5.00"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            <Hash className="w-3 h-3 inline mr-1" />
            Total de tickets *
          </label>
          <input
            type="number"
            min="1"
            value={form.total_tickets}
            onChange={(e) => set("total_tickets", e.target.value)}
            placeholder="500"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            <Calendar className="w-3 h-3 inline mr-1" />
            Fecha del sorteo *
          </label>
          <input
            type="datetime-local"
            value={form.draw_date}
            onChange={(e) => set("draw_date", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            Prefijo de tickets (2-3 letras){!isEditMode && " *"}
          </label>
          <input
            type="text"
            maxLength={3}
            value={form.code_prefix}
            onChange={(e) => set("code_prefix", e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
            placeholder="ELM"
            disabled={isEditMode}
            className={inputClass + " uppercase font-orbitron tracking-widest" + (isEditMode ? " opacity-50 cursor-not-allowed" : "")}
          />
          {form.code_prefix && !isEditMode && (
            <p className="text-xs text-[#94A3B8] font-orbitron">
              Preview: {form.code_prefix}-0001-X7K
            </p>
          )}
          {isEditMode && (
            <p className="text-xs text-[#94A3B8]">El prefijo no se puede cambiar para proteger tickets existentes.</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="w-full flex items-center justify-center gap-3 bg-[#00F0FF] text-[#0A0A0F] font-extrabold text-lg rounded-2xl py-4 transition-all hover:brightness-110 disabled:opacity-50 glow-cyan"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isEditMode ? (
            <Pencil className="w-5 h-5" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          {loading
            ? isEditMode ? "Guardando..." : "Creando..."
            : isEditMode ? "Guardar Cambios" : "Crear Sorteo"
          }
        </button>
        {isEditMode && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full flex items-center justify-center gap-2 border border-[#2A2A3E] text-[#94A3B8] font-orbitron text-sm rounded-2xl py-3 transition-all hover:border-[#94A3B8]/40 hover:text-[#F1F5F9]"
          >
            Cancelar
          </button>
        )}
      </div>
    </motion.form>
  );
}

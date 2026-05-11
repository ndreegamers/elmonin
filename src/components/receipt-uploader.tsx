"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { compressImage } from "@/lib/utils";
import { MAX_RECEIPT_SIZE, TARGET_RECEIPT_WIDTH, TARGET_RECEIPT_QUALITY } from "@/lib/constants";

interface ReceiptUploaderProps {
  onFile: (file: File) => void;
  onClear: () => void;
}

export function ReceiptUploader({ onFile, onClear }: ReceiptUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function processFile(rawFile: File) {
    setCompressing(true);
    try {
      let finalFile = rawFile;

      // Compress if too large
      if (rawFile.size > MAX_RECEIPT_SIZE && rawFile.type.startsWith("image/")) {
        const blob = await compressImage(rawFile, TARGET_RECEIPT_WIDTH, TARGET_RECEIPT_QUALITY);
        finalFile = new File([blob], rawFile.name.replace(/\.[^.]+$/, ".jpg"), {
          type: "image/jpeg",
        });
      }

      const url = URL.createObjectURL(finalFile);
      setPreview(url);
      setFileName(finalFile.name);
      onFile(finalFile);
    } finally {
      setCompressing(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) processFile(file);
  }

  function handleClear() {
    setPreview(null);
    setFileName(null);
    onClear();
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-orbitron text-[#94A3B8] uppercase tracking-widest">
        Comprobante de pago
      </label>

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-xl overflow-hidden border border-[#22C55E]/40 bg-[#22C55E]/5"
          >
            <img
              src={preview}
              alt="Comprobante"
              className="w-full max-h-60 object-contain"
            />
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[#22C55E] text-white text-xs rounded-full px-2.5 py-1 font-inter">
              <CheckCircle2 className="w-3 h-3" />
              Subido
            </div>
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 bg-[#0A0A0F]/80 text-[#94A3B8] hover:text-[#EF4444] rounded-full p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-4 transition-all duration-200",
              isDragging
                ? "border-[#00F0FF] bg-[#00F0FF]/5"
                : "border-[#2A2A3E] bg-[#12121A]"
            )}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              {compressing ? (
                <>
                  <ImageIcon className="w-8 h-8 text-[#00F0FF] animate-pulse" />
                  <p className="text-sm text-[#94A3B8]">Procesando imagen...</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-[#94A3B8]" />
                  <p className="text-sm text-[#94A3B8]">
                    Arrastra tu captura aquí o elige una opción
                  </p>
                  <p className="text-xs text-[#94A3B8]/50">PNG, JPG hasta 6MB</p>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 bg-[#1A1A2E] border border-[#2A2A3E] hover:border-[#00F0FF]/40 text-[#94A3B8] hover:text-[#00F0FF] rounded-xl py-2.5 text-sm font-inter transition-all duration-200"
            >
              <Upload className="w-4 h-4" />
              Seleccionar imagen
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

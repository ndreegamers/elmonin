import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Elmonin Sorteos | Gana Premios Gaming",
  description:
    "Participa en los sorteos de Elmonin. Compra tus tickets y gana premios gaming exclusivos.",
  openGraph: {
    title: "Elmonin Sorteos",
    description: "Participa y gana premios gaming exclusivos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0A0A0F] text-[#F1F5F9]">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Outfit, Montserrat } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { ProductProvider } from "@/context/ProductContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://koffierakjat.com"),
  manifest: "/manifest.json",
  title: "KOFFIE RAKJAT | Kualitas Kopi Specialty Tanpa Gengsi",
  description: "Beli biji kopi roasted beans specialty berkualitas langsung dari Koffie Rakjat Semarang. Menyajikan cita rasa kopi Nusantara dengan jujur, merakyat, dan autentik.",
  keywords: ["koffie rakjat", "kopi semarang", "specialty coffee semarang", "roasted beans indonesia", "kopi filter", "kopi espresso", "katalog kopi"],
  authors: [{ name: "Koffie Rakjat" }],
  openGraph: {
    title: "KOFFIE RAKJAT | Kualitas Kopi Specialty Tanpa Gengsi",
    description: "Kopi terbaik Nusantara diseduh dengan kesederhanaan untuk semua kalangan.",
    url: "https://koffierakjat.com",
    siteName: "Koffie Rakjat",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Koffie Rakjat Logo",
      },
    ],
    locale: "id_ID",
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
      lang="id"
      className={`${outfit.variable} ${montserrat.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-brand-dark text-brand-cream selection:bg-brand-yellow selection:text-brand-dark">
        <LanguageProvider>
          <ProductProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </ProductProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

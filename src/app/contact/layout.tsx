import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Hubungi & Temui Kami | KOFFIE RAKJAT",
  description: "Hubungi admin Koffie Rakjat Semarang via WhatsApp atau kunjungi lokasi roasting house kami untuk diskusi kopi dan pemesanan custom.",
  keywords: ["kontak koffie rakjat", "roasting house semarang", "alamat koffie rakjat", "whatsapp koffie rakjat", "beli kopi semarang"],
  openGraph: {
    title: "Hubungi & Temui Kami | KOFFIE RAKJAT",
    description: "Hubungi admin Koffie Rakjat Semarang via WhatsApp atau kunjungi lokasi roasting house kami.",
    url: "https://koffierakjat.com/contact",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Koffie Rakjat Logo",
      },
    ],
  }
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

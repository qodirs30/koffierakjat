import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Katalog Roasted Beans Specialty | KOFFIE RAKJAT",
  description: "Temukan koleksi biji kopi roasted beans specialty terbaik (Filter & Espresso) dari Koffie Rakjat Semarang. Proses seleksi ketat untuk rasa autentik.",
  keywords: ["katalog kopi", "roasted beans semarang", "biji kopi specialty", "kopi arabika", "kopi robusta", "kopi filter", "kopi espresso"],
  openGraph: {
    title: "Katalog Roasted Beans Specialty | KOFFIE RAKJAT",
    description: "Temukan koleksi biji kopi roasted beans specialty terbaik (Filter & Espresso) dari Koffie Rakjat Semarang.",
    url: "https://koffierakjat.com/catalog",
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

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

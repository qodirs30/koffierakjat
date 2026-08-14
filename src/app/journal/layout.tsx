import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Jurnal Kopi & Tips Menyeduh | KOFFIE RAKJAT",
  description: "Dapatkan tips menyeduh kopi filter V60, panduan espresso, informasi asal-usul biji kopi Nusantara, dan catatan perjalanan rasa kami.",
  keywords: ["jurnal kopi", "tips menyeduh kopi", "belajar kopi", "panduan v60", "edukasi kopi", "catatan rasa kopi"],
  openGraph: {
    title: "Jurnal Kopi & Tips Menyeduh | KOFFIE RAKJAT",
    description: "Dapatkan tips menyeduh kopi filter V60, panduan espresso, informasi asal-usul biji kopi Nusantara.",
    url: "https://koffierakjat.com/journal",
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

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

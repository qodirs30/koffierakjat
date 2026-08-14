import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Panel Admin CMS | KOFFIE RAKJAT",
  robots: {
    index: false,
    follow: false,
  }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

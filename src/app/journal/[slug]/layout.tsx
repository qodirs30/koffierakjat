import { Metadata } from 'next';
import { blogPosts } from '@/data/blog';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = blogPosts.find((p) => p.slug === resolvedParams.slug);
  
  if (!post) {
    return {
      title: "Artikel Tidak Ditemukan | KOFFIE RAKJAT",
    };
  }

  // Support both ID and EN titles in dynamic SEO
  const title = `${post.title.id} | KOFFIE RAKJAT`;
  const description = post.excerpt?.id || "Jurnal Edukasi Kopi dari Koffie Rakjat Semarang.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://koffierakjat.com/journal/${resolvedParams.slug}`,
      images: [
        {
          url: post.imageUrl,
          alt: post.title.id,
        }
      ],
    }
  };
}

export default function BlogPostLayout({ children }: Props) {
  return <>{children}</>;
}

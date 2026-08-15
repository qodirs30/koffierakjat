import { Metadata } from 'next';
import { blogPosts, BlogPost } from '@/data/blog';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateStaticParams() {
  try {
    const querySnapshot = await getDocs(collection(db, 'articles'));
    const list: any[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data());
    });
    if (list.length > 0) {
      return list.map((post) => ({
        slug: post.slug,
      }));
    }
  } catch (error) {
    console.warn("Build-time generateStaticParams failed, falling back to static posts:", error);
  }
  
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  let post: BlogPost | undefined;

  try {
    const docRef = doc(db, 'articles', resolvedParams.slug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      post = docSnap.data() as BlogPost;
    }
  } catch (error) {
    console.warn("Build-time generateMetadata failed, trying static fallback:", error);
  }

  if (!post) {
    post = blogPosts.find((p) => p.slug === resolvedParams.slug);
  }
  
  if (!post) {
    return {
      title: "Artikel Tidak Ditemukan | KOFFIE RAKJAT",
    };
  }

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

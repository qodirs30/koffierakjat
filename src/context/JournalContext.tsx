"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { blogPosts, BlogPost } from '@/data/blog';

interface JournalContextType {
  articles: BlogPost[];
  loading: boolean;
  addArticle: (article: Omit<BlogPost, 'slug'> & { slug?: string }) => Promise<void>;
  updateArticle: (slug: string, article: Partial<BlogPost>) => Promise<void>;
  deleteArticle: (slug: string) => Promise<void>;
  resetDefaultArticles: () => Promise<void>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'articles'), (snapshot) => {
      const list: BlogPost[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as BlogPost);
      });
      
      if (snapshot.empty) {
        // Fallback to static articles if Firestore is completely empty
        setArticles(blogPosts);
      } else {
        // Sort articles by date descending
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setArticles(list);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore onSnapshot error for articles:", error);
      // Fallback
      setArticles(blogPosts);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const addArticle = async (article: Omit<BlogPost, 'slug'> & { slug?: string }) => {
    const slug = article.slug || article.title.id.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special characters
      .trim()
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/-+/g, '-'); // collapse multiple hyphens
    const finalArticle = { ...article, slug };
    const docRef = doc(db, 'articles', slug);
    await setDoc(docRef, finalArticle);
  };

  const updateArticle = async (slug: string, article: Partial<BlogPost>) => {
    const docRef = doc(db, 'articles', slug);
    await setDoc(docRef, article, { merge: true });
  };

  const deleteArticle = async (slug: string) => {
    const docRef = doc(db, 'articles', slug);
    await deleteDoc(docRef);
  };

  const resetDefaultArticles = async () => {
    for (const post of blogPosts) {
      await setDoc(doc(db, 'articles', post.slug), post);
    }
  };

  return (
    <JournalContext.Provider value={{ articles, loading, addArticle, updateArticle, deleteArticle, resetDefaultArticles }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) throw new Error('useJournal must be used within JournalProvider');
  return context;
};

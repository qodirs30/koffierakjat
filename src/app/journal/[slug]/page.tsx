"use client";

import React, { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useJournal } from '@/context/JournalContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

// Custom Markdown to JSX renderer
const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  let inList = false;
  const listItems: string[] = [];
  const renderedElements: React.JSX.Element[] = [];

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${key}`} className="list-disc pl-6 space-y-2 text-brand-cream/80 my-4 text-sm font-light">
          {listItems.map((item, i) => (
            <li key={i}>{parseInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      listItems.length = 0;
    }
  };

  const parseInlineMarkdown = (str: string) => {
    // Basic bold **bold** parsing
    const parts = str.split('**');
    const processed: (string | React.JSX.Element)[] = [];
    parts.forEach((part, index) => {
      if (index % 2 === 1) {
        processed.push(<strong key={index} className="font-extrabold text-brand-yellow">{part}</strong>);
      } else {
        // Also parse italics *italics*
        const italicParts = part.split('*');
        italicParts.forEach((iPart, iIndex) => {
          if (iIndex % 2 === 1) {
            processed.push(<em key={`em-${index}-${iIndex}`} className="italic text-brand-cream">{iPart}</em>);
          } else {
            processed.push(iPart);
          }
        });
      }
    });
    return processed;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith('###')) {
      flushList(idx);
      renderedElements.push(
        <h3 key={idx} className="font-outfit text-lg font-bold text-brand-yellow mt-8 mb-4">
          {trimmed.replace('###', '').trim()}
        </h3>
      );
    } else if (trimmed.startsWith('##')) {
      flushList(idx);
      renderedElements.push(
        <h2 key={idx} className="font-outfit text-xl font-bold text-brand-yellow mt-8 mb-4 border-b border-white/5 pb-2">
          {trimmed.replace('##', '').trim()}
        </h2>
      );
    }
    // Bullet list items
    else if (trimmed.startsWith('*')) {
      inList = true;
      listItems.push(trimmed.replace('*', '').trim());
    } else if (trimmed.startsWith('1.') || trimmed.startsWith('2.') || trimmed.startsWith('3.') || trimmed.startsWith('4.') || trimmed.startsWith('5.')) {
      flushList(idx);
      renderedElements.push(
        <div key={idx} className="flex gap-2 text-sm font-light text-brand-cream/80 my-2">
          <span className="font-bold text-brand-yellow">{trimmed.split('.')[0]}.</span>
          <span>{parseInlineMarkdown(trimmed.substring(trimmed.indexOf('.') + 1).trim())}</span>
        </div>
      );
    }
    // Empty line
    else if (trimmed === '') {
      flushList(idx);
    }
    // Standard paragraph
    else {
      flushList(idx);
      renderedElements.push(
        <p key={idx} className="text-brand-cream/80 text-sm sm:text-base font-light leading-relaxed my-4">
          {parseInlineMarkdown(trimmed)}
        </p>
      );
    }
  });

  // Flush remaining items at the end
  flushList(lines.length);

  return renderedElements;
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostDetail({ params }: PageProps) {
  const { t, language } = useLanguage();
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const { articles, loading } = useJournal();

  const post = articles.find((p) => p.slug === slug);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-brand-dark justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-yellow"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen bg-brand-dark justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center py-32">
          <h1 className="font-cormorant text-3xl font-bold text-white">Artikel Tidak Ditemukan</h1>
          <Link href="/journal" className="text-brand-yellow mt-4 hover:underline">
            {t.backToJournal}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-dark overflow-x-hidden">
      <Navbar />
      <CartDrawer />

      <article className="pt-32 pb-16 sm:pt-40 sm:pb-24 flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          
          {/* Back button */}
          <div className="mb-8">
            <Link
              href="/journal"
              className="inline-flex items-center gap-2 text-brand-cream/60 hover:text-brand-yellow text-xs font-bold transition-colors duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              <span>{t.backToJournal}</span>
            </Link>
          </div>

          {/* Header Metadata */}
          <div className="space-y-4 mb-8 pb-8 border-b border-white/5">
            <div className="flex items-center gap-3 text-xs text-brand-cream/50">
              <span>{post.date}</span>
              <span>•</span>
              <span className="text-brand-yellow font-medium">
                {language === 'id' ? post.readTime.id : post.readTime.en}
              </span>
            </div>
            
            <h1 className="font-cormorant text-3xl sm:text-5xl font-bold text-white leading-tight">
              {language === 'id' ? post.title.id : post.title.en}
            </h1>
          </div>

          {/* Main Visual Photo */}
          <div className="relative h-64 sm:h-96 rounded-2xl bg-brand-dark-accent border border-white/5 mb-10 overflow-hidden">
            <Image
              src={post.imageUrl}
              alt={language === 'id' ? post.title.id : post.title.en}
              fill
              className="object-cover"
              sizes="(max-w-7xl) 100vw, 100vw"
              priority
            />
            {/* Subtle overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent" />
          </div>

          {/* Body Content */}
          <div className="prose prose-invert max-w-none">
            {renderMarkdown(language === 'id' ? post.content.id : post.content.en)}
          </div>

        </div>
      </article>

      <Footer />
    </div>
  );
}

"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useJournal } from '@/context/JournalContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export default function JournalPage() {
  const { t, language } = useLanguage();
  const { articles, loading } = useJournal();

  return (
    <div className="flex flex-col min-h-screen bg-brand-dark overflow-x-hidden">
      <Navbar />
      <CartDrawer />

      {/* Journal Header */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 border-b border-white/5 overflow-hidden">
        {/* Glow Backgrounds */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <span className="text-xs font-bold text-brand-yellow tracking-widest uppercase block animate-slide-up">
            READ & BREW
          </span>
          <h1 className="font-cormorant text-3xl sm:text-5xl font-extrabold text-white leading-tight animate-slide-up">
            {t.journalTitle}
          </h1>
          <p className="text-brand-cream/65 text-sm sm:text-base font-light max-w-2xl mx-auto leading-relaxed animate-slide-up">
            {t.journalSubtitle}
          </p>
        </div>
      </section>

      {/* Blog List Grid */}
      <section className="py-16 sm:py-24 flex-1">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-yellow"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <p className="text-brand-cream/60 text-sm font-light">
                {language === 'id' ? 'Belum ada artikel jurnal.' : 'No journal articles yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.map((post) => (
                <div key={post.slug} className="glass-card flex flex-col h-full rounded-2xl overflow-hidden group">
                  {/* Visual Thumbnail */}
                  <div className="relative h-48 bg-brand-dark-accent flex items-center justify-between overflow-hidden">
                    <div className="absolute inset-0 bg-radial from-brand-red/5 to-transparent pointer-events-none" />
                    
                    {/* Article Photo */}
                    <div className="absolute inset-0 w-full h-full">
                      <Image
                        src={post.imageUrl}
                        alt={language === 'id' ? post.title.id : post.title.en}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-w-7xl) 50vw, 100vw"
                      />
                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent" />
                    </div>

                    {/* Metadata labels */}
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <span className="bg-brand-dark/80 backdrop-blur-md text-[10px] text-brand-cream/80 px-2.5 py-1 rounded-full border border-white/5">
                        {post.date}
                      </span>
                      <span className="bg-brand-dark/80 backdrop-blur-md text-[10px] text-brand-yellow px-2.5 py-1 rounded-full border border-white/5 font-semibold">
                        {language === 'id' ? post.readTime.id : post.readTime.en}
                      </span>
                    </div>
                  </div>

                  {/* Content info */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h2 className="font-cormorant text-xl font-bold text-brand-cream group-hover:text-brand-yellow transition-colors duration-200 line-clamp-2 leading-snug">
                        {language === 'id' ? post.title.id : post.title.en}
                      </h2>
                      <p className="text-xs text-brand-cream/70 font-light leading-relaxed line-clamp-3">
                        {language === 'id' ? post.excerpt.id : post.excerpt.en}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-white/5 mt-6 flex justify-start">
                      <Link
                        href={`/journal/${post.slug}`}
                        className="inline-flex items-center gap-1 text-brand-yellow hover:text-brand-yellow-hover font-bold text-xs transition-colors duration-150 group"
                      >
                        <span>{t.readMore}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
}

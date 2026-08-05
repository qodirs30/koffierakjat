"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useProducts } from '@/context/ProductContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const { t } = useLanguage();
  const { products } = useProducts();

  // Filter limited and pre-order products for the Homepage Quick Catalog
  let featuredProducts = products.filter(
    (product) => product.isLimited || product.isPreOrder
  );

  // Fallback to first 3 products if none are limited or pre-order
  if (featuredProducts.length === 0) {
    featuredProducts = products.slice(0, 3);
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-dark overflow-x-hidden">
      <Navbar />
      <CartDrawer />

      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-between py-24 md:py-32 overflow-hidden border-b border-white/5 bg-black">
        {/* Background Image with 35% opacity */}
        <div className="absolute inset-0 w-full h-full opacity-35 pointer-events-none select-none">
          <Image
            src="/images/hero-bg.jpg"
            alt="Koffie Rakjat Sunset Backdrop"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] bg-brand-yellow/5 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left animate-slide-up">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-yellow/15 border border-brand-yellow/20 text-brand-yellow text-xs font-bold uppercase tracking-wider rounded-full">
                <span>EST. MAY 1, 2024</span>
              </span>
              
              <h1 className="font-cormorant text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
                {t.heroTitle}
              </h1>
              
              <p className="text-brand-cream/80 text-base sm:text-lg font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                {t.heroSubtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <a
                  href="#featured-catalog"
                  className="w-full sm:w-auto bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark font-extrabold px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-brand-yellow/10 text-center cursor-pointer"
                >
                  {t.heroCta}
                </a>
                <a
                  href="#about"
                  className="w-full sm:w-auto bg-brand-dark-accent hover:bg-white/5 text-brand-cream border border-white/10 hover:border-brand-cream/30 font-bold px-8 py-4 rounded-full transition-all duration-200 text-center"
                >
                  {t.heroAboutCta}
                </a>
              </div>
            </div>

            {/* Right Visual Image Mockup */}
            <div className="lg:col-span-5 relative flex justify-center items-center animate-fade-in">
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-3xl overflow-hidden glass-container border border-white/10 shadow-2xl flex items-center justify-between">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-red/10 via-transparent to-brand-yellow/10 pointer-events-none" />
                
                {/* Logo rotating slowly in background or centerpiece */}
                <div className="mx-auto text-center flex flex-col items-center p-8">
                  <Image
                    src="/logo.png"
                    alt="Koffie Rakjat Logo"
                    width={180}
                    height={180}
                    className="rounded-full border-4 border-brand-yellow/30 bg-brand-dark p-2 shadow-2xl animate-pulse"
                    priority
                  />
                  <div className="mt-6">
                    <span className="font-cormorant text-2xl font-bold tracking-wider text-brand-cream block">
                      KOFFIE RAKJAT
                    </span>
                    <span className="text-xs tracking-widest text-brand-yellow font-bold uppercase mt-1 block">
                      Specialty Coffee
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. About Us Section (Storytelling) */}
      <section id="about" className="py-24 bg-brand-dark-card border-b border-white/5 relative">
        <div className="absolute inset-0 bg-radial from-brand-red/5 to-transparent pointer-events-none" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-brand-yellow tracking-widest uppercase block animate-slide-up">
              OUR JOURNEY
            </span>
            <h2 className="font-outfit text-3xl sm:text-4xl font-extrabold text-white text-underline-gradient">
              {t.aboutTitle}
            </h2>
            <p className="text-brand-cream/60 text-sm italic font-light">
              "{t.aboutSubtitle}"
            </p>
          </div>

          {/* Story Paragraphs Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left max-w-5xl mx-auto">
            
            {/* Left Column: Establishment Card */}
            <div className="lg:col-span-5 relative group w-full max-w-sm mx-auto lg:mx-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-red/10 to-brand-yellow/10 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative glass-card p-8 rounded-2xl border border-white/10 text-center overflow-hidden space-y-4">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-yellow/10 rounded-full blur-xl pointer-events-none" />
                
                <span className="text-[10px] font-bold text-brand-yellow tracking-widest uppercase block">
                  ESTABLISHED IN
                </span>
                
                <div className="font-cormorant text-6xl font-bold text-white tracking-tighter">
                  2024
                </div>
                
                <div className="border-t border-white/10 pt-4 mt-4">
                  <span className="font-cormorant text-xs font-semibold tracking-wider text-brand-cream/65 block uppercase">
                    Semarang, Indonesia
                  </span>
                  <span className="font-cormorant text-[11px] font-medium text-brand-yellow block mt-1 italic leading-relaxed">
                    "{t.heroTitle}"
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Paragraph Content */}
            <div className="lg:col-span-7 space-y-5">
              {t.aboutStoryParagraphs.map((paragraph, index) => (
                <p key={index} className="text-brand-cream/85 text-sm sm:text-base font-light leading-relaxed hover:text-white transition-colors duration-200">
                  {paragraph}
                </p>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 3. Quick Catalog Section (Featured Coffee) */}
      <section id="featured-catalog" className="py-24 relative scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-white/5 pb-6">
            <div className="space-y-3">
              <span className="text-xs font-bold text-brand-yellow tracking-widest uppercase block">
                SPECIAL SELECTION
              </span>
              <h2 className="font-outfit text-3xl font-extrabold text-white">
                {t.quickCatalogTitle}
              </h2>
              <p className="text-brand-cream/60 text-sm font-light">
                {t.quickCatalogSubtitle}
              </p>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Center View All Products CTA (Relocated below grid, right above Testimonials) */}
          <div className="mt-16 text-center">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark font-extrabold px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-brand-yellow/10 group cursor-pointer"
            >
              <span>{t.viewAllProducts}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>



      <Footer />
    </div>
  );
}

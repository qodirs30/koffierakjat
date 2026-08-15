"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { cartCount, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t.navHome },
    { href: '/catalog', label: t.navCatalog },
    { href: '/journal', label: t.navJournal },
    { href: '/contact', label: t.navContact },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="glass-nav fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <Image
                  src="/logo.png"
                  alt="Koffie Rakjat Logo"
                  width={48}
                  height={48}
                  className="rounded-full border border-brand-yellow/30 bg-brand-dark transition-all duration-300 group-hover:scale-105 group-hover:border-brand-yellow"
                  priority
                />
                <span className="font-outfit text-base sm:text-xl font-bold tracking-wider text-brand-cream transition-colors duration-200 group-hover:text-brand-yellow hidden min-[360px]:inline">
                  KOFFIE RAKJAT
                </span>
              </Link>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-outfit text-sm font-medium tracking-wide transition-all duration-200 hover:text-brand-yellow ${
                    isActive(link.href)
                      ? 'text-brand-yellow text-underline-gradient'
                      : 'text-brand-cream/80'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Action buttons (Language, Cart, Admin, Mobile menu) */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Language Switcher */}
              <div className="flex items-center bg-brand-dark-card border border-white/5 rounded-full px-0.5 py-0.5 text-[10px] sm:text-xs font-semibold">
                <button
                  onClick={() => setLanguage('id')}
                  className={`px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    language === 'id'
                      ? 'bg-brand-yellow text-brand-dark font-bold'
                      : 'text-brand-cream/60 hover:text-brand-cream'
                  }`}
                >
                  ID
                </button>
                <span className="text-white/10 px-0.5">|</span>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    language === 'en'
                      ? 'bg-brand-yellow text-brand-dark font-bold'
                      : 'text-brand-cream/60 hover:text-brand-cream'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Cart Trigger */}
              <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 sm:p-2.5 bg-brand-dark-card border border-white/5 hover:border-brand-yellow/30 rounded-full transition-all duration-200 group flex items-center justify-center cursor-pointer"
                aria-label="Open Cart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.0"
                  stroke="currentColor"
                  className="w-4 h-4 text-brand-cream transition-colors duration-200 group-hover:text-brand-yellow"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 sm:h-5 w-4 sm:w-5 items-center justify-between bg-brand-red text-[8px] sm:text-[10px] font-bold text-white rounded-full ring-2 ring-brand-dark">
                    <span className="w-full text-center">{cartCount}</span>
                  </span>
                )}
              </button>

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 sm:p-2.5 text-brand-cream/80 hover:text-brand-cream cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.0" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.0" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-brand-dark-card border-b border-white/5 ${
            mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive(link.href)
                    ? 'bg-brand-dark text-brand-yellow font-bold'
                    : 'text-brand-cream/80 hover:bg-brand-dark-accent hover:text-brand-cream'
                }`}
              >
                {link.label}
              </Link>
            ))}
            

          </div>
        </div>
      </nav>
    </>
  );
};
export default Navbar;

"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useProducts } from '@/context/ProductContext';
import { useJournal } from '@/context/JournalContext';
import { useLanguage } from '@/context/LanguageContext';
import { Product } from '@/data/products';
import { BlogPost } from '@/data/blog';
import Image from 'next/image';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { storage, auth } from '@/lib/firebase';

export default function AdminPage() {
  const { products, addProduct, updateProduct, deleteProduct, resetCatalog } = useProducts();
  const { articles, addArticle, updateArticle, deleteArticle, resetDefaultArticles } = useJournal();
  const { language, t } = useLanguage();
  
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tabs switcher state
  const [activeTab, setActiveTab] = useState<'products' | 'journal'>('products');

  // Modal / Form state (Products)
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Modal / Form state (Journal Articles)
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<BlogPost | null>(null);

  // Form fields (Articles)
  const [artTitleId, setArtTitleId] = useState('');
  const [artTitleEn, setArtTitleEn] = useState('');
  const [artExcerptId, setArtExcerptId] = useState('');
  const [artExcerptEn, setArtExcerptEn] = useState('');
  const [artContentId, setArtContentId] = useState('');
  const [artContentEn, setArtContentEn] = useState('');
  const [artDate, setArtDate] = useState('');
  const [artReadTimeId, setArtReadTimeId] = useState('');
  const [artReadTimeEn, setArtReadTimeEn] = useState('');
  const [artImageUrl, setArtImageUrl] = useState('');
  const [isArtUploading, setIsArtUploading] = useState(false);

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      setMounted(true);
    });
    return () => unsubscribe();
  }, []);

  // Article Action Handlers
  const openAddArticleModal = () => {
    setEditingArticle(null);
    setArtTitleId('');
    setArtTitleEn('');
    setArtExcerptId('');
    setArtExcerptEn('');
    setArtContentId('');
    setArtContentEn('');
    setArtDate(new Date().toISOString().split('T')[0]);
    setArtReadTimeId('3 menit baca');
    setArtReadTimeEn('3 min read');
    setArtImageUrl('');
    setIsJournalOpen(true);
  };

  const openEditArticleModal = (article: BlogPost) => {
    setEditingArticle(article);
    setArtTitleId(article.title.id);
    setArtTitleEn(article.title.en);
    setArtExcerptId(article.excerpt.id);
    setArtExcerptEn(article.excerpt.en);
    setArtContentId(article.content.id);
    setArtContentEn(article.content.en);
    setArtDate(article.date);
    setArtReadTimeId(article.readTime.id);
    setArtReadTimeEn(article.readTime.en);
    setArtImageUrl(article.imageUrl);
    setIsJournalOpen(true);
  };

  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const articleData = {
      title: {
        id: artTitleId.trim(),
        en: artTitleEn.trim() || artTitleId.trim()
      },
      excerpt: {
        id: artExcerptId.trim(),
        en: artExcerptEn.trim() || artExcerptId.trim()
      },
      content: {
        id: artContentId.trim(),
        en: artContentEn.trim() || artContentId.trim()
      },
      date: artDate,
      readTime: {
        id: artReadTimeId.trim(),
        en: artReadTimeEn.trim()
      },
      imageUrl: artImageUrl.trim() || '/images/coffee-pack-filter.jpg'
    };

    try {
      if (editingArticle) {
        await updateArticle(editingArticle.slug, articleData);
      } else {
        await addArticle(articleData);
      }
      setIsJournalOpen(false);
    } catch (error) {
      console.error("Gagal menyimpan artikel:", error);
      alert("Gagal menyimpan artikel.");
    }
  };

  const handleArticleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsArtUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(async (blob) => {
          if (!blob) {
            setIsArtUploading(false);
            return;
          }
          try {
            const storageRef = ref(storage, `articles/${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}.jpg`);
            const snapshot = await uploadBytes(storageRef, blob);
            const downloadUrl = await getDownloadURL(snapshot.ref);
            setArtImageUrl(downloadUrl);
          } catch (error) {
            console.error("Gagal mengunggah gambar artikel ke Firebase:", error);
            alert("Gagal mengunggah gambar ke Firebase Storage.");
          } finally {
            setIsArtUploading(false);
          }
        }, 'image/jpeg', 0.8);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleArticleDelete = async (slug: string) => {
    if (confirm(language === 'id' ? 'Apakah Anda yakin ingin menghapus artikel ini?' : 'Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(slug);
      } catch (error) {
        console.error("Gagal menghapus artikel:", error);
        alert("Gagal menghapus artikel.");
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (err: any) {
      console.error("Gagal login:", err);
      setLoginError(
        language === 'id' 
          ? 'Email atau password salah. Pastikan Anda sudah membuat akun di Firebase Console.' 
          : 'Invalid email or password. Make sure the user is created in Firebase Console.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Gagal logout:", err);
    }
  };
  
  // Form fields
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [category, setCategory] = useState<'filter' | 'espresso'>('filter');
  const [roastLevel, setRoastLevel] = useState<'Light' | 'Medium' | 'Dark'>('Medium');
  const [tasteNotes, setTasteNotes] = useState('');
  const [descriptionId, setDescriptionId] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [price100g, setPrice100g] = useState<number>(0);
  const [price200g, setPrice200g] = useState<number>(0);
  const [price1kg, setPrice1kg] = useState<number>(0);
  const [isLimited, setIsLimited] = useState(false);
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setOrigin('');
    setCategory('filter');
    setRoastLevel('Medium');
    setTasteNotes('');
    setDescriptionId('');
    setDescriptionEn('');
    setPrice100g(45000);
    setPrice200g(85000);
    setPrice1kg(350000);
    setIsLimited(false);
    setIsPreOrder(false);
    setImageUrl('');
    setIsOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setOrigin(product.origin);
    setCategory(product.category);
    setRoastLevel(product.roastLevel);
    setTasteNotes(product.tasteNotes.join(', '));
    setDescriptionId(product.description.id);
    setDescriptionEn(product.description.en);
    setPrice100g(product.prices['100g']);
    setPrice200g(product.prices['200g']);
    setPrice1kg(product.prices['1kg']);
    setIsLimited(product.isLimited || false);
    setIsPreOrder(product.isPreOrder || false);
    setImageUrl(product.imageUrl);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Default image if not set
    const finalImageUrl = imageUrl.trim() || 
      (category === 'espresso' 
        ? '/images/coffee-pack-espresso.jpg' 
        : '/images/coffee-pack-filter.jpg');

    const productData = {
      name: name.trim(),
      origin: origin.trim(),
      category,
      roastLevel,
      tasteNotes: tasteNotes.split(',').map(note => note.trim()).filter(note => note.length > 0),
      description: {
        id: descriptionId.trim(),
        en: descriptionEn.trim() || descriptionId.trim()
      },
      prices: {
        '100g': Number(price100g),
        '200g': Number(price200g),
        '1kg': Number(price1kg)
      },
      isLimited,
      isPreOrder,
      imageUrl: finalImageUrl
    };

    if (editingProduct) {
      updateProduct({
        ...productData,
        id: editingProduct.id
      });
    } else {
      addProduct(productData);
    }

    setIsOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(async (blob) => {
          if (!blob) {
            setIsUploading(false);
            return;
          }
          try {
            const storageRef = ref(storage, `products/${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}.jpg`);
            const snapshot = await uploadBytes(storageRef, blob);
            const downloadUrl = await getDownloadURL(snapshot.ref);
            setImageUrl(downloadUrl);
          } catch (error) {
            console.error("Gagal mengunggah gambar ke Firebase:", error);
            alert("Gagal mengunggah gambar ke Firebase Storage. Harap pastikan aturan Security Rules Storage telah diset ke public write.");
          } finally {
            setIsUploading(false);
          }
        }, 'image/jpeg', 0.75);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id: string) => {
    if (confirm(language === 'id' ? 'Apakah Anda yakin ingin menghapus produk ini?' : 'Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  if (authLoading || !mounted) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-yellow"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-brand-dark pt-32 pb-12 flex items-center justify-center min-h-[85vh]">
          <div className="w-full max-w-md mx-auto px-4 animate-fade-in">
            <div className="glass-card p-8 rounded-2xl border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-radial from-brand-yellow/5 to-transparent pointer-events-none" />
              
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-3">
                  <div className="relative w-14 h-14 animate-pulse-subtle">
                    <Image
                      src="/logo.png"
                      alt="Koffie Rakjat Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-brand-yellow tracking-widest uppercase block">
                  CMS AUTHENTICATION
                </span>
                <h2 className="font-outfit text-2xl font-extrabold text-white">
                  {language === 'id' ? 'Masuk Panel Admin' : 'Admin Panel Login'}
                </h2>
                <p className="text-xs text-brand-cream/50 font-light">
                  {language === 'id' ? 'Masukkan kredensial admin Anda untuk melanjutkan.' : 'Enter your admin credentials to proceed.'}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-brand-cream/60 uppercase tracking-wider block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@koffierakjat.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-xs text-brand-cream placeholder-brand-cream/20 focus:border-brand-yellow focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-brand-cream/60 uppercase tracking-wider block">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-xs text-brand-cream placeholder-brand-cream/20 focus:border-brand-yellow focus:outline-none transition-colors"
                  />
                </div>

                {loginError && (
                  <div className="p-3 bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs rounded-xl font-light leading-relaxed">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-brand-yellow text-brand-dark hover:bg-brand-yellow-hover text-xs font-bold rounded-xl shadow-lg shadow-brand-yellow/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-brand-dark"></div>
                      <span>{language === 'id' ? 'Memproses...' : 'Processing...'}</span>
                    </>
                  ) : (
                    <span>{language === 'id' ? 'Masuk Sekarang' : 'Login Now'}</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Helper Stats calculations
  const totalProducts = products.length;
  const filterCount = products.filter(p => p.category === 'filter').length;
  const espressoCount = products.filter(p => p.category === 'espresso').length;
  const preOrderCount = products.filter(p => p.isPreOrder).length;

  return (
    <>
      <Navbar />
      
      <main className="flex-1 bg-brand-dark pt-32 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-white/5 pb-8 mb-8">
            <div>
              <h1 className="font-outfit text-3xl font-extrabold text-white">
                {language === 'id' ? 'Dashboard Admin CMS' : 'Admin CMS Dashboard'}
              </h1>
              <p className="text-sm text-brand-cream/60 mt-1 font-light">
                {language === 'id' 
                  ? 'Kelola katalog kopi dan artikel jurnal Anda untuk sinkronisasi instan ke etalase.'
                  : 'Manage your coffee catalog and journal articles for instant storefront synchronization.'}
              </p>
            </div>
            
            <div className="flex items-center gap-3 self-start md:self-auto">
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 bg-brand-red/10 border border-brand-red/20 hover:border-brand-red text-brand-red text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.0" stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                <span>Logout</span>
              </button>
              
              {activeTab === 'products' ? (
                <>
                  <button
                    onClick={resetCatalog}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-brand-cream text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    {language === 'id' ? 'Reset Katalog Default' : 'Reset Default Catalog'}
                  </button>
                  <button
                    onClick={openAddModal}
                    className="px-5 py-2.5 bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-brand-red/10 cursor-pointer flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>{language === 'id' ? 'Tambah Kopi' : 'Add Coffee'}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={resetDefaultArticles}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-brand-cream text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    {language === 'id' ? 'Reset Artikel Default' : 'Reset Default Articles'}
                  </button>
                  <button
                    onClick={openAddArticleModal}
                    className="px-5 py-2.5 bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-brand-red/10 cursor-pointer flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>{language === 'id' ? 'Tambah Artikel' : 'Add Article'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tabs Switcher */}
          <div className="flex gap-4 border-b border-white/5 pb-4 mb-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-brand-yellow text-brand-dark font-bold'
                  : 'text-brand-cream/60 hover:text-brand-cream hover:bg-white/5'
              }`}
            >
              {language === 'id' ? 'Produk & Katalog' : 'Products & Catalog'}
            </button>
            <button
              onClick={() => setActiveTab('journal')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'journal'
                  ? 'bg-brand-yellow text-brand-dark font-bold'
                  : 'text-brand-cream/60 hover:text-brand-cream hover:bg-white/5'
              }`}
            >
              {language === 'id' ? 'Artikel Jurnal' : 'Journal Articles'}
            </button>
          </div>

          {/* Stats Bar */}
          {activeTab === 'products' ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="glass-card p-5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-semibold text-brand-cream/40 uppercase tracking-wider block">Total Products</span>
                <span className="text-3xl font-bold text-white block">{totalProducts}</span>
              </div>
              <div className="glass-card p-5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-semibold text-brand-cream/40 uppercase tracking-wider block">Filter Coffee</span>
                <span className="text-3xl font-bold text-brand-yellow block">{filterCount}</span>
              </div>
              <div className="glass-card p-5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-semibold text-brand-cream/40 uppercase tracking-wider block">Espresso Coffee</span>
                <span className="text-3xl font-bold text-brand-yellow block">{espressoCount}</span>
              </div>
              <div className="glass-card p-5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-semibold text-brand-cream/40 uppercase tracking-wider block">Pre-Order / Limited</span>
                <span className="text-3xl font-bold text-brand-red block">{preOrderCount}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="glass-card p-5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-semibold text-brand-cream/40 uppercase tracking-wider block">Total Articles</span>
                <span className="text-3xl font-bold text-white block">{articles.length}</span>
              </div>
              <div className="glass-card p-5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-semibold text-brand-cream/40 uppercase tracking-wider block">Last Updated</span>
                <span className="text-sm font-semibold text-brand-yellow pt-2 block overflow-hidden text-ellipsis whitespace-nowrap">
                  {articles[0] ? articles[0].date : '-'}
                </span>
              </div>
              <div className="glass-card p-5 rounded-xl border border-white/5 col-span-2 lg:col-span-1 space-y-1">
                <span className="text-[10px] font-semibold text-brand-cream/40 uppercase tracking-wider block">Status</span>
                <span className="text-sm font-semibold pt-2 block text-emerald-400 font-bold">
                  {language === 'id' ? 'Sinkronisasi Cloud Aktif' : 'Cloud Sync Active'}
                </span>
              </div>
            </div>
          )}

          {/* Main List Content */}
          {activeTab === 'products' ? (
            <div className="bg-brand-dark-card border border-white/5 rounded-2xl overflow-hidden">
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-brand-dark-accent text-[10px] font-bold text-brand-yellow uppercase tracking-wider">
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-6">Origin / Roast</th>
                    <th className="py-4 px-6">Prices (100g / 200g / 1kg)</th>
                    <th className="py-4 px-6">Taste Notes</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-brand-cream/40 font-light">
                        {language === 'id' ? 'Tidak ada produk kopi tersedia.' : 'No coffee products available.'}
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                        {/* Title & Category */}
                        <td className="py-4 px-6 flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-lg bg-brand-dark border border-white/10 overflow-hidden flex-shrink-0">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-brand-cream block leading-tight">{product.name}</span>
                            <span className="inline-block bg-white/5 text-[9px] font-medium text-brand-yellow border border-brand-yellow/10 rounded px-1.5 py-0.5 mt-1 uppercase tracking-wide">
                              {product.category}
                            </span>
                            {product.isLimited && (
                              <span className="ml-2 inline-block bg-brand-red/10 text-[9px] font-semibold text-brand-red border border-brand-red/20 rounded px-1.5 py-0.5 uppercase tracking-wide">
                                Limited
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Origin & Roast */}
                        <td className="py-4 px-6">
                          <span className="text-brand-cream/80 block">{product.origin}</span>
                          <span className="text-xs text-brand-cream/45 block mt-0.5">{product.roastLevel} Roast</span>
                        </td>
                        {/* Prices */}
                        <td className="py-4 px-6">
                          <div className="text-xs space-y-0.5">
                            <div className="flex gap-2">
                              <span className="text-brand-cream/40 w-10">100g:</span>
                              <span className="text-brand-cream/80 font-semibold">{formatPrice(product.prices['100g'])}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-brand-cream/40 w-10">200g:</span>
                              <span className="text-brand-cream/80 font-semibold">{formatPrice(product.prices['200g'])}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-brand-cream/40 w-10">1kg:</span>
                              <span className="text-brand-cream/80 font-semibold">{formatPrice(product.prices['1kg'])}</span>
                            </div>
                          </div>
                        </td>
                        {/* Taste Notes */}
                        <td className="py-4 px-6 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {product.tasteNotes.map((note) => (
                              <span key={note} className="bg-brand-dark text-brand-cream/70 text-[9px] px-2 py-0.5 rounded border border-white/5">
                                {note}
                              </span>
                            ))}
                          </div>
                        </td>
                        {/* Action buttons */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-2.5 bg-white/5 border border-white/10 hover:border-brand-yellow/30 text-brand-cream hover:text-brand-yellow rounded-lg transition-colors cursor-pointer"
                              aria-label="Edit Product"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.0" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2.5 bg-brand-red/10 border border-brand-red/20 hover:border-brand-red text-brand-red rounded-lg transition-colors cursor-pointer"
                              aria-label="Delete Product"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.0" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile List Card View */}
            <div className="block md:hidden divide-y divide-white/5">
              {products.length === 0 ? (
                <div className="py-12 text-center text-brand-cream/40 font-light">
                  {language === 'id' ? 'Tidak ada produk kopi tersedia.' : 'No coffee products available.'}
                </div>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg bg-brand-dark border border-white/10 overflow-hidden flex-shrink-0">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-brand-cream truncate leading-tight">{product.name}</h4>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="bg-white/5 text-[8px] font-semibold text-brand-yellow border border-brand-yellow/10 rounded px-1.5 py-0.5 uppercase">
                            {product.category}
                          </span>
                          {product.isLimited && (
                            <span className="bg-brand-red/10 text-[8px] font-semibold text-brand-red border border-brand-red/20 rounded px-1.5 py-0.5 uppercase">
                              Limited
                            </span>
                          )}
                          {product.isPreOrder && (
                            <span className="bg-brand-yellow/10 text-[8px] font-semibold text-brand-yellow border border-brand-yellow/20 rounded px-1.5 py-0.5 uppercase">
                              Pre-Order
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs bg-brand-dark-accent p-3 rounded-lg border border-white/5">
                      <div>
                        <span className="text-brand-cream/40 block text-[9px] uppercase tracking-wider">Origin & Roast</span>
                        <span className="text-brand-cream/80 block mt-0.5">{product.origin}</span>
                        <span className="text-brand-cream/60 block">{product.roastLevel} Roast</span>
                      </div>
                      <div>
                        <span className="text-brand-cream/40 block text-[9px] uppercase tracking-wider">Prices</span>
                        <span className="text-brand-cream/80 block mt-0.5 font-semibold">100g: {formatPrice(product.prices['100g'])}</span>
                        <span className="text-brand-cream/80 block font-semibold">200g: {formatPrice(product.prices['200g'])}</span>
                        <span className="text-brand-cream/80 block font-semibold">1kg: {formatPrice(product.prices['1kg'])}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <div className="flex flex-wrap gap-1 max-w-[70%]">
                        {product.tasteNotes.slice(0, 3).map((note) => (
                          <span key={note} className="bg-brand-dark text-brand-cream/60 text-[9px] px-2 py-0.5 rounded border border-white/5">
                            {note}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-3 bg-white/5 border border-white/10 hover:border-brand-yellow/30 text-brand-cream hover:text-brand-yellow rounded-lg transition-colors cursor-pointer"
                          aria-label="Edit Product"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.0" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-3 bg-brand-red/10 border border-brand-red/20 hover:border-brand-red text-brand-red rounded-lg transition-colors cursor-pointer"
                          aria-label="Delete Product"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.0" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            </div>
          ) : (
            <div className="bg-brand-dark-card border border-white/5 rounded-2xl overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="p-4 text-[10px] font-semibold text-brand-cream/40 uppercase tracking-wider">Cover</th>
                      <th className="p-4 text-[10px] font-semibold text-brand-cream/40 uppercase tracking-wider">Title (ID / EN)</th>
                      <th className="p-4 text-[10px] font-semibold text-brand-cream/40 uppercase tracking-wider">Date</th>
                      <th className="p-4 text-[10px] font-semibold text-brand-cream/40 uppercase tracking-wider">Read Time</th>
                      <th className="p-4 text-[10px] font-semibold text-brand-cream/40 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {articles.map((article) => (
                      <tr key={article.slug} className="hover:bg-white/[0.01] transition-colors duration-150">
                        <td className="p-4">
                          <div className="relative w-12 h-12 rounded-lg bg-brand-dark-accent overflow-hidden border border-white/5">
                            <Image
                              src={article.imageUrl}
                              alt={article.title.id}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-outfit font-semibold text-white truncate max-w-xs">{article.title.id}</div>
                          <div className="text-xs text-brand-cream/40 truncate max-w-xs">{article.title.en}</div>
                        </td>
                        <td className="p-4 text-sm text-brand-cream/80">{article.date}</td>
                        <td className="p-4 text-sm text-brand-yellow font-medium">{article.readTime.id}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openEditArticleModal(article)}
                            className="px-3 py-1.5 bg-brand-yellow/10 hover:bg-brand-yellow text-brand-yellow hover:text-brand-dark text-xs font-bold rounded transition-all duration-150 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleArticleDelete(article.slug)}
                            className="px-3 py-1.5 bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white text-xs font-bold rounded transition-all duration-150 cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden divide-y divide-white/5">
                {articles.length === 0 ? (
                  <div className="p-8 text-center text-brand-cream/40 text-sm">Belum ada artikel terdaftar.</div>
                ) : (
                  articles.map((article) => (
                    <div key={article.slug} className="p-4 space-y-3">
                      <div className="flex gap-4">
                        <div className="relative w-16 h-16 rounded-lg bg-brand-dark-accent overflow-hidden border border-white/5 flex-shrink-0">
                          <Image
                            src={article.imageUrl}
                            alt={article.title.id}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="font-outfit font-semibold text-white line-clamp-1">{article.title.id}</div>
                          <div className="text-xs text-brand-cream/50 line-clamp-1">{article.title.en}</div>
                          <div className="flex items-center gap-2 text-[10px] text-brand-cream/45">
                            <span>{article.date}</span>
                            <span>•</span>
                            <span className="text-brand-yellow">{article.readTime.id}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditArticleModal(article)}
                          className="flex-1 py-2 bg-brand-yellow/10 text-brand-yellow text-xs font-bold rounded text-center transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleArticleDelete(article.slug)}
                          className="p-2 bg-brand-red/10 text-brand-red rounded hover:bg-brand-red transition-all cursor-pointer flex items-center justify-center"
                          aria-label="Delete Article"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.0" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Slide-over / Modal Form (Add & Edit Products) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop Scrim */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="relative transform overflow-hidden rounded-2xl bg-brand-dark-card border border-white/10 p-6 text-left shadow-2xl transition-all w-full max-w-xl animate-slide-up">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                <h3 className="font-outfit text-2xl font-bold text-white">
                  {editingProduct 
                    ? (language === 'id' ? 'Edit Detail Kopi' : 'Edit Coffee Details') 
                    : (language === 'id' ? 'Tambah Kopi Baru' : 'Add New Coffee')}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-brand-cream/50 hover:text-white cursor-pointer"
                  aria-label="Close Modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider block">
                    {language === 'id' ? 'Nama Kopi' : 'Coffee Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2.5 text-brand-cream text-sm focus:border-brand-yellow focus:outline-none placeholder-white/20"
                    placeholder="e.g. Arabica Gayo Atu Lintang"
                  />
                </div>

                {/* Origin */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider block">
                    {language === 'id' ? 'Asal / Origin' : 'Origin / Location'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2.5 text-brand-cream text-sm focus:border-brand-yellow focus:outline-none placeholder-white/20"
                    placeholder="e.g. Aceh Tengah, Sumatera, 1400-1600 masl"
                  />
                </div>

                {/* Category & Roast level */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider block">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as 'filter' | 'espresso')}
                      className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2.5 text-brand-cream text-sm focus:border-brand-yellow focus:outline-none cursor-pointer"
                    >
                      <option value="filter">Filter Coffee</option>
                      <option value="espresso">Espresso Coffee</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider block">
                      Roast Level *
                    </label>
                    <select
                      value={roastLevel}
                      onChange={(e) => setRoastLevel(e.target.value as 'Light' | 'Medium' | 'Dark')}
                      className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2.5 text-brand-cream text-sm focus:border-brand-yellow focus:outline-none cursor-pointer"
                    >
                      <option value="Light">Light Roast</option>
                      <option value="Medium">Medium Roast</option>
                      <option value="Dark">Dark Roast</option>
                    </select>
                  </div>
                </div>

                {/* Prices (100g, 200g, 1kg) */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-brand-yellow uppercase tracking-wider block">
                      Price 100g (IDR) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={price100g}
                      onChange={(e) => setPrice100g(Number(e.target.value))}
                      className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2.5 text-brand-cream text-sm focus:border-brand-yellow focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-brand-yellow uppercase tracking-wider block">
                      Price 200g (IDR) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={price200g}
                      onChange={(e) => setPrice200g(Number(e.target.value))}
                      className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2.5 text-brand-cream text-sm focus:border-brand-yellow focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-brand-yellow uppercase tracking-wider block">
                      Price 1kg (IDR) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={price1kg}
                      onChange={(e) => setPrice1kg(Number(e.target.value))}
                      className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2.5 text-brand-cream text-sm focus:border-brand-yellow focus:outline-none"
                    />
                  </div>
                </div>

                {/* Taste Notes */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider block">
                    {language === 'id' ? 'Catatan Rasa / Taste Notes' : 'Taste Notes'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={tasteNotes}
                    onChange={(e) => setTasteNotes(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2.5 text-brand-cream text-sm focus:border-brand-yellow focus:outline-none placeholder-white/20"
                    placeholder="e.g. Orange, Caramel, Milk Chocolate (comma separated)"
                  />
                </div>

                {/* Description ID */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider block">
                    Description (Indonesian) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={descriptionId}
                    onChange={(e) => setDescriptionId(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-brand-cream text-sm focus:border-brand-yellow focus:outline-none placeholder-white/20 resize-none"
                    placeholder="Deskripsi kopi dalam Bahasa Indonesia"
                  />
                </div>

                {/* Description EN */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider block">
                    Description (English - Optional, fallback to ID)
                  </label>
                  <textarea
                    rows={2}
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-brand-cream text-sm focus:border-brand-yellow focus:outline-none placeholder-white/20 resize-none"
                    placeholder="Coffee description in English"
                  />
                </div>

                {/* Image URL & Status Checkboxes */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider block">
                      {language === 'id' ? 'Foto Produk (Upload)' : 'Product Image (Upload)'}
                    </label>
                    
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-brand-yellow/30 rounded-xl p-4 bg-brand-dark min-h-24">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-yellow mb-2"></div>
                        <span className="text-xs text-brand-yellow font-medium">
                          {language === 'id' ? 'Mengunggah ke Cloud...' : 'Uploading to Cloud...'}
                        </span>
                      </div>
                    ) : !imageUrl ? (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-4 bg-brand-dark hover:border-brand-yellow/30 transition-all group relative min-h-24">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.0" stroke="currentColor" className="w-6 h-6 text-brand-cream/40 group-hover:text-brand-yellow transition-colors mb-2 pointer-events-none">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-brand-cream/60 group-hover:text-brand-cream transition-colors font-medium pointer-events-none">
                          {language === 'id' ? 'Pilih foto biji kopi' : 'Choose coffee photo'}
                        </span>
                        <span className="text-[9px] text-brand-cream/35 mt-0.5 pointer-events-none">
                          PNG, JPG (auto-compressed to keep storage light)
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 bg-brand-dark border border-white/10 rounded-xl p-3">
                        <div className="relative w-14 h-14 bg-brand-dark-accent rounded-lg border border-white/5 overflow-hidden flex-shrink-0">
                          <img
                            src={imageUrl}
                            alt="Upload Preview"
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold text-brand-yellow block uppercase">Active Image</span>
                          <span className="text-[10px] text-brand-cream/50 block truncate mt-0.5">
                            {imageUrl.startsWith('data:') ? 'Custom Compressed Image' : imageUrl}
                          </span>
                        </div>
                        <div className="relative overflow-hidden">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          <button
                            type="button"
                            className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-brand-yellow/30 text-[10px] font-bold rounded text-brand-cream hover:text-brand-yellow transition-colors cursor-pointer"
                          >
                            {language === 'id' ? 'Ganti Foto' : 'Change Photo'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Alternative Image URL input (Billing fallback) */}
                    <div className="mt-3">
                      <label className="text-[8px] font-bold text-brand-cream/40 uppercase tracking-widest block mb-1">
                        {language === 'id' ? 'ATAU MASUKKAN URL GAMBAR EKSTERNAL' : 'OR ENTER EXTERNAL IMAGE URL'}
                      </label>
                      <input
                        type="text"
                        placeholder="https://example.com/kopi.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full bg-brand-dark/50 border border-white/5 rounded-xl px-3.5 py-2 text-[11px] text-brand-cream placeholder-brand-cream/25 focus:border-brand-yellow focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-1">
                    <label className="flex items-center gap-2 text-xs text-brand-cream/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isLimited}
                        onChange={(e) => setIsLimited(e.target.checked)}
                        className="rounded border-white/10 bg-brand-dark text-brand-red focus:ring-brand-red cursor-pointer w-4 h-4"
                      />
                      <span>Limited Edition</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-brand-cream/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPreOrder}
                        onChange={(e) => setIsPreOrder(e.target.checked)}
                        className="rounded border-white/10 bg-brand-dark text-brand-yellow focus:ring-brand-yellow cursor-pointer w-4 h-4"
                      />
                      <span>Pre-Order</span>
                    </label>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-brand-cream text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      isUploading
                        ? 'bg-brand-yellow/50 text-brand-dark/50 cursor-not-allowed'
                        : 'bg-brand-yellow text-brand-dark hover:bg-brand-yellow-hover'
                    }`}
                  >
                    {isUploading 
                      ? (language === 'id' ? 'Mengunggah...' : 'Uploading...') 
                      : (editingProduct ? 'Save Changes' : 'Create Product')
                    }
                  </button>
                </div>

              </form>

            </div>
          </div>
        </div>
      )}

      {/* Slide-over / Modal Form (Add & Edit Journal Articles) */}
      {isJournalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop Scrim */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsJournalOpen(false)}
          />

          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="relative transform overflow-hidden rounded-2xl bg-brand-dark-card border border-white/10 p-6 text-left shadow-2xl transition-all w-full max-w-xl animate-slide-up">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                <h3 className="font-outfit text-2xl font-bold text-white">
                  {editingArticle 
                    ? (language === 'id' ? 'Edit Artikel Jurnal' : 'Edit Journal Article') 
                    : (language === 'id' ? 'Tambah Artikel Baru' : 'Add New Article')}
                </h3>
                <button
                  onClick={() => setIsJournalOpen(false)}
                  className="p-1 rounded-full text-brand-cream/50 hover:text-white cursor-pointer"
                  aria-label="Close Modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleArticleSubmit} className="space-y-4">
                
                {/* Title (ID / EN) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider block">
                      Judul Artikel (ID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={artTitleId}
                      onChange={(e) => setArtTitleId(e.target.value)}
                      className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2.5 text-brand-cream text-sm focus:border-brand-yellow focus:outline-none placeholder-white/20"
                      placeholder="e.g. Panduan Menyeduh V60 untuk Pemula"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider block">
                      Article Title (EN) *
                    </label>
                    <input
                      type="text"
                      required
                      value={artTitleEn}
                      onChange={(e) => setArtTitleEn(e.target.value)}
                      className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2.5 text-brand-cream text-sm focus:border-brand-yellow focus:outline-none placeholder-white/20"
                      placeholder="e.g. V60 Brewing Guide for Beginners"
                    />
                  </div>
                </div>

                {/* Excerpts (ID / EN) */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider block">
                      Kutipan Ringkasan (ID) *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={artExcerptId}
                      onChange={(e) => setArtExcerptId(e.target.value)}
                      className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-brand-cream text-sm focus:border-brand-yellow focus:outline-none placeholder-white/20 resize-none"
                      placeholder="Ringkasan pendek artikel yang muncul di daftar jurnal..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider block">
                      Excerpt / Summary (EN) *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={artExcerptEn}
                      onChange={(e) => setArtExcerptEn(e.target.value)}
                      className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-brand-cream text-sm focus:border-brand-yellow focus:outline-none placeholder-white/20 resize-none"
                      placeholder="Short summary of the article..."
                    />
                  </div>
                </div>

                {/* Date & Read Times */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider block">
                      Tanggal Terbit *
                    </label>
                    <input
                      type="date"
                      required
                      value={artDate}
                      onChange={(e) => setArtDate(e.target.value)}
                      className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2.5 text-brand-cream text-sm focus:border-brand-yellow focus:outline-none text-brand-cream"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-brand-yellow uppercase tracking-wider block">
                      Waktu Baca (ID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={artReadTimeId}
                      onChange={(e) => setArtReadTimeId(e.target.value)}
                      className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2.5 text-brand-cream text-sm focus:border-brand-yellow focus:outline-none"
                      placeholder="3 menit baca"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-brand-yellow uppercase tracking-wider block">
                      Read Time (EN) *
                    </label>
                    <input
                      type="text"
                      required
                      value={artReadTimeEn}
                      onChange={(e) => setArtReadTimeEn(e.target.value)}
                      className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2.5 text-brand-cream text-sm focus:border-brand-yellow focus:outline-none"
                      placeholder="3 min read"
                    />
                  </div>
                </div>

                {/* Content ID (Markdown) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider block">
                    Isi Konten Artikel (ID) - Format Markdown *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={artContentId}
                    onChange={(e) => setArtContentId(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-brand-cream text-xs font-mono focus:border-brand-yellow focus:outline-none placeholder-white/20"
                    placeholder="Gunakan Markdown untuk format: # Judul, ## Sub-judul, 1. List.&#10;Contoh:&#10;### Peralatan:&#10;1. Kopi 15g&#10;2. Air V60"
                  />
                </div>

                {/* Content EN (Markdown) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider block">
                    Article Content (EN) - Markdown Format
                  </label>
                  <textarea
                    rows={6}
                    value={artContentEn}
                    onChange={(e) => setArtContentEn(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-brand-cream text-xs font-mono focus:border-brand-yellow focus:outline-none placeholder-white/20"
                    placeholder="Write article body in English using Markdown..."
                  />
                </div>

                {/* Image Upload & Fallback */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider block">
                      {language === 'id' ? 'Foto Artikel (Upload)' : 'Article Cover Image (Upload)'}
                    </label>
                    
                    {isArtUploading ? (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-brand-yellow/30 rounded-xl p-4 bg-brand-dark min-h-24">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-yellow mb-2"></div>
                        <span className="text-xs text-brand-yellow font-medium">
                          {language === 'id' ? 'Mengunggah ke Cloud...' : 'Uploading to Cloud...'}
                        </span>
                      </div>
                    ) : !artImageUrl ? (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-4 bg-brand-dark hover:border-brand-yellow/30 transition-all group relative min-h-24">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleArticleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.0" stroke="currentColor" className="w-6 h-6 text-brand-cream/40 group-hover:text-brand-yellow transition-colors mb-2 pointer-events-none">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-brand-cream/60 group-hover:text-brand-cream transition-colors font-medium pointer-events-none">
                          {language === 'id' ? 'Pilih foto cover artikel' : 'Choose cover photo'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 bg-brand-dark border border-white/10 rounded-xl p-3">
                        <div className="relative w-14 h-14 bg-brand-dark-accent rounded-lg border border-white/5 overflow-hidden flex-shrink-0">
                          <img
                            src={artImageUrl}
                            alt="Article Cover Preview"
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold text-brand-yellow block uppercase">Active Image</span>
                          <span className="text-[10px] text-brand-cream/50 block truncate mt-0.5">
                            {artImageUrl}
                          </span>
                        </div>
                        <div className="relative overflow-hidden">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleArticleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          <button
                            type="button"
                            className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-brand-yellow/30 text-[10px] font-bold rounded text-brand-cream hover:text-brand-yellow transition-colors cursor-pointer"
                          >
                            {language === 'id' ? 'Ganti Foto' : 'Change Photo'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Alternative Image URL input (Billing fallback) */}
                    <div className="mt-3">
                      <label className="text-[8px] font-bold text-brand-cream/40 uppercase tracking-widest block mb-1">
                        {language === 'id' ? 'ATAU MASUKKAN URL GAMBAR EKSTERNAL' : 'OR ENTER EXTERNAL IMAGE URL'}
                      </label>
                      <input
                        type="text"
                        placeholder="https://example.com/cover.jpg"
                        value={artImageUrl}
                        onChange={(e) => setArtImageUrl(e.target.value)}
                        className="w-full bg-brand-dark/50 border border-white/5 rounded-xl px-3.5 py-2 text-[11px] text-brand-cream placeholder-brand-cream/25 focus:border-brand-yellow focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsJournalOpen(false)}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-brand-cream text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isArtUploading}
                    className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      isArtUploading
                        ? 'bg-brand-yellow/50 text-brand-dark/50 cursor-not-allowed'
                        : 'bg-brand-yellow text-brand-dark hover:bg-brand-yellow-hover'
                    }`}
                  >
                    {isArtUploading 
                      ? (language === 'id' ? 'Mengunggah...' : 'Uploading...') 
                      : (editingArticle ? 'Save Changes' : 'Create Article')
                    }
                  </button>
                </div>

              </form>

            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

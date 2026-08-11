"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, products as initialProducts } from '../data/products';

interface ProductContextProps {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  resetCatalog: () => void;
}

const ProductContext = createContext<ProductContextProps | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [productsState, setProductsState] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  // Initialize and listen to products from Firestore in real-time
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const items: Product[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Safety schema mapping to ensure no undefined property crashes
          let descObj = data.description;
          if (typeof descObj === 'string' || !descObj) {
            descObj = { id: descObj || '', en: descObj || '' };
          }
          let priceObj = data.prices;
          if (!priceObj || typeof priceObj !== 'object') {
            priceObj = { 
              '100g': data.price || 45000, 
              '200g': (data.price || 45000) * 1.8, 
              '1kg': (data.price || 45000) * 7.5 
            };
          }
          items.push({
            id: docSnap.id,
            name: data.name || 'Specialty Coffee',
            category: (data.category === 'espresso' ? 'espresso' : 'filter') as 'filter' | 'espresso',
            origin: data.origin || 'Nusantara',
            roastLevel: (data.roastLevel === 'Light' || data.roastLevel === 'Dark' ? data.roastLevel : 'Medium') as 'Light' | 'Medium' | 'Dark',
            tasteNotes: Array.isArray(data.tasteNotes) ? data.tasteNotes : [],
            prices: priceObj,
            isLimited: !!data.isLimited,
            isPreOrder: !!data.isPreOrder,
            imageUrl: data.imageUrl || '/images/coffee-pack-filter.jpg',
            description: descObj
          } as Product);
        });

        // Seed with defaults if Firestore is completely empty
        if (items.length === 0) {
          setProductsState(initialProducts);
        } else {
          setProductsState(items);
        }
        setMounted(true);
      },
      (error) => {
        console.error('Failed to load products from Firestore:', error);
        // Fallback to local defaults on network/rules failure
        setProductsState(initialProducts);
        setMounted(true);
      }
    );

    return () => unsub();
  }, []);

  const addProduct = async (newProduct: Omit<Product, 'id'>) => {
    try {
      await addDoc(collection(db, 'products'), newProduct);
    } catch (e) {
      console.error('Failed to add product to Firestore:', e);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const { id, ...data } = updatedProduct;
      await updateDoc(doc(db, 'products', id), data);
    } catch (e) {
      console.error('Failed to update product in Firestore:', e);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.error('Failed to delete product from Firestore:', e);
    }
  };

  const resetCatalog = async () => {
    try {
      // Set default products in Firestore using setDoc to keep standard IDs
      for (const p of initialProducts) {
        const { id, ...data } = p;
        await setDoc(doc(db, 'products', id), data);
      }
    } catch (e) {
      console.error('Failed to reset catalog in Firestore:', e);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products: mounted ? productsState : [],
        addProduct,
        updateProduct,
        deleteProduct,
        resetCatalog,
      }}
    >
      <div className={mounted ? "contents" : "invisible"}>
        {children}
      </div>
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

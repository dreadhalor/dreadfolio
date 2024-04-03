import { Product } from '@flowerchild/payload-types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id,
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          } else {
            return {
              items: [...state.items, { product, quantity: 1 }],
            };
          }
        });
      },
      removeItem: (productId) => {
        set((state) => {
          return {
            items: state.items.filter((item) => item.product.id !== productId),
          };
        });
      },
      updateItemQuantity: (productId, quantity) => {
        set((state) => {
          return {
            items: state.items
              .map((item) =>
                item.product.id === productId ? { ...item, quantity } : item,
              )
              .filter((item) => item.quantity > 0),
          };
        });
      },
      clearCart: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

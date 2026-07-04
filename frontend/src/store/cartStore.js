import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      totalQuantity: 0,
      totalAmount: 0,

      addItem: (product, quantity = 1, variantSku = null) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product._id === product._id && item.variantSku === variantSku
          )

          let newItems
          if (existingIndex >= 0) {
            newItems = [...state.items]
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + quantity,
            }
          } else {
            newItems = [
              ...state.items,
              {
                product,
                variantSku,
                quantity,
                price: product.basePrice,
              },
            ]
          }

          return calculateTotals(newItems)
        })
      },

      updateQuantity: (productId, variantSku, quantity) => {
        set((state) => {
          const newItems = state.items.map((item) =>
            item.product._id === productId && item.variantSku === variantSku
              ? { ...item, quantity }
              : item
          )
          return calculateTotals(newItems)
        })
      },

      removeItem: (productId, variantSku) => {
        set((state) => {
          const newItems = state.items.filter(
            (item) => !(item.product._id === productId && item.variantSku === variantSku)
          )
          return calculateTotals(newItems)
        })
      },

      clearCart: () => set({ items: [], totalQuantity: 0, totalAmount: 0 }),
    }),
    { name: 'cart-storage' }
  )
)

function calculateTotals(items) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return { items, totalQuantity, totalAmount }
}

export default useCartStore

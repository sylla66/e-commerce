import { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, title, description, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-right',
              t.variant === 'destructive'
                ? 'border-danger bg-red-50 text-danger'
                : 'border-border bg-surface text-text'
            )}
          >
            {t.title && <p className="font-semibold">{t.title}</p>}
            {t.description && <p className="text-sm text-text-muted">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function Toaster() {
  return null
}

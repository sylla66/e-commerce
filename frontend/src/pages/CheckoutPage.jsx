import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { ArrowLeft, Loader2, CreditCard, Smartphone, Clock } from 'lucide-react'
import useCartStore from '@/store/cartStore'
import useAuthStore from '@/hooks/useAuth'
import { orderService } from '@/services/orderService'
import Button from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '')

const providers = [
  { id: 'stripe', name: 'Carte bancaire', icon: CreditCard, description: 'Visa, Mastercard, CB', available: true },
  { id: 'wave', name: 'Wave', icon: Smartphone, description: 'Paiement mobile Sénégal', available: false },
  { id: 'orange_money', name: 'Orange Money', icon: Clock, description: 'Paiement mobile Sénégal', available: false },
]

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState('shipping')
  const [provider, setProvider] = useState('stripe')
  const [shipping, setShipping] = useState({ street: '', city: '', region: '', zipCode: '', country: 'Sénégal' })
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [orderId, setOrderId] = useState(null)
  const [clientSecret, setClientSecret] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (items.length === 0) { navigate('/cart'); return }
  }, [])

  if (!isAuthenticated || items.length === 0) return null

  const shippingCost = shippingMethod === 'express' ? 5000 : shippingMethod === 'standard' ? 2000 : 0
  const total = totalAmount + shippingCost

  const handleCreateOrder = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const cartItems = items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        variantSku: item.variantSku,
      }))
      const order = await orderService.create({ shippingAddress: shipping, shippingMethod, items: cartItems })
      setOrderId(order._id)

      const { clientSecret } = await orderService.createPaymentIntent(order._id, provider)
      setClientSecret(clientSecret)
      setStep('payment')
    } catch (err) {
      toast({ title: 'Erreur', description: err.response?.data?.message || 'Erreur lors de la commande', variant: 'destructive' })
    } finally {
      setCreating(false)
    }
  }

  if (step === 'payment' && clientSecret) {
    return (
      <StripeCheckoutForm
        orderId={orderId}
        clientSecret={clientSecret}
        total={total}
        shippingCost={shippingCost}
        clearCart={clearCart}
        toast={toast}
        navigate={navigate}
      />
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-text">Finaliser la commande</h1>

      <form onSubmit={handleCreateOrder}>
        <div className="mb-6 rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-text">Adresse de livraison</h2>
          <div className="space-y-3">
            <input placeholder="Rue" value={shipping.street} onChange={(e) => setShipping({ ...shipping, street: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text" required />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Ville" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-text" required />
              <input placeholder="Région" value={shipping.region} onChange={(e) => setShipping({ ...shipping, region: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-text" />
              <input placeholder="Code postal" value={shipping.zipCode} onChange={(e) => setShipping({ ...shipping, zipCode: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-text" />
              <input placeholder="Pays" value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-text" required />
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-text">Mode de livraison</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted">
              <input type="radio" name="shipping" value="standard" checked={shippingMethod === 'standard'} onChange={(e) => setShippingMethod(e.target.value)} />
              <div><p className="font-medium text-text">Standard</p><p className="text-sm text-text-muted">2 000 CFA - 5 à 7 jours</p></div>
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted">
              <input type="radio" name="shipping" value="express" checked={shippingMethod === 'express'} onChange={(e) => setShippingMethod(e.target.value)} />
              <div><p className="font-medium text-text">Express</p><p className="text-sm text-text-muted">5 000 CFA - 1 à 2 jours</p></div>
            </label>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-text">Moyen de paiement</h2>
          <div className="space-y-2">
            {providers.map((p) => (
              <div key={p.id} className={`flex items-center gap-3 rounded-lg border p-3 ${p.available ? 'cursor-pointer hover:bg-muted' : 'opacity-50'}`}
                onClick={() => p.available && setProvider(p.id)}
              >
                <input type="radio" name="provider" checked={provider === p.id} onChange={() => p.available && setProvider(p.id)} disabled={!p.available} />
                <p.icon className="h-5 w-5 text-text-muted" />
                <div className="flex-1">
                  <p className="font-medium text-text">{p.name}</p>
                  <p className="text-sm text-text-muted">{p.description}</p>
                </div>
                {!p.available && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-text-muted">Bientôt</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-text">Récapitulatif</h2>
          {items.map((item) => (
            <div key={item.product._id} className="flex justify-between py-1 text-sm">
              <span className="text-text-muted">{item.product.name} x{item.quantity}</span>
              <span className="text-text">{(item.price * item.quantity).toLocaleString()} CFA</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm">
            <span className="text-text-muted">Livraison</span>
            <span className="text-text">{shippingCost.toLocaleString()} CFA</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-2 font-bold text-text">
            <span>Total</span>
            <span>{total.toLocaleString()} CFA</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/cart')}>
            <ArrowLeft className="mr-2 h-4 w-4" />Retour
          </Button>
          <Button type="submit" className="flex-1" disabled={creating}>
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Commander
          </Button>
        </div>
      </form>
    </div>
  )
}

function StripeCheckoutForm({ orderId, clientSecret, total, shippingCost, clearCart, toast, navigate }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm orderId={orderId} total={total} shippingCost={shippingCost} clearCart={clearCart} toast={toast} navigate={navigate} />
    </Elements>
  )
}

function PaymentForm({ orderId, total, clearCart, toast, navigate }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (error) {
      toast({ title: 'Paiement échoué', description: error.message, variant: 'destructive' })
      setProcessing(false)
      return
    }

    clearCart()
    toast({ title: 'Paiement réussi', description: 'Votre commande est confirmée' })
    navigate('/orders/success', { state: { orderId } })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-text">Paiement</h1>
      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="mb-6 flex justify-between text-lg font-bold text-text">
          <span>Total à payer</span>
          <span>{total.toLocaleString()} CFA</span>
        </div>
        <form onSubmit={handleSubmit}>
          <PaymentElement />
          <Button type="submit" className="mt-6 w-full" disabled={!stripe || processing}>
            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Payer {total.toLocaleString()} CFA
          </Button>
        </form>
      </div>
    </div>
  )
}

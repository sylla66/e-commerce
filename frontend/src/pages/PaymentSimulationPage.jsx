import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Smartphone, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { orderService } from '@/services/orderService'
import Button from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'

export default function PaymentSimulationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [status, setStatus] = useState('pending')
  const [loading, setLoading] = useState(false)

  const orderId = searchParams.get('orderId')
  const paymentId = searchParams.get('paymentId')
  const provider = searchParams.get('provider') || 'wave'
  const providerName = provider === 'wave' ? 'Wave' : 'Orange Money'

  const confirmPayment = async () => {
    setLoading(true)
    try {
      await orderService.confirmPayment(paymentId, provider)
      setStatus('success')
      toast({ title: 'Paiement réussi', description: 'Votre commande est confirmée' })
    } catch {
      setStatus('failed')
      toast({ title: 'Erreur', description: 'Échec de la confirmation', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    confirmPayment()
  }, [])

  if (status === 'success') {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-success" />
        <h1 className="mb-2 text-2xl font-bold text-text">Paiement {providerName} réussi !</h1>
        <p className="mb-6 text-text-muted">Votre commande a été confirmée.</p>
        <Button onClick={() => navigate('/orders/success', { state: { orderId } })}>
          Voir le récapitulatif
        </Button>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <XCircle className="mx-auto mb-4 h-16 w-16 text-danger" />
        <h1 className="mb-2 text-2xl font-bold text-text">Paiement échoué</h1>
        <p className="mb-6 text-text-muted">Une erreur est survenue.</p>
        <Button variant="outline" onClick={() => navigate('/checkout')}>
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <Smartphone className="mx-auto mb-4 h-16 w-16 text-primary animate-pulse" />
      <h1 className="mb-2 text-xl font-bold text-text">Confirmation {providerName}</h1>
      <p className="mb-6 text-text-muted">Traitement du paiement en cours...</p>
      {loading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />}
    </div>
  )
}
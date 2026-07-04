import { Link, useLocation } from 'react-router-dom'
import { CheckCircle, Package } from 'lucide-react'
import Button from '@/components/ui/button'

export default function OrderSuccessPage() {
  const { state } = useLocation()
  const orderId = state?.orderId

  return (
    <div className="py-12 text-center">
      <CheckCircle className="mx-auto mb-4 h-16 w-16 text-success" />
      <h1 className="mb-2 text-2xl font-bold text-text">Commande confirmée !</h1>
      <p className="mb-2 text-text-muted">Merci pour votre commande. Vous recevrez un email de confirmation.</p>
      {orderId && (
        <p className="mb-8 text-sm text-text-muted">
          Référence : <span className="font-mono text-text">{orderId}</span>
        </p>
      )}
      <div className="flex justify-center gap-3">
        <Link to="/orders">
          <Button variant="outline">
            <Package className="mr-2 h-4 w-4" /> Suivre ma commande
          </Button>
        </Link>
        <Link to="/products">
          <Button>Continuer mes achats</Button>
        </Link>
      </div>
    </div>
  )
}

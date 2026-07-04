import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import Button from '@/components/ui/button'
import useAuthStore from '@/hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-text">Connexion</h1>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-danger">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-text-muted">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text"
              placeholder="admin@boutique.sn"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-text-muted">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text"
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            <LogIn className="mr-2 h-4 w-4" />
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-text-muted">
          <Link to="/" className="text-primary hover:underline">Retour à l'accueil</Link>
        </p>
      </div>
    </div>
  )
}

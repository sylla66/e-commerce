import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import Button from '@/components/ui/button'
import api from '@/services/api'
import useAuthStore from '@/hooks/useAuth'

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || "Erreur d'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-text">Inscription</h1>

        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-danger">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div aria-hidden="true" className="absolute -left-[9999px]" style={{ position: 'absolute', left: '-9999px' }}>
              <input type="text" name="_honey" tabIndex={-1} autoComplete="off" value={form._honey || ''} onChange={(e) => setForm({ ...form, _honey: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted">Prénom</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text" required maxLength={50} />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted">Nom</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text" required maxLength={50} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-muted">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text" required />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-muted">Téléphone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-muted">Mot de passe</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text" minLength={8} maxLength={128} required autoComplete="new-password" />
            </div>
          <Button type="submit" className="w-full" disabled={loading}>
            <UserPlus className="mr-2 h-4 w-4" />
            {loading ? 'Inscription...' : "S'inscrire"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-text-muted">
          Déjà inscrit ? <Link to="/login" className="text-primary hover:underline">Connectez-vous</Link>
        </p>
      </div>
    </div>
  )
}

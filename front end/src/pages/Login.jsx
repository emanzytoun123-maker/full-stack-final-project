
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Login.css'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/users/login', {
        email,
        password
      })

      const { token, userId, role } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('userId', userId)
      localStorage.setItem('role', role)

     if (role === 'restaurant') {
  navigate('/restaurant/dashboard')
} else {
  navigate('/')
}
    } catch (err) {
      setError(
        err.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">طلعتنا</Link>

        <h1>أهلًا بعودتك!</h1>
        <p>سجّل دخولك عشان تكمّل طلعتك معنا.</p>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">البريد الإلكتروني</label>
          <input
            type="email"
            id="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">كلمة المرور</label>
          <input
            type="password"
            id="password"
            placeholder="أدخل كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <p>
          ما عندك حساب؟ <Link to="/register">أنشئ حساب جديد</Link>
        </p>
      </div>
    </main>
  )
}

export default Login

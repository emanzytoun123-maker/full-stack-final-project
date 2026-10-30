import { Link } from 'react-router-dom'
import './Login.css'
function Login() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">طلعتنا</Link>

        <h1>أهلًا بعودتك! </h1>
        <p>سجّل دخولك عشان تكمّل طلعتك معنا.</p>

        <form>
          <label htmlFor="email">البريد الإلكتروني</label>
          <input
            type="email"
            id="email"
            placeholder="example@email.com"
          />

          <label htmlFor="password">كلمة المرور</label>
          <input
            type="password"
            id="password"
            placeholder="أدخل كلمة المرور"
          />

          <button type="submit">تسجيل الدخول</button>
        </form>

        <p>
          ما عندك حساب؟ <Link to="/register">أنشئ حساب جديد</Link>
        </p>
      </div>
    </main>
  )
}

export default Login
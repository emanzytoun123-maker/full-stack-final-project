import { Link } from 'react-router-dom'
import './Register.css'

function Register() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">طلعتنا</Link>

        <h1>انضم لعيلتنا! 🎉</h1>
        <p>أنشئ حسابك وخلّي طلعتك الجاية أحلى.</p>

        <form>
          <label htmlFor="name">الاسم الكامل</label>
          <input
            type="text"
            id="name"
            placeholder="أدخل اسمك"
          />

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
            placeholder="أنشئ كلمة مرور"
          />

          <button type="submit">إنشاء حساب</button>
        </form>

        <p>
          عندك حساب؟ <Link to="/login">سجّل دخولك</Link>
        </p>
      </div>
    </main>
  )
}

export default Register
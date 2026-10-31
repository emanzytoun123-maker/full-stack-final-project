
import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const isLoggedIn = Boolean(token)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('role')
    navigate('/login')
  }

  return (
    <header className="navbar">

      <Link to="/" className="navbar-logo">
        <span className="logo-icon">ط</span>
        <span>طلعتنا</span>
      </Link>

      <nav className="navbar-links">
        <Link to="/">الرئيسية</Link>
        <Link to="/restaurants">المطاعم</Link>
        <Link to="/surplus-offers">العروض</Link>
        <Link to="/outings">الطلعات</Link>

        {isLoggedIn && role === 'consumer' && (
          <Link to="/my-orders">طلباتي</Link>
        )}

        {isLoggedIn && role === 'restaurant' && (
          <Link to="/restaurant/dashboard">لوحة المطعم</Link>
        )}
      </nav>

      <div className="navbar-actions">

        {!isLoggedIn ? (
          <>
            <Link to="/login" className="login-link">
              تسجيل الدخول
            </Link>

            <Link to="/register" className="register-button">
              إنشاء حساب
            </Link>
          </>
        ) : (
          <Link
  to="/login"
  className="register-button logout-button"
  onClick={handleLogout}
>
  تسجيل الخروج
</Link>
        )}

      </div>

    </header>
  )
}

export default Navbar

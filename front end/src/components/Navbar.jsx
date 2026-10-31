import { Link } from 'react-router-dom'

function Navbar() {
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
      </nav>

      <div className="navbar-actions">
        <Link to="/login" className="login-link">
          تسجيل الدخول
        </Link>

        <Link to="/register" className="register-button">
          إنشاء حساب
        </Link>
      </div>
    </header>
  )
}

export default Navbar
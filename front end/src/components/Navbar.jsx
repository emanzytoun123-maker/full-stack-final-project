
function Navbar() {
  return (
    <header className="navbar">
      <a href="/" className="navbar-logo">
        <span className="logo-icon">ط</span>
        <span>طلعتنا</span>
      </a>

      <nav className="navbar-links">
        <a href="/">الرئيسية</a>
        <a href="/restaurants">المطاعم</a>
        <a href="/surplus-offers">العروض</a>
        <a href="/outings">الطلعات</a>
      </nav>

      <div className="navbar-actions">
        <a href="/login" className="login-link">
          تسجيل الدخول
        </a>
        <a href="/register" className="register-button">
          إنشاء حساب
        </a>
      </div>
    </header>
  );
}

export default Navbar;

import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span>ط</span>
            طلعتنا
          </Link>
          <p>
            اكتشف مطاعم جديدة، استفيد من العروض، وخطط طلعتك الجاية مع أصحابك.
          </p>
        </div>

        <div className="footer-links">
          <h3>روابط سريعة</h3>
          <Link to="/">الرئيسية</Link>
          <Link to="/restaurants">المطاعم</Link>
          <Link to="/surplus-offers">العروض</Link>
          <Link to="/outings">الطلعات</Link>
        </div>

        <div className="footer-links">
          <h3>حسابك</h3>
          <Link to="/login">تسجيل الدخول</Link>
          <Link to="/register">إنشاء حساب</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Tal3etna. جميع الحقوق محفوظة.</p>
        <span>طلعتك أحلى معنا 💙</span>
      </div>
    </footer>
  )
}

export default Footer
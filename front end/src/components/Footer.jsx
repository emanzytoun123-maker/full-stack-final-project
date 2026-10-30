
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <a href="/" className="footer-logo">
            <span>ط</span>
            طلعتنا
          </a>
          <p>
            اكتشف مطاعم جديدة، استفيد من العروض،
            وخطط طلعتك الجاية مع أصحابك.
          </p>
        </div>

        <div className="footer-links">
          <h3>روابط سريعة</h3>
          <a href="/">الرئيسية</a>
          <a href="/restaurants">المطاعم</a>
          <a href="/surplus-offers">العروض</a>
          <a href="/outings">الطلعات</a>
        </div>

        <div className="footer-links">
          <h3>حسابك</h3>
          <a href="/login">تسجيل الدخول</a>
          <a href="/register">إنشاء حساب</a>
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

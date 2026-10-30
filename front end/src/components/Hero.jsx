
import './Hero.css'

function Hero() {
  return (
    <section className="hero-section" id="home">

      <div className="hero-content">
        <span className="hero-badge">
          ✨ كل طلعة إلها حكاية
        </span>

        <h1>
          طلعتك الجاية؟
          <br />
          <span>خلّيها علينا!</span>
        </h1>

        <p>
          اكتشف مطاعم جديدة، استفيد من العروض المميزة،
          وخطط طلعتك الجاية مع أصحابك بكل سهولة.
        </p>

        <div className="hero-buttons">
          <a href="/restaurants" className="hero-primary-btn">
            اكتشف المطاعم ←
          </a>

          <a href="/outings" className="hero-secondary-btn">
            خطط طلعتك
          </a>
        </div>

        <div className="hero-note">
          <span>✓</span>
          كل خيارات طلعتك بمكان واحد
        </div>
      </div>

      <div className="hero-image">
        <div className="hero-main-circle">
          🍔
        </div>

        <div className="hero-floating-card card-one">
          <span>🍕</span>
          <div>
            <strong>مطاعم متنوعة</strong>
            <small>اكتشف مكانك المفضل</small>
          </div>
        </div>

        <div className="hero-floating-card card-two">
          <span>🎉</span>
          <div>
            <strong>طلعتكم أحلى</strong>
            <small>خططوا سوا</small>
          </div>
        </div>

        <span className="hero-decoration decoration-one">✦</span>
        <span className="hero-decoration decoration-two">✳</span>
      </div>

    </section>
  )
}

export default Hero

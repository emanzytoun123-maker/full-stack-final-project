import { Link } from 'react-router-dom'
import './Features.css'

const features = [
  {
    icon: '🍽️',
    title: 'اكتشف المطاعم',
    description: 'تصفح المطاعم واكتشف المنيو والأسعار واختار مكانك المفضل.',
    link: '/restaurants',
    button: 'استكشف المطاعم',
    color: 'blue',
  },
  {
    icon: '🏷️',
    title: 'عروض الطعام',
    description: 'استفيد من عروض الطعام المخفّض ووفر على طلباتك.',
    link: '/surplus-offers',
    button: 'شوف العروض',
    color: 'orange',
  },
  {
    icon: '🥳',
    title: 'خطط طلعتك',
    description: 'اجمع أصحابك واقترحوا مطاعم وصوّتوا سوا.',
    link: '/outings',
    button: 'يلا نخطط',
    color: 'green',
  },
]

function Features() {
  return (
    <section className="features-section" id="features">
      <div className="features-heading">
        <span>اكتشف خدماتنا</span>
        <h2>كل خيارات طلعتك بمكان واحد</h2>
        <p>مهما كان مخططك، طلعتنا بتسهّل عليك الاختيار.</p>
      </div>

      <div className="features-grid">
        {features.map((feature) => (
          <Link
            to={feature.link}
            className={`feature-card ${feature.color}`}
            key={feature.title}
          >
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>

            <span className="feature-link">
              {feature.button} ←
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Features

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../services/api'
import './RestaurantDetails.css'

function RestaurantDetails() {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const response = await api.get(`/restaurants/${id}`)
        setRestaurant(response.data)
      } catch (err) {
        setError('تعذر تحميل بيانات المطعم.')
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurant()
  }, [id])

  const coordinates = restaurant?.location?.coordinates

  const mapUrl = coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`
    : null

  const crowdInfo = {
    high: { text: 'مزدحم', icon: '🔴' },
    medium: { text: 'متوسط', icon: '🟡' },
    low: { text: 'غير مزدحم', icon: '🟢' }
  }

  const crowd = crowdInfo[restaurant?.crowdLevel] || crowdInfo.low

  return (
    <>
      <Navbar />

      <main className="restaurant-details-page">

        {loading && (
          <p className="details-message">جاري تحميل بيانات المطعم...</p>
        )}

        {error && (
          <p className="details-message">{error}</p>
        )}

        {restaurant && (
          <div className="restaurant-profile">

            <div className="restaurant-profile-header">
              <div className="restaurant-profile-icon">🍽️</div>

              <span className="restaurant-label">مطعم</span>

              <h1>{restaurant.name}</h1>

              <p>
                {restaurant.description ||
                  'أهلاً بك! اكتشف قائمة الطعام واستمتع بتجربتك.'}
              </p>
            </div>

            <div className="restaurant-profile-body">

              <div className="restaurant-info-grid">

                <div className="restaurant-info-item">
                  <span className="info-icon">📍</span>
                  <div>
                    <span className="info-label">المدينة</span>
                    <strong>{restaurant.city}</strong>
                  </div>
                </div>

                <div className="restaurant-info-item">
                  <span className="info-icon">👥</span>
                  <div>
                    <span className="info-label">حالة الازدحام</span>
                    <strong>{crowd.icon} {crowd.text}</strong>
                  </div>
                </div>

                <div className="restaurant-info-item">
                  <span className="info-icon">⏱️</span>
                  <div>
                    <span className="info-label">وقت الانتظار</span>
                    <strong>{restaurant.waitTimeMinutes} دقيقة</strong>
                  </div>
                </div>

                <div className="restaurant-info-item">
                  <span className="info-icon">📞</span>
                  <div>
                    <span className="info-label">رقم الهاتف</span>
                    <strong>{restaurant.phone || 'غير متوفر'}</strong>
                  </div>
                </div>

              </div>

              <div className="restaurant-profile-actions">

                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="restaurant-map-btn"
                  >
                    📍 عرض الموقع على الخريطة
                  </a>
                )}

                <Link
                  to={`/restaurants/${id}/menu`}
                  className="restaurant-menu-btn"
                >
                  🍽️ استكشف المنيو
                  <span>←</span>
                </Link>

              </div>

            </div>
          </div>
        )}

      </main>

      <Footer />
    </>
  )
}

export default RestaurantDetails

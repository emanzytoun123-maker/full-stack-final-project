import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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

  return (
    <>
      <Navbar />

      <main className="restaurant-details-page">
        {loading && <p>جاري تحميل بيانات المطعم...</p>}

        {error && <p>{error}</p>}

        {restaurant && (
          <div className="restaurant-details-card">
            <div className="restaurant-details-icon">🍽️</div>

            <h1>{restaurant.name}</h1>

            <p>📍 المدينة: {restaurant.city}</p>

            <p>
              حالة الازدحام:
              {restaurant.crowdLevel === 'high' ? ' 🔴 مزدحم' : ' 🟢 غير مزدحم'}
            </p>

            <p>⏱️ وقت الانتظار: {restaurant.waitTimeMinutes} دقيقة</p>
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}

export default RestaurantDetails
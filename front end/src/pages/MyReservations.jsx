
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../services/api'
import './MyReservations.css'

function MyReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(null)
  const [message, setMessage] = useState('')

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token')

      const response = await api.get('/reservations/my', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setReservations(response.data.reservations)
    } catch (err) {
      setError(
        err.response?.data?.message || 'تعذر تحميل حجوزاتك.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  const handleCancel = async (reservationId) => {
    try {
      setCancelling(reservationId)
      setMessage('')
      setError('')

      await api.patch(
        `/reservations/${reservationId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      setMessage('تم إلغاء الحجز بنجاح.')
      await fetchReservations()
    } catch (err) {
      setError(
        err.response?.data?.message || 'تعذر إلغاء الحجز.'
      )
    } finally {
      setCancelling(null)
    }
  }

  const statusLabels = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    cancelled: 'ملغي',
    waiting: 'قائمة الانتظار'
  }

  return (
    <>
      <Navbar />

      <main className="my-reservations-page" dir="rtl">
        <header className="my-reservations-header">
          <h1>حجوزاتي 📅</h1>
          <p>تابعي حجوزاتك وحالة كل حجز.</p>
        </header>

        {message && <p className="reservation-success">{message}</p>}
        {error && <p className="reservation-error">{error}</p>}

        {loading ? (
          <p>جاري تحميل الحجوزات...</p>
        ) : reservations.length === 0 ? (
          <div className="reservations-empty">
            <span>📅</span>
            <h2>ما عندك حجوزات حاليًا</h2>
            <p>احجزي طاولتك في أحد المطاعم واستمتعي بوقتك!</p>
          </div>
        ) : (
          <div className="my-reservations-list">
            {reservations.map(reservation => (
              <article
                className="my-reservation-card"
                key={reservation._id}
              >
                <h2>
                  🍽️ {reservation.restaurant?.name || 'مطعم'}
                </h2>

                <p>
                  📅 التاريخ:{' '}
                  {new Date(reservation.date).toLocaleDateString('ar-JO')}
                </p>

                <p>🕒 الوقت: {reservation.time}</p>
                <p>👥 عدد الأشخاص: {reservation.peopleCount}</p>

                <span className={`reservation-status ${reservation.status}`}>
                  {statusLabels[reservation.status] || reservation.status}
                </span>

                {reservation.status === 'pending' && (
                  <button
                    className="cancel-reservation-btn"
                    disabled={cancelling === reservation._id}
                    onClick={() => handleCancel(reservation._id)}
                  >
                    {cancelling === reservation._id
                      ? 'جاري الإلغاء...'
                      : 'إلغاء الحجز'}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}

export default MyReservations

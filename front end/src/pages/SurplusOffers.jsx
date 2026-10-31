
import { useEffect, useState } from 'react'
import api from '../services/api'
import './SurplusOffers.css'

function SurplusOffers() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await api.get('/surplus-offers')
        setOffers(response.data)
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'تعذر تحميل العروض حاليًا.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [])

  const formatDate = (date) => {
    return new Date(date).toLocaleString('ar-JO', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  return (
    <main className="surplus-page" dir="rtl">
      <section className="surplus-header">
        <h1>عروض الفائض 🎁</h1>
        <p>
          استفيد من الأصناف المتبقية بأسعار مخفّضة
          وساهم في تقليل هدر الطعام.
        </p>
      </section>

      {loading && (
        <p className="surplus-message">
          جاري تحميل العروض...
        </p>
      )}

      {error && (
        <p className="surplus-message surplus-error">
          {error}
        </p>
      )}

      {!loading && !error && offers.length === 0 && (
        <div className="surplus-empty">
          <span>🎁</span>
          <h2>ما في عروض متاحة حاليًا</h2>
          <p>ارجع تفقّد الصفحة لاحقًا.</p>
        </div>
      )}

      {!loading && !error && offers.length > 0 && (
        <section className="surplus-grid">
          {offers.map((offer) => {
            const item = offer.menuItem
            const restaurant = offer.restaurant

            if (!item || !restaurant) return null

            const discount = Math.round(
              ((offer.originalPrice - offer.discountedPrice) /
                offer.originalPrice) * 100
            )

            return (
              <article className="surplus-card" key={offer._id}>
                <div className="surplus-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <span>🍽️</span>
                  )}

                  <span className="surplus-discount">
                    خصم {discount}%
                  </span>
                </div>

                <div className="surplus-card-body">
                  <span className="surplus-restaurant">
                    🍴 {restaurant.name}
                    {restaurant.city && ` - ${restaurant.city}`}
                  </span>

                  <h2>{item.name}</h2>

                  <p className="surplus-description">
  {item.description || '\u00A0'}
</p>
                  <div className="surplus-prices">
                    <strong>
                      {offer.discountedPrice.toFixed(2)} د.أ
                    </strong>

                    <del>
                      {offer.originalPrice.toFixed(2)} د.أ
                    </del>
                  </div>

                  <div className="surplus-details">
                    <p>
                      📦 الكمية المتبقية: {offer.remainingQuantity}
                    </p>

                    <p>
                      🕒 آخر موعد للاستلام:
                      <br />
                      {formatDate(offer.pickupUntil)}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}

export default SurplusOffers

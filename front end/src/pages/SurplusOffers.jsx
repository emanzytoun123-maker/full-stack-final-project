
import { useEffect, useState } from 'react'
import api from '../services/api'
import './SurplusOffers.css'

function SurplusOffers() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [quantities, setQuantities] = useState({})
  const [ordering, setOrdering] = useState(null)
  const [orderMessage, setOrderMessage] = useState('')
  const [orderError, setOrderError] = useState('')

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

  // طلب عرض فائض
  const handleOrderOffer = async (offer) => {
    const quantity = quantities[offer._id] || 1
    const token = localStorage.getItem('token')

    if (!token) {
      setOrderError('سجّل دخولك أولًا حتى تقدر تطلب العرض.')
      setOrderMessage('')
      return
    }

    if (localStorage.getItem('role') !== 'consumer') {
      setOrderError('هذه الخدمة متاحة لحسابات المستخدمين فقط.')
      setOrderMessage('')
      return
    }

    if (quantity > offer.remainingQuantity) {
      setOrderError('الكمية المطلوبة غير متوفرة.')
      setOrderMessage('')
      return
    }

    try {
      setOrdering(offer._id)
      setOrderError('')
      setOrderMessage('')

      await api.post(
        '/orders/surplus',
        {
          offerId: offer._id,
          quantity
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setOffers(prev =>
        prev
          .map(item =>
            item._id === offer._id
              ? {
                  ...item,
                  remainingQuantity:
                    item.remainingQuantity - quantity,
                  status:
                    item.remainingQuantity - quantity === 0
                      ? 'soldOut'
                      : item.status
                }
              : item
          )
          .filter(item => item.remainingQuantity > 0)
      )

      setOrderMessage('تم طلب العرض بنجاح! 🎉')

      setQuantities(prev => ({
        ...prev,
        [offer._id]: 1
      }))

    } catch (err) {
      setOrderError(
        err.response?.data?.message ||
        'تعذر إتمام الطلب، حاول مرة ثانية.'
      )
    } finally {
      setOrdering(null)
    }
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

      {/* رسائل الطلب */}
      {orderMessage && (
        <div className="surplus-order-success">
          <span>{orderMessage}</span>
          <button onClick={() => setOrderMessage('')}>
            ×
          </button>
        </div>
      )}

      {orderError && (
        <div className="surplus-order-error">
          <span>{orderError}</span>
          <button onClick={() => setOrderError('')}>
            ×
          </button>
        </div>
      )}

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
              <article
                className="surplus-card"
                key={offer._id}
              >

                <div className="surplus-image">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                    />
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

                  {/* اختيار الكمية والطلب */}
                  <div className="surplus-order-controls">

                    <label>الكمية:</label>

                    <div className="surplus-quantity">

                      <button
                        type="button"
                        disabled={
                          (quantities[offer._id] || 1) <= 1
                        }
                        onClick={() =>
                          setQuantities(prev => ({
                            ...prev,
                            [offer._id]: Math.max(
                              1,
                              (prev[offer._id] || 1) - 1
                            )
                          }))
                        }
                      >
                        −
                      </button>

                      <span>
                        {quantities[offer._id] || 1}
                      </span>

                      <button
                        type="button"
                        disabled={
                          (quantities[offer._id] || 1) >=
                          offer.remainingQuantity
                        }
                        onClick={() =>
                          setQuantities(prev => ({
                            ...prev,
                            [offer._id]: Math.min(
                              offer.remainingQuantity,
                              (prev[offer._id] || 1) + 1
                            )
                          }))
                        }
                      >
                        +
                      </button>

                    </div>

                    <button
                      className="surplus-order-btn"
                      disabled={ordering === offer._id}
                      onClick={() => handleOrderOffer(offer)}
                    >
                      {ordering === offer._id
                        ? 'جاري الطلب...'
                        : 'اطلب العرض'}
                    </button>

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

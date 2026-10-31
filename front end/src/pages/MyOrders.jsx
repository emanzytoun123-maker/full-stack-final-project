
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../services/api'
import './MyOrders.css'

function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token')

        const response = await api.get('/orders/my', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        setOrders(response.data)
      } catch (err) {
        setError(
          err.response?.data?.message || 'تعذر تحميل طلباتك.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const getStatus = (status) => {
    const statuses = {
      pending: 'قيد الانتظار',
      accepted: 'تم قبول الطلب',
      ready: 'جاهز للاستلام',
      completed: 'مكتمل',
      cancelled: 'ملغي'
    }

    return statuses[status] || status
  }

  return (
    <>
      <Navbar />

      <main className="my-orders-page">

        <div className="my-orders-header">
          <span>طلباتك</span>
          <h1>طلباتي 🛒</h1>
          <p>تابع طلباتك واطّلع على آخر تحديثاتها.</p>
        </div>

        {loading && (
          <p className="my-orders-message">
            جاري تحميل طلباتك...
          </p>
        )}

        {error && (
          <p className="my-orders-error">{error}</p>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="my-orders-empty">
            <span>🛍️</span>
            <h2>لسه ما عندك طلبات!</h2>
<p>اكتشف المطاعم واطلب وجبتك المفضلة.</p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="my-orders-list">

            {orders.map(order => (
              <div className="my-order-card" key={order._id}>

                <div className="my-order-header">
                  <div>
                    <h3>
                      {order.restaurant?.name || 'مطعم'}
                    </h3>
                    <p>
                      رقم الطلب: #{order._id.slice(-6)}
                    </p>
                  </div>

                  <span className={`my-order-status status-${order.status}`}>
                    {getStatus(order.status)}
                  </span>
                </div>

                <div className="my-order-items">
                  {order.items?.map((item, index) => (
                    <div
                      className="my-order-item"
                      key={item._id || index}
                    >
                      <span>
                        {item.menuItem?.name || 'صنف'}
                      </span>

                      <span>
                        × {item.quantity}
                      </span>

                      <strong>
                        {(item.priceAtOrder * item.quantity).toFixed(2)} د.أ
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="my-order-total">
                  <span>المجموع الكلي</span>
                  <strong>{order.totalPrice} د.أ</strong>
                </div>

              </div>
            ))}

          </div>
        )}

      </main>

      <Footer />
    </>
  )
}

export default MyOrders

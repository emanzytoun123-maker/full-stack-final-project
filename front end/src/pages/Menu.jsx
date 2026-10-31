
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../services/api'
import './Menu.css'

function Menu() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('الكل')

  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderMessage, setOrderMessage] = useState('')
  const [orderError, setOrderError] = useState('')

  useEffect(() => {
    async function fetchMenu() {
      try {
        const [restaurantResponse, menuResponse] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/menu-items/restaurant/${id}`)
        ])

        setRestaurant(restaurantResponse.data)
        setMenuItems(menuResponse.data)
      } catch (err) {
        setError('تعذر تحميل قائمة الطعام.')
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [id])

  const categories = [
    'الكل',
    ...new Set(menuItems.map(item => item.category).filter(Boolean))
  ]

  const filteredItems = selectedCategory === 'الكل'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory)

  // Add item to cart
 
  // Get item from cart
const getCartItem = (itemId) => {
  return cart.find(item => item._id === itemId)
}
 // Add item to cart
const addToCart = (item) => {
  setCart(prev => {
    const existingItem = prev.find(
      cartItem => cartItem._id === item._id
    )

    if (existingItem) {
      return prev.map(cartItem =>
        cartItem._id === item._id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      )
    }

    return [...prev, { ...item, quantity: 1 }]
  })

  setOrderMessage(`تمت إضافة ${item.name} للسلة ✓`)
  setOrderError('')
}

  // Change item quantity
  const changeQuantity = (itemId, amount) => {
    setCart(prev =>
      prev
        .map(item =>
          item._id === itemId
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter(item => item.quantity > 0)
    )
  }

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item._id !== itemId))
  }

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  )

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  // Create order
  const handleCreateOrder = async () => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token) {
      navigate('/login')
      return
    }

    if (role !== 'consumer') {
      setOrderError('لازم تسجلي الدخول بحساب زبون لإرسال الطلب.')
      return
    }

    if (cart.length === 0) {
      setOrderError('السلة فارغة.')
      return
    }

    try {
      setOrderLoading(true)
      setOrderError('')
      setOrderMessage('')

      const orderData = {
        restaurant: id,
        items: cart.map(item => ({
          menuItem: item._id,
          quantity: item.quantity
        }))
      }

      await api.post('/orders', orderData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setCart([])
      setShowCart(false)
      setOrderMessage('تم إرسال طلبك بنجاح! 🎉')

    } catch (err) {
      setOrderError(
        err.response?.data?.message || 'تعذر إرسال الطلب، حاولي مرة ثانية.'
      )
    } finally {
      setOrderLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      <main className="menu-page">

        <div className="menu-header">
          <span>قائمة الطعام</span>
          <h1>{restaurant?.name || 'منيو المطعم'}</h1>
          <p>اكتشف الأصناف واختر ما يناسبك</p>
        </div>

        {loading && <p className="menu-message">جاري تحميل المنيو...</p>}
        {error && <p className="menu-message">{error}</p>}

        {!loading && !error && (
          <>
            <div className="menu-categories">
              {categories.map(category => (
                <button
                  key={category}
                  className={selectedCategory === category ? 'active' : ''}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {filteredItems.length === 0 ? (
              <p className="menu-message">
                لا توجد أصناف في هذه القائمة حاليًا.
              </p>
            ) : (
              <div className="menu-grid">
                {filteredItems.map(item => (
                  <div className="menu-card" key={item._id}>

                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="menu-no-image">🍽️</div>
                    )}

                    <div className="menu-card-content">
                      <h3>{item.name}</h3>
                      <p>{item.description || 'لا يوجد وصف لهذا الصنف.'}</p>

                      <div className="menu-card-footer">
                        <strong>{item.price} د.أ</strong>

                        <span className={item.isAvailable ? 'available' : 'unavailable'}>
                          {item.isAvailable ? 'متوفر' : 'غير متوفر'}
                        </span>
                      </div>
{!item.isAvailable ? (
  <button className="add-to-cart-btn" disabled>
    غير متوفر
  </button>
) : getCartItem(item._id) ? (
  <div className="menu-quantity-control">
    <button onClick={() => changeQuantity(item._id, -1)}>
      −
    </button>

    <span>{getCartItem(item._id).quantity}</span>

    <button onClick={() => changeQuantity(item._id, 1)}>
      +
    </button>
  </div>
) : (
  <button
    className="add-to-cart-btn"
    onClick={() => addToCart(item)}
  >
    + أضف للسلة
  </button>
)}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {orderMessage && (
          <p className="order-success-message">{orderMessage}</p>
        )}

      </main>

      {/* Floating Cart Button */}
      <button
        className="cart-floating-btn"
        onClick={() => {
          setShowCart(true)
          setOrderError('')
        }}
      >
        🛒 السلة
        <span>{cartCount}</span>
      </button>

      {/* Cart Modal */}
      {showCart && (
        <div
          className="cart-overlay"
          onClick={() => setShowCart(false)}
        >
          <div
            className="cart-modal"
            onClick={e => e.stopPropagation()}
          >

            <div className="cart-modal-header">
              <h2>🛒 سلة المشتريات</h2>

              <button onClick={() => setShowCart(false)}>
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="cart-empty">
                السلة فارغة، أضيفي بعض الأصناف أولًا.
              </p>
            ) : (
              <>
                <div className="cart-items">

                  {cart.map(item => (
                    <div className="cart-item" key={item._id}>

                      <div className="cart-item-info">
  {item.image ? (
    <img src={item.image} alt={item.name} />
  ) : (
    <div className="cart-item-no-image">🍽️</div>
  )}

  <div>
    <h3>{item.name}</h3>
    <p>{item.price} د.أ للصنف</p>
  </div>
</div>

                      <div className="cart-item-controls">

                        <button
                          onClick={() => changeQuantity(item._id, -1)}
                        >
                          -
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() => changeQuantity(item._id, 1)}
                        >
                          +
                        </button>

                      </div>

                      <strong>
                        {(item.price * item.quantity).toFixed(2)} د.أ
                      </strong>

  <button
  className="cart-remove-btn"
  onClick={() => removeFromCart(item._id)}
  title="حذف الصنف"
>
  🗑️
</button>

                    </div>
                  ))}

                </div>

                <div className="cart-total">
                  <span>المجموع:</span>
                  <strong>{cartTotal.toFixed(2)} د.أ</strong>
                </div>

                {orderError && (
                  <p className="menu-error">{orderError}</p>
                )}

                <button
                  className="checkout-btn"
                  onClick={handleCreateOrder}
                  disabled={orderLoading}
                >
                  {orderLoading
                    ? 'جاري إرسال الطلب...'
                    : 'تأكيد الطلب'}
                </button>

              </>
            )}

            {cart.length === 0 && orderError && (
              <p className="menu-error">{orderError}</p>
            )}

          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

export default Menu

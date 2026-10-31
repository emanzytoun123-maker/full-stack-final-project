
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../services/api'
import './Menu.css'

function Menu() {
  const { id } = useParams()

  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('الكل')

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
              <p className="menu-message">لا توجد أصناف في هذه القائمة حاليًا.</p>
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  )
}

export default Menu

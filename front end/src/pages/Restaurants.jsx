import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getRestaurants } from '../services/api'
import { Link } from 'react-router-dom'
import './Restaurants.css'

function Restaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('الكل')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const data = await getRestaurants()
        setRestaurants(data)
      } catch (err) {
        setError('تعذر تحميل المطاعم. تأكدي أن الباك إند يعمل.')
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [])

  const filteredRestaurants = restaurants.filter((restaurant) => {
    return restaurant.name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <>
      <Navbar />

      <main className="restaurants-page">
        <div className="restaurants-heading">
          <h1>اكتشف المطاعم 🍽️</h1>
          <p>اختار مطعمك المفضل واكتشف أشهى الخيارات.</p>
        </div>

        <div className="restaurants-filters">
          <input
            type="text"
            placeholder="ابحث عن مطعم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="category-buttons">
            {['الكل', 'وجبات سريعة', 'بيتزا', 'برغر', 'حلويات'].map((item) => (
              <button
                key={item}
                className={category === item ? 'active' : ''}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="restaurants-results">
          <h2>المطاعم</h2>

          {loading && <p>جاري تحميل المطاعم...</p>}

          {error && <p>{error}</p>}

          {!loading && !error && filteredRestaurants.length === 0 && (
            <p>ما لقينا مطاعم مطابقة لبحثك.</p>
          )}

          <div className="restaurants-grid">
            {filteredRestaurants.map((restaurant) => (
              <Link
  to={`/restaurants/${restaurant._id}`}
  className="restaurant-card"
  key={restaurant._id}
>
  <div className="restaurant-card-icon">🍽️</div>

  <h3>{restaurant.name}</h3>

  <p>📍 {restaurant.city}</p>

  <p>
    {restaurant.crowdLevel === 'high' ? '🔴 مزدحم' : '🟢 غير مزدحم'}
  </p>

  <p>⏱️ وقت الانتظار: {restaurant.waitTimeMinutes} دقيقة</p>

  <span className="restaurant-details-btn">عرض المطعم ←</span>
</Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default Restaurants
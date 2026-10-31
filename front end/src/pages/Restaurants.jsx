
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getRestaurants, getNearbyRestaurants } from '../services/api'
import { Link } from 'react-router-dom'
import './Restaurants.css'

function Restaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [nearbyRestaurants, setNearbyRestaurants] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('الكل')
  const [loading, setLoading] = useState(true)
  const [loadingNearby, setLoadingNearby] = useState(false)
  const [error, setError] = useState('')
  const [locationError, setLocationError] = useState('')

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

  const handleNearbyRestaurants = () => {
    if (nearbyRestaurants !== null) {
      setNearbyRestaurants(null)
      setLocationError('')
      return
    }

    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع.')
      return
    }

    setLoadingNearby(true)
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          const data = await getNearbyRestaurants(latitude, longitude)

          setNearbyRestaurants(data)
        } catch (err) {
          setLocationError('تعذر تحميل المطاعم القريبة. حاولي مرة ثانية.')
        } finally {
          setLoadingNearby(false)
        }
      },
      () => {
        setLocationError('لم يتم السماح بالوصول للموقع. ما زالت كل المطاعم ظاهرة.')
        setLoadingNearby(false)
      }
    )
  }

  const displayedRestaurants = nearbyRestaurants ?? restaurants

  const filteredRestaurants = displayedRestaurants.filter((restaurant) => {
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

          <button
  className="location-btn"
  type="button"
  onClick={handleNearbyRestaurants}
  disabled={loadingNearby}
>
  {loadingNearby
    ? 'جاري تحديد موقعك...'
    : nearbyRestaurants !== null
      ? 'عرض كل المطاعم'
      : '📍 المطاعم القريبة مني'}
</button>

          {locationError && <p>{locationError}</p>}

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
          <h2>
            {nearbyRestaurants !== null
              ? 'المطاعم القريبة منك'
              : 'كل المطاعم'}
          </h2>

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
                  {restaurant.crowdLevel === 'high'
                    ? '🔴 مزدحم'
                    : '🟢 غير مزدحم'}
                </p>

                <p>⏱️ وقت الانتظار: {restaurant.waitTimeMinutes} دقيقة</p>

                <span className="restaurant-details-btn">
                  عرض المطعم ←
                </span>
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

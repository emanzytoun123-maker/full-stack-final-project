
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Register.css'

function Register() {
  const navigate = useNavigate()

  const [role, setRole] = useState('consumer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [restaurantInfo, setRestaurantInfo] = useState({
    name: '',
    city: '',
    area: '',
    address: '',
    phone: '',
    description: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRestaurantChange = (e) => {
    setRestaurantInfo({
      ...restaurantInfo,
      [e.target.name]: e.target.value
    })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const userData = {
        name,
        email,
        password,
        role
      }

      if (role === 'restaurant') {
        const position = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('المتصفح لا يدعم تحديد الموقع.'))
            return
          }

          navigator.geolocation.getCurrentPosition(
            resolve,
            () => reject(
              new Error('لازم تسمحي بالوصول لموقعك لتسجيل المطعم.')
            )
          )
        })

        userData.restaurantInfo = {
          ...restaurantInfo,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      }

      await api.post('/users/register', userData)

      setSuccess(true)

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'حدث خطأ أثناء إنشاء الحساب.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">طلعتنا</Link>

        <h1>انضم لعيلتنا! 🎉</h1>
        <p>أنشئ حسابك وخلّي طلعتك الجاية أحلى.</p>

        <form onSubmit={handleRegister}>
          <label htmlFor="role">نوع الحساب</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="consumer">مستخدم عادي</option>
            <option value="restaurant">صاحب مطعم</option>
          </select>

          <label htmlFor="name">الاسم الكامل</label>
          <input
            type="text"
            id="name"
            placeholder="أدخل اسمك"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="email">البريد الإلكتروني</label>
          <input
            type="email"
            id="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">كلمة المرور</label>
          <input
            type="password"
            id="password"
            placeholder="أنشئ كلمة مرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {role === 'restaurant' && (
            <>
              <h3>معلومات المطعم</h3>

              <label htmlFor="restaurantName">اسم المطعم</label>
              <input
                type="text"
                id="restaurantName"
                name="name"
                placeholder="اسم المطعم"
                value={restaurantInfo.name}
                onChange={handleRestaurantChange}
                required
              />

              <label htmlFor="city">المدينة</label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="مثلاً: عمّان"
                value={restaurantInfo.city}
                onChange={handleRestaurantChange}
                required
              />

              <label htmlFor="area">المنطقة</label>
              <input
                type="text"
                id="area"
                name="area"
                placeholder="المنطقة"
                value={restaurantInfo.area}
                onChange={handleRestaurantChange}
              />

              <label htmlFor="address">العنوان</label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="عنوان المطعم"
                value={restaurantInfo.address}
                onChange={handleRestaurantChange}
              />

              <label htmlFor="phone">رقم الهاتف</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="رقم المطعم"
                value={restaurantInfo.phone}
                onChange={handleRestaurantChange}
              />

              <label htmlFor="description">وصف المطعم</label>
              <textarea
                id="description"
                name="description"
                placeholder="اكتب وصفًا مختصرًا للمطعم"
                value={restaurantInfo.description}
                onChange={handleRestaurantChange}
              />

              <p>
                📍 سنطلب إذن الوصول لموقعك لتحديد موقع المطعم على الخريطة.
              </p>
            </>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>

        <p>
          عندك حساب؟ <Link to="/login">سجّل دخولك</Link>
        </p>
      </div>

      {success && (
        <div className="success-overlay">
          <div className="success-popup">
            <div className="success-icon">✓</div>

            <h2>تم إنشاء حسابك بنجاح!</h2>

            <p>أهلًا فيك بعيلة طلعتنا ❤️</p>
            <p>حسابك صار جاهز، سجّل دخولك وابدأ رحلتك معنا.</p>

            <button onClick={() => navigate('/login')}>
              الانتقال لتسجيل الدخول
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default Register


import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../services/api'
import './RestaurantDashboard.css'

function RestaurantDashboard() {
  const navigate = useNavigate()

  const [activeSection, setActiveSection] = useState('dashboard')
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [orders, setOrders] = useState([])

  const [loading, setLoading] = useState(true)
  const [menuLoading, setMenuLoading] = useState(false)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  const [error, setError] = useState('')
  const [menuError, setMenuError] = useState('')
  const [ordersError, setOrdersError] = useState('')
  const [success, setSuccess] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState(null)

  // Menu form
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    image: '',
    isAvailable: true
  })

  // Restaurant profile form
  const [profileData, setProfileData] = useState({
    name: '',
    city: '',
    area: '',
    address: '',
    phone: '',
    description: ''
  })

  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  const token = localStorage.getItem('token')

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }

  // Fetch restaurant menu
  const fetchMenu = async (restaurantId) => {
    try {
      setMenuLoading(true)

      const response = await api.get(
        `/menu-items/restaurant/${restaurantId}`
      )

      setMenuItems(response.data)
      setMenuError('')
    } catch (err) {
      setMenuError('تعذر تحميل أصناف المنيو.')
    } finally {
      setMenuLoading(false)
    }
  }

  // Fetch restaurant orders
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true)
      setOrdersError('')

      const response = await api.get(
        '/orders/restaurant',
        authConfig
      )

      const data = response.data

      setOrders(
        Array.isArray(data) ? data : data.orders || []
      )
    } catch (err) {
      setOrdersError(
        err.response?.data?.message || 'تعذر تحميل الطلبات.'
      )
    } finally {
      setOrdersLoading(false)
    }
  }

  // Update order status
  const handleOrderStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId)
      setOrdersError('')

      await api.patch(
        `/orders/${orderId}/status`,
        { status },
        authConfig
      )

      await fetchOrders()
    } catch (err) {
      setOrdersError(
        err.response?.data?.message || 'تعذر تحديث حالة الطلب.'
      )
    } finally {
      setUpdatingOrderId(null)
    }
  }

  // Fetch restaurant information
  useEffect(() => {
    const fetchMyRestaurant = async () => {
      try {
        const response = await api.get('/restaurants/my', authConfig)

        const data = response.data

        setRestaurant(data)

        setProfileData({
          name: data.name || '',
          city: data.city || '',
          area: data.area || '',
          address: data.address || '',
          phone: data.phone || '',
          description: data.description || ''
        })

        await fetchMenu(data._id)
        await fetchOrders()

      } catch (err) {
        setError(
          err.response?.data?.message || 'تعذر تحميل بيانات المطعم'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchMyRestaurant()
  }, [])

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('role')
    navigate('/login')
  }

  // Dashboard sections
  const sections = [
    { id: 'dashboard', icon: '📊', label: 'الرئيسية' },
    { id: 'menu', icon: '🍽️', label: 'إدارة المنيو' },
    { id: 'orders', icon: '🛒', label: 'الطلبات' },
    { id: 'reservations', icon: '📅', label: 'الحجوزات' },
    { id: 'offers', icon: '🏷️', label: 'العروض' },
    { id: 'profile', icon: '⚙️', label: 'بيانات المطعم' }
  ]

  // Open section
  const openSection = (section) => {
    setActiveSection(section)
    setMenuError('')
    setSuccess('')
    setProfileError('')
    setProfileSuccess('')
    setOrdersError('')

    if (section === 'orders') {
      fetchOrders()
    }
  }

  // Reset menu form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      image: '',
      isAvailable: true
    })

    setEditingId(null)
    setShowForm(false)
  }

  // Handle menu form inputs
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Add or update menu item
  const handleSubmit = async (e) => {
    e.preventDefault()

    setMenuError('')
    setSuccess('')

    const itemData = {
      ...formData,
      price: Number(formData.price)
    }

    try {
      if (editingId) {
        await api.patch(
          `/menu-items/${editingId}`,
          itemData,
          authConfig
        )

        setSuccess('تم تعديل الصنف بنجاح.')
      } else {
        await api.post('/menu-items', itemData, authConfig)

        setSuccess('تمت إضافة الصنف بنجاح.')
      }

      await fetchMenu(restaurant._id)
      resetForm()

    } catch (err) {
      setMenuError(
        err.response?.data?.message || 'حدث خطأ أثناء حفظ الصنف.'
      )
    }
  }

  // Edit menu item
  const handleEdit = (item) => {
    setFormData({
      name: item.name || '',
      description: item.description || '',
      category: item.category || '',
      price: item.price ?? '',
      image: item.image || '',
      isAvailable: item.isAvailable ?? true
    })

    setEditingId(item._id)
    setShowForm(true)
    setMenuError('')
    setSuccess('')
  }

  // Delete menu item
  const handleDelete = async () => {
    try {
      setMenuError('')
      setSuccess('')

      await api.delete(
        `/menu-items/${selectedItemId}`,
        authConfig
      )

      await fetchMenu(restaurant._id)

      setSuccess('تم حذف الصنف بنجاح.')

    } catch (err) {
      setMenuError(
        err.response?.data?.message || 'تعذر حذف الصنف.'
      )
    } finally {
      setShowDeleteModal(false)
      setSelectedItemId(null)
    }
  }

  // Handle restaurant profile inputs
  const handleProfileChange = (e) => {
    const { name, value } = e.target

    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Update restaurant profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault()

    setProfileError('')
    setProfileSuccess('')
    setProfileLoading(true)

    try {
      const response = await api.patch(
        '/restaurants/my',
        profileData,
        authConfig
      )

      setRestaurant(response.data.restaurant)

      setProfileSuccess('تم تحديث بيانات المطعم بنجاح!')

    } catch (err) {
      setProfileError(
        err.response?.data?.message ||
        'حدث خطأ أثناء تحديث بيانات المطعم.'
      )
    } finally {
      setProfileLoading(false)
    }
  }

  // Order status in Arabic
  const getOrderStatus = (status) => {
    const statuses = {
      pending: 'قيد الانتظار',
      accepted: 'تم قبول الطلب',
      ready: 'جاهز للاستلام',
      completed: 'مكتمل',
      cancelled: 'ملغي'
    }

    return statuses[status] || status
  }

  // Next action for each order
  const getNextOrderAction = (status) => {
    const actions = {
      pending: {
        label: 'قبول الطلب',
        nextStatus: 'accepted'
      },
      accepted: {
        label: 'تجهيز الطلب',
        nextStatus: 'ready'
      },
      ready: {
        label: 'إكمال الطلب',
        nextStatus: 'completed'
      }
    }

    return actions[status]
  }

  return (
    <div className="dashboard-layout">

      {/* Sidebar */}
      <aside className="dashboard-sidebar">

        <div className="dashboard-logo">
          <span>طلعتنا</span>
          <div>ط</div>
        </div>

        <p className="sidebar-title">لوحة التحكم</p>

        <nav className="dashboard-nav">
          {sections.map(section => (
            <button
              key={section.id}
              className={
                activeSection === section.id ? 'active' : ''
              }
              onClick={() => openSection(section.id)}
            >
              <span>{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>

        <button
          className="dashboard-logout"
          onClick={handleLogout}
        >
          ↪ تسجيل الخروج
        </button>

      </aside>

      {/* Main Content */}
      <main className="dashboard-main">

        <header className="dashboard-header">
          <div>
            <h1>
              {
                sections.find(
                  section => section.id === activeSection
                )?.label
              }
            </h1>

            <p>
              {restaurant
                ? `مرحبًا بك في ${restaurant.name} 👋`
                : 'مرحبًا بك في لوحة تحكم مطعمك 👋'}
            </p>
          </div>

          <div className="dashboard-user-icon">🍽️</div>
        </header>

        {/* Loading */}
        {loading && (
          <section className="dashboard-content">
            <p>جاري تحميل بيانات المطعم...</p>
          </section>
        )}

        {/* Error */}
        {error && !loading && (
          <section className="dashboard-content">
            <p className="menu-error">{error}</p>
          </section>
        )}

        {/* Dashboard Home */}
        {!loading &&
          !error &&
          activeSection === 'dashboard' && (

            <section className="dashboard-content">

              <div className="dashboard-welcome">
                <h2>
                  أهلاً بك في {restaurant?.name || 'طلعتنا'}!
                </h2>

                <p>
                  {restaurant?.city
                    ? `مطعمك موجود في ${restaurant.city}.`
                    : 'من هنا بتقدر تدير مطعمك وتتابع نشاطه.'}
                </p>
              </div>

              <div className="dashboard-stats">

                <button
                  className="dashboard-stat-card clickable-stat"
                  onClick={() => openSection('orders')}
                >
                  <span>🛒</span>
                  <h3>الطلبات</h3>
                  <strong>{orders.length}</strong>
                </button>

                <button
                  className="dashboard-stat-card clickable-stat"
                  onClick={() => openSection('menu')}
                >
                  <span>🍽️</span>
                  <h3>أصناف المنيو</h3>
                  <strong>{menuItems.length}</strong>
                </button>

                <button
                  className="dashboard-stat-card clickable-stat"
                  onClick={() => openSection('reservations')}
                >
                  <span>📅</span>
                  <h3>الحجوزات</h3>
                  <strong>0</strong>
                </button>

              </div>

            </section>
          )}

        {/* Menu Management */}
        {!loading &&
          !error &&
          activeSection === 'menu' && (

            <section className="dashboard-content">

              <div className="menu-management">

                <div className="menu-management-header">

                  <div>
                    <h2>إدارة المنيو 🍽️</h2>
                    <p>
                      أضيفي وعدّلي الأصناف الخاصة بمطعمك.
                    </p>
                  </div>

                  <button
                    className="menu-add-btn"
                    onClick={() => {
                      resetForm()
                      setShowForm(true)
                      setMenuError('')
                      setSuccess('')
                    }}
                  >
                    + إضافة صنف
                  </button>

                </div>

                {menuError && (
                  <p className="menu-error">{menuError}</p>
                )}

                {success && (
                  <p className="menu-success">{success}</p>
                )}

                {/* Add / Edit Form */}
                {showForm && (

                  <form
                    className="menu-form"
                    onSubmit={handleSubmit}
                  >

                    <h3>
                      {editingId
                        ? 'تعديل الصنف'
                        : 'إضافة صنف جديد'}
                    </h3>

                    <div className="menu-form-grid">

                      <div className="menu-form-group">
                        <label>اسم الصنف *</label>

                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          placeholder="مثلاً: برغر لحم"
                          required
                        />
                      </div>

                      <div className="menu-form-group">
                        <label>السعر (دينار) *</label>

                        <input
                          name="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={handleFormChange}
                          placeholder="مثلاً: 3.5"
                          required
                        />
                      </div>

                      <div className="menu-form-group">
                        <label>التصنيف</label>

                        <input
                          name="category"
                          value={formData.category}
                          onChange={handleFormChange}
                          placeholder="مثلاً: وجبات رئيسية"
                        />
                      </div>

                      <div className="menu-form-group">
                        <label>رابط الصورة</label>

                        <input
                          name="image"
                          type="url"
                          value={formData.image}
                          onChange={handleFormChange}
                          placeholder="https://..."
                        />
                      </div>

                      <div className="menu-form-group full-width">
                        <label>الوصف</label>

                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleFormChange}
                          placeholder="اكتبي وصفًا مختصرًا للصنف..."
                        />
                      </div>

                    </div>

                    <label className="menu-availability">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleFormChange}
                      />

                      الصنف متوفر حاليًا
                    </label>

                    <div className="menu-form-actions">

                      <button
                        type="submit"
                        className="menu-submit-btn"
                      >
                        {editingId
                          ? 'حفظ التعديلات'
                          : 'إضافة الصنف'}
                      </button>

                      <button
                        type="button"
                        className="menu-cancel-btn"
                        onClick={resetForm}
                      >
                        إلغاء
                      </button>

                    </div>

                  </form>
                )}

                {/* Menu Items */}
                {menuLoading ? (

                  <p className="menu-message">
                    جاري تحميل الأصناف...
                  </p>

                ) : menuItems.length === 0 ? (

                  <p className="menu-empty">
                    لسه ما أضفتي أي أصناف للمنيو.
                  </p>

                ) : (

                  <div className="menu-items-grid">

                    {menuItems.map(item => (

                      <div
                        className="menu-admin-card"
                        key={item._id}
                      >

                        <h3>{item.name}</h3>

                        {item.description && (
                          <p>{item.description}</p>
                        )}

                        {item.category && (
                          <p>التصنيف: {item.category}</p>
                        )}

                        <div className="menu-admin-price">
                          {item.price} د.أ
                        </div>

                        <span
                          className={`menu-admin-status ${
                            item.isAvailable
                              ? 'available'
                              : 'unavailable'
                          }`}
                        >
                          {item.isAvailable
                            ? 'متوفر'
                            : 'غير متوفر'}
                        </span>

                        <div className="menu-admin-actions">

                          <button
                            className="menu-edit-btn"
                            onClick={() => handleEdit(item)}
                          >
                            تعديل
                          </button>

                          <button
                            className="menu-delete-btn"
                            onClick={() => {
                              setSelectedItemId(item._id)
                              setShowDeleteModal(true)
                            }}
                          >
                            حذف
                          </button>

                        </div>

                      </div>

                    ))}

                  </div>
                )}

              </div>

            </section>
          )}

        {/* Orders Management */}
        {!loading &&
          !error &&
          activeSection === 'orders' && (

            <section className="dashboard-content">

              <div className="orders-management">

                <div className="orders-header">
                  <div>
                    <h2>🛒 إدارة الطلبات</h2>
                    <p>تابعي طلبات الزبائن وحدّثي حالتها.</p>
                  </div>

                  <button
                    className="orders-refresh-btn"
                    onClick={fetchOrders}
                    disabled={ordersLoading}
                  >
                    ↻ تحديث الطلبات
                  </button>
                </div>

                {ordersError && (
                  <p className="menu-error">{ordersError}</p>
                )}

                {ordersLoading ? (

                  <p className="orders-message">
                    جاري تحميل الطلبات...
                  </p>

                ) : orders.length === 0 ? (

                  <div className="orders-empty">
                    <span>🛒</span>
                    <h3>ما في طلبات حاليًا</h3>
                    <p>لما يوصل طلب جديد رح يظهر هون.</p>
                  </div>

                ) : (

                  <div className="orders-list">

                    {orders.map(order => {
                      const action = getNextOrderAction(order.status)

                      return (
                        <div
                          className="order-card"
                          key={order._id}
                        >

                          <div className="order-card-header">

                            <div>
                              <h3>
                                طلب #{order._id.slice(-6)}
                              </h3>

                              <p>
                                الزبون: {order.consumer?.name || 'غير معروف'}
                              </p>
                            </div>

                            <span
                              className={`order-status status-${order.status}`}
                            >
                              {getOrderStatus(order.status)}
                            </span>

                          </div>

                          <div className="order-items">

                            <h4>الأصناف المطلوبة:</h4>

                            {order.items?.map((item, index) => (

                              <div
                                className="order-item-row"
                                key={item._id || index}
                              >
                                <span>
                                  {item.menuItem?.name || 'صنف محذوف'}
                                </span>

                                <span>
                                  الكمية: {item.quantity}
                                </span>

                                <span>
                                  {item.priceAtOrder} د.أ
                                </span>
                              </div>

                            ))}

                          </div>

                          <div className="order-card-footer">

                            <strong>
                              المجموع: {order.totalPrice} د.أ
                            </strong>

                            {action && (
                              <button
                                className="order-action-btn"
                                disabled={updatingOrderId === order._id}
                                onClick={() => handleOrderStatus(
                                  order._id,
                                  action.nextStatus
                                )}
                              >
                                {updatingOrderId === order._id
                                  ? 'جاري التحديث...'
                                  : action.label}
                              </button>
                            )}

                          </div>

                        </div>
                      )
                    })}

                  </div>
                )}

              </div>

            </section>
          )}

        {/* Restaurant Profile */}
        {!loading &&
          !error &&
          activeSection === 'profile' && (

            <section className="dashboard-content">

              <div className="profile-management">

                <div className="profile-header">
                  <h2>⚙️ بيانات المطعم</h2>
                  <p>
                    عدّلي معلومات مطعمك، وسيتم حفظ التغييرات مباشرة.
                  </p>
                </div>

                {profileError && (
                  <p className="menu-error">{profileError}</p>
                )}

                <form onSubmit={handleProfileSubmit}>

                  <div className="profile-form-grid">

                    <div className="profile-form-group">
                      <label>اسم المطعم *</label>

                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        placeholder="اسم المطعم"
                        required
                      />
                    </div>

                    <div className="profile-form-group">
                      <label>المدينة *</label>

                      <input
                        type="text"
                        name="city"
                        value={profileData.city}
                        onChange={handleProfileChange}
                        placeholder="المدينة"
                        required
                      />
                    </div>

                    <div className="profile-form-group">
                      <label>المنطقة</label>

                      <input
                        type="text"
                        name="area"
                        value={profileData.area}
                        onChange={handleProfileChange}
                        placeholder="المنطقة"
                      />
                    </div>

                    <div className="profile-form-group">
                      <label>رقم الهاتف</label>

                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        placeholder="رقم الهاتف"
                      />
                    </div>

                    <div className="profile-form-group full-width">
                      <label>العنوان</label>

                      <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleProfileChange}
                        placeholder="العنوان بالتفصيل"
                      />
                    </div>

                    <div className="profile-form-group full-width">
                      <label>وصف المطعم</label>

                      <textarea
                        name="description"
                        value={profileData.description}
                        onChange={handleProfileChange}
                        placeholder="اكتبي وصفًا مختصرًا عن مطعمك..."
                      />
                    </div>

                  </div>

                  <div className="profile-form-actions">

                    <button
                      type="submit"
                      className="profile-save-btn"
                      disabled={profileLoading}
                    >
                      {profileLoading
                        ? 'جاري الحفظ...'
                        : '💾 حفظ التعديلات'}
                    </button>

                  </div>

                </form>

              </div>

            </section>
          )}

        {/* Other Sections */}
        {!loading &&
          !error &&
          activeSection !== 'dashboard' &&
          activeSection !== 'menu' &&
          activeSection !== 'orders' &&
          activeSection !== 'profile' && (

            <section className="dashboard-content">

              <div className="dashboard-welcome">
                <h2>
                  {
                    sections.find(
                      section => section.id === activeSection
                    )?.label
                  }
                </h2>

                <p>
                  سنجهز هذا القسم ونربطه بالباك إند في الخطوات القادمة.
                </p>
              </div>

            </section>
          )}

        {/* Custom Delete Confirmation Modal */}
        {showDeleteModal && (

          <div className="delete-modal-overlay">

            <div className="delete-modal">

              <div className="delete-modal-icon">
                🗑️
              </div>

              <h2>تأكيد الحذف</h2>

              <p>
                متأكدة إنك بدك تحذفي هذا الصنف؟
              </p>

              <div className="delete-modal-actions">

                <button
                  className="delete-confirm-btn"
                  onClick={handleDelete}
                >
                  نعم، احذف
                </button>

                <button
                  className="delete-cancel-btn"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedItemId(null)
                  }}
                >
                  إلغاء
                </button>

              </div>

            </div>

          </div>
        )}

        {/* Profile Save Success Popup */}
        {profileSuccess && (

          <div className="success-modal-overlay">
            <div className="success-modal">

              <div className="success-modal-icon">
                ✓
              </div>

              <h2>تم الحفظ بنجاح!</h2>

              <p>
                تم تحديث بيانات المطعم وحفظ التعديلات بنجاح.
              </p>

              <button
                onClick={() => setProfileSuccess('')}
              >
                حسنًا
              </button>

            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default RestaurantDashboard

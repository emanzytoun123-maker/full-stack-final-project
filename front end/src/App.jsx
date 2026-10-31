
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Restaurants from './pages/Restaurants'
import RestaurantDetails from './pages/RestaurantDetails'
import Menu from './pages/Menu'
import RestaurantDashboard from './pages/RestaurantDashboard'
import MyOrders from './pages/MyOrders'
import SurplusOffers from './pages/SurplusOffers'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/restaurants" element={<Restaurants />} />
      <Route path="/restaurants/:id" element={<RestaurantDetails />} />
      <Route path="/restaurants/:id/menu" element={<Menu />} />
      <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/surplus-offers" element={<SurplusOffers />} />
    </Routes>
  )
}

export default App

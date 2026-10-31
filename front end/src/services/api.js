import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000',
})

export const getRestaurants = async () => {
  const response = await api.get('/restaurants')
  return response.data
}

export const getNearbyRestaurants = async (latitude, longitude) => {
  const response = await api.get('/restaurants/nearby', {
    params: {
      latitude,
      longitude
    }
  })

  return response.data
}

export default api
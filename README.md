# Tal3etna | طلعتنا

A Full-Stack Restaurant Platform

## 📌 About the Project

**Tal3etna** is a full-stack web application designed to connect customers with restaurants through a single platform.

The platform provides users with an easy way to explore restaurants, browse menus, place food orders, discover discounted surplus food offers, and reserve tables.

Tal3etna also helps restaurant owners manage their restaurants, menu items, orders, and reservations through a dedicated dashboard.

## 🎯 Project Objectives

- Provide a convenient platform for discovering restaurants.
- Simplify the food ordering process.
- Help reduce food waste through discounted surplus food offers.
- Make restaurant table reservations easier.
- Provide restaurant owners with tools to manage their services.

## ✨ Main Features

### Customer Features
- User registration and login.
- Browse available restaurants.
- View restaurant details and menus.
- Add menu items to the cart and place orders.
- View and track personal orders.
- Browse discounted surplus food offers.
- Place orders for surplus offers.
- Make table reservations.
- View personal reservations.

### Restaurant Owner Features
- Restaurant owner registration and login.
- Access a dedicated restaurant dashboard.
- Manage restaurant menu items.
- View incoming customer orders.
- Update order statuses.
- Manage table reservation requests.

## 🛠️ Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Bootstrap

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

## 🏗️ Project Structure

The project is organized into two main folders:

```text
Tal3etna/
│
├── front end/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── package.json
│
├── back end/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── seedRoles.js
│   └── package.json
│
└── README.md
```

*Note: The structure above describes the main organization of the project. Folder and file names may vary according to the final repository.*

## ⚙️ Installation and Setup

### Prerequisites
- Node.js and npm
- MongoDB database
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/emanzytoun123-maker/full-stack-final-project.git
```

### 2. Backend Setup

```bash
cd "back end"
npm install
```

Create a `.env` file inside the backend folder and configure the required environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend server:

```bash
npm start
```

If the project uses a different start script, use the corresponding script defined in `package.json`.

### 3. Frontend Setup

Open another terminal:

```bash
cd "front end"
npm install
```

Configure the frontend API base URL to point to the backend server.

Start the development server:

```bash
npm run dev
```

Open the local URL provided by Vite in your browser.

## 🌐 Deployment

**Live Website:**

https://full-stack-pro.netlify.app

**Backend API:**

https://full-stack-final-project-hj6o.onrender.com

## 🗄️ Database

Tal3etna uses MongoDB to store application data.

The database includes collections for:

- Users
- Roles
- Restaurants
- Menu Items
- Orders
- Surplus Offers
- Table Reservations
- Notifications
- Outings

## 👥 Team Members

- [Member 1 Name]
- [Member 2 Name]
- [Member 3 Name]

## 📌 Future Improvements

- Enhance the user experience and interface.
- Add more restaurant management features.
- Improve notifications and order tracking.
- Expand the platform with additional services.

---

**Tal3etna – Making every outing easier!**
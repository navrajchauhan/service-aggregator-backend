# Service Aggregator Platform

A full-stack web application that connects **service providers** (caterers, florists, photographers, etc.) with **consumers** looking to book services.

Providers can manage their services and availability, while consumers can browse and book services for specific dates.

---

## Features

### For Consumers
- Register / Login
- Browse all available services
- Filter services by type
- Book a service for a specific date
- View booking status (Pending / Confirmed / Cancelled)

### For Providers
- Register / Login as Provider
- Add, Edit, and Delete services
- Manage blocked/booked dates
- View incoming booking requests
- Confirm or Cancel bookings
- When a booking is confirmed, that date is automatically blocked

---

## Tech Stack

**Frontend**
- React.js
- React Router
- Axios
- Context API (for authentication)

**Backend**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

---

## Project Structure
service-aggregator-backend/          ← Main repository
├── service-aggregator-backend/      ← Backend (Node + Express)
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── package.json
│
└── service-aggregator-frontend/     ← Frontend (React)
├── src/
│   ├── components/
│   ├── context/
│   └── App.js
└── package.json



## How to Run Locally

### 1. Backend Setup

**(in terminal)**
bash
cd service-aggregator-backend
npm install


## Create a .env file inside service-aggregator-backend folder:
env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000

Start the backend:
Bash
npm run dev
Backend will run on: http://localhost:5000

2. Frontend Setup
Open a new terminal:
Bash
cd service-aggregator-frontend
npm install
npm start
Frontend will run on: http://localhost:3000

**API Endpoints**
Auth

POST /api/auth/register
POST /api/auth/login

Services

GET    /api/services
POST   /api/services (Provider only)
PUT    /api/services/:id (Owner only)
DELETE /api/services/:id (Owner only)
GET    /api/services/my-services (Provider only)
POST   /api/services/:id/block-date
DELETE /api/services/:id/block-date/:dateId

Bookings

POST   /api/bookings (Consumer only)
GET    /api/bookings/my-bookings
PATCH  /api/bookings/:id/status (Provider only)


Future Improvements

Better UI/UX design
Service detail page
Image upload for services
Ratings & Reviews
Email notifications
Payment integration
Search & advanced filters


Author
Navraj Chauhan


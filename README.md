# 🎬 PixelWit -- Freelance Platform

PixelWit is a full-stack freelance platform designed to connect
**clients** with **video editors**. Clients can post work requests, and
editors can accept, negotiate, and deliver projects seamlessly.

------------------------------------------------------------------------

## Features

### Authentication

-   User signup & login (Client / Editor / Admin)
-   Persistent login using localStorage
-   Role-based access control

### Client Features

-   Browse editors
-   View editor profiles
-   Create & manage work requests
-   Edit or delete requests
-   Track request status
-   Make payments

### Editor Features

-   View incoming requests
-   Accept / Reject / Negotiate offers
-   Update profile (skills, availability, etc.)
-   Upload deliverables

### Admin Features

-   View site analytics
-   Manage users (block, delete, change roles, etc.)

------------------------------------------------------------------------

## 🛠️ Tech Stack

### Frontend

-   React.js
-   React Router
-   Bootstrap (UI styling)
-   Context API (State Management)

### Backend

-   Node.js
-   Express.js
-   MongoDB Atlas(Mongoose)


------------------------------------------------------------------------

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

``` bash
git clone https://github.com/your-username/pixelwit.git
cd pixelwit
```

### 2️⃣ Setup Backend

``` bash
cd backend
npm install
npm start
```

### 3️⃣ Setup Frontend

``` bash
npm install
npm start
```

------------------------------------------------------------------------

## 🔐 Authentication Flow

-   Signup → User stored in database\
-   Login → User stored in context + localStorage\
-   Protected routes based on user role

------------------------------------------------------------------------

## 📌 Future Improvements

-   JWT Authentication
-   Payment gateway integration (Stripe/Razorpay)
-   Advanced UI with dark mode toggle
-   Real-time notifications
-   Messaging/chat system

------------------------------------------------------------------------

## 🧠 Learnings

-   Built a full MERN stack application\
-   Implemented role-based routing\
-   Managed global state using Context API\
-   Designed real-world freelance workflow

------------------------------------------------------------------------

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repo and submit a pull
request.

------------------------------------------------------------------------

## 📧 Contact

If you have any questions or suggestions, feel free to reach out.

------------------------------------------------------------------------

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!

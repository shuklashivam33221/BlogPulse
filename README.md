# 📝 BlogPulse — RESTful Blog Platform API

A secure, scalable RESTful API for a blog platform built with **Node.js**, **Express 5**, and **MongoDB**. Features JWT-based authentication, role-aware authorization, full CRUD operations for posts and comments, and request validation middleware.

> **Live Repo:** [github.com/shuklashivam33221/BlogPulse](https://github.com/shuklashivam33221/BlogPulse)

---

## 🚀 Features

- **User Authentication** — Secure signup/login with bcrypt password hashing and JWT token-based sessions
- **Authorization Middleware** — Route-level protection ensuring only authenticated users can create, edit, or delete resources
- **Blog Post CRUD** — Create, read, update, and delete blog posts with author ownership validation
- **Comment System** — Nested comment support tied to posts and users with full CRUD operations
- **Input Validation** — Request body/param validation using `express-validator` to prevent malformed data
- **Modular Architecture** — Clean separation of concerns with dedicated routes, controllers, models, middleware, and config layers
- **CORS Configuration** — Configurable cross-origin resource sharing for frontend integration
- **Health Check Endpoint** — `/health` endpoint for monitoring server uptime

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ES Modules) |
| Framework | Express 5 |
| Database | MongoDB + Mongoose ODM |
| Authentication | JSON Web Tokens (JWT) |
| Password Security | bcryptjs |
| Validation | express-validator |
| Dev Tools | Nodemon, dotenv |

---

## 📁 Project Structure

```
BlogPulse/
├── index.js                    # Application entry point
├── package.json
├── .env                        # Environment variables (not committed)
├── .gitignore
└── src/
    ├── config/
    │   └── db.config.js        # MongoDB connection setup
    ├── controllers/
    │   ├── user.controller.js  # User auth & profile logic
    │   ├── post.controller.js  # Blog post CRUD logic
    │   └── comment.controller.js # Comment CRUD logic
    ├── middleware/
    │   ├── auth.middleware.js   # JWT verification & route protection
    │   └── validate.middleware.js # Request validation handler
    ├── models/
    │   ├── user.model.js       # User schema (name, email, password)
    │   ├── post.model.js       # Post schema (title, content, author)
    │   └── comment.model.js    # Comment schema (text, post, user)
    ├── routes/
    │   ├── user.routes.js      # /api/users endpoints
    │   ├── post.routes.js      # /api/posts endpoints
    │   └── comment.routes.js   # /api/comments endpoints
    └── utils/                  # Utility functions
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repository
git clone https://github.com/shuklashivam33221/BlogPulse.git
cd BlogPulse

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/blogpulse
JWT_SECRET=your_jwt_secret_key
```

### Run the Server

```bash
# Development (with hot reload)
npm run dev

# Health check
curl http://localhost:5000/health
```

---

## 📡 API Endpoints

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/users/register` | Register new user | ❌ |
| POST | `/api/users/login` | Login & get JWT | ❌ |
| GET | `/api/users/profile` | Get user profile | ✅ |
| PUT | `/api/users/profile` | Update profile | ✅ |
| DELETE | `/api/users/profile` | Delete account | ✅ |

### Posts
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/posts` | Create a post | ✅ |
| GET | `/api/posts` | Get all posts | ❌ |
| GET | `/api/posts/:id` | Get post by ID | ❌ |
| PUT | `/api/posts/:id` | Update post | ✅ |
| DELETE | `/api/posts/:id` | Delete post | ✅ |

### Comments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/comments/:postId` | Add comment to post | ✅ |
| GET | `/api/comments/:postId` | Get comments for post | ❌ |
| PUT | `/api/comments/:id` | Update comment | ✅ |
| DELETE | `/api/comments/:id` | Delete comment | ✅ |

---

## 🔒 Authentication Flow

1. User registers with name, email, and password
2. Password is hashed using **bcryptjs** before storing
3. On login, server validates credentials and returns a **JWT**
4. Client sends JWT in `Authorization: Bearer <token>` header
5. Protected routes verify the token via **auth middleware**

---

## 👤 Author

**Shivam Shukla**

---

## 📄 License

This project is licensed under the ISC License.

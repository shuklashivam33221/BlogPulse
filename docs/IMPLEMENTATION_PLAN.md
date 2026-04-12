# 🚀 BlogPulse — Complete Implementation Plan

**Author:** Shivam Shukla  
**Project:** BlogPulse — A Full-Stack Blogging Platform REST API  
**Created:** April 2026  

---

## 📌 Project Overview

BlogPulse is a feature-rich blogging platform REST API built with modern technologies. Users can register, login, create/read/update/delete blog posts, comment on posts, and manage their profiles. The API follows industry-standard security practices and is designed to be scalable and production-ready.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js | JavaScript runtime for backend |
| Framework | Express.js | Web framework for building REST APIs |
| Database | MongoDB Atlas | Cloud-hosted NoSQL database |
| ODM | Mongoose | Schema validation & database interaction |
| Authentication | JSON Web Tokens (JWT) | Stateless user authentication |
| Password Security | bcryptjs | Password hashing |
| File Upload | Multer + Cloudinary | Image uploads for profile pictures & blog covers |
| Validation | express-validator | Input validation & sanitization |
| Email | Nodemailer | Sending password reset emails |
| Environment | dotenv | Managing secret environment variables |
| Security | cors, helmet, express-rate-limit | API security hardening |
| Dev Tools | Nodemon, Postman | Auto-restart server & API testing |
| Pagination | mongoose-aggregate-paginate-v2 | Efficient data pagination |

---

## 📊 Current Progress Tracker

### ✅ What We Have Completed So Far

- [x] Project folder structure (MVC pattern)
- [x] Express server setup (`index.js`)
- [x] MongoDB Atlas cloud database connection (`src/config/db.config.js`)
- [x] Environment variables with dotenv (`.env`)
- [x] CORS configuration
- [x] User Model — Schema with name, email, password, bio (`src/models/user.model.js`)
- [x] Post Model — Schema with title, content, author (ref), tags (`src/models/post.model.js`)
- [x] User Controller — Register & Login logic with bcrypt (`src/controllers/user.controller.js`)
- [x] User Routes — POST /register & POST /login (`src/routes/user.routes.js`)
- [x] `.gitignore` configured

### 🔲 What Remains (Phases Below)

---

## 📁 Final Project Structure (What we are building towards)

```
BlogPulse/
├── .env                          # Secret environment variables
├── .gitignore                    # Git ignore rules
├── package.json                  # Project metadata & dependencies
├── index.js                      # Main entry point
├── docs/
│   └── IMPLEMENTATION_PLAN.md    # This document
│
└── src/
    ├── config/
    │   └── db.config.js          # MongoDB connection logic
    │
    ├── models/
    │   ├── user.model.js         # User schema/model
    │   ├── post.model.js         # Blog post schema/model
    │   └── comment.model.js      # Comment schema/model (Phase 4)
    │
    ├── controllers/
    │   ├── user.controller.js    # User auth & profile logic
    │   ├── post.controller.js    # Blog CRUD logic
    │   └── comment.controller.js # Comment logic (Phase 4)
    │
    ├── routes/
    │   ├── user.routes.js        # /api/users/*
    │   ├── post.routes.js        # /api/posts/*
    │   └── comment.routes.js     # /api/comments/* (Phase 4)
    │
    ├── middleware/
    │   ├── auth.middleware.js     # JWT token verification
    │   ├── error.middleware.js    # Global error handler
    │   └── upload.middleware.js   # Multer file upload config (Phase 5)
    │
    └── utils/
        ├── generateToken.js      # JWT token creation helper
        └── sendEmail.js          # Email sending helper (Phase 6)
```

---

# 🏗️ PHASE-WISE IMPLEMENTATION

---

## Phase 1: Authentication & Security (JWT) 🔐
**Estimated Time:** 1-2 days  
**Status:** 🟡 Partially Done (register/login exist, but no JWT yet)

### Why This Phase Matters
Right now, anyone can hit your API endpoints. There is no way to know WHO is making the request. JWT (JSON Web Token) solves this by giving each logged-in user a unique "pass" (token) that they must show with every request.

### What We Will Build

#### 1.1 Install JWT
```bash
npm install jsonwebtoken
```

#### 1.2 Create Token Helper — `src/utils/generateToken.js`
A small utility function that creates a JWT token containing the user's ID. This token will be sent to the frontend after login/register, and the frontend will store it and include it in every future request.

#### 1.3 Update User Controller — `src/controllers/user.controller.js`
- Modify `registerUser` to return a JWT token along with user data
- Modify `loginUser` to return a JWT token along with user data
- Add `getUserProfile` — Fetches the currently logged-in user's profile
- Add `updateUserProfile` — Allows user to update their name, bio, etc.

#### 1.4 Create Auth Middleware — `src/middleware/auth.middleware.js`
This middleware sits between the Route and the Controller. Before a request reaches the controller, this middleware checks:
1. Did the frontend send a token?
2. Is the token valid (not expired, not tampered with)?
3. If yes → attach the user's info to `req.user` and let the request pass through
4. If no → block the request with 401 Unauthorized

#### 1.5 Update User Routes — `src/routes/user.routes.js`
- Add `GET /api/users/profile` (protected with auth middleware)
- Add `PUT /api/users/profile` (protected with auth middleware)

#### 1.6 Add JWT_SECRET to `.env`
```
JWT_SECRET=your_super_secret_random_string_here
```

### How JWT Flow Works (Visual)
```
1. User logs in → Backend verifies password → Backend creates JWT token → Sends token to Frontend
2. Frontend stores token in localStorage
3. Frontend makes a request to GET /api/posts → Attaches token in the Header
4. Auth Middleware intercepts → Decodes token → Finds user ID → Attaches to req.user
5. Controller receives req.user → Knows exactly WHO is making the request
```

### Testing Checklist
- [ ] Register returns a token
- [ ] Login returns a token
- [ ] Accessing /profile WITHOUT token returns 401
- [ ] Accessing /profile WITH valid token returns user data
- [ ] Expired token returns 401

---

## Phase 2: Blog Post CRUD Operations 📝
**Estimated Time:** 1-2 days  
**Status:** 🔴 Not Started

### What We Will Build

#### 2.1 Create Post Controller — `src/controllers/post.controller.js`

| Function | HTTP Method | URL | Auth Required? | Description |
|----------|------------|-----|----------------|-------------|
| `createPost` | POST | /api/posts | ✅ Yes | Create a new blog post |
| `getAllPosts` | GET | /api/posts | ❌ No | Get all posts (with pagination) |
| `getPostById` | GET | /api/posts/:id | ❌ No | Get a single post by its ID |
| `updatePost` | PUT | /api/posts/:id | ✅ Yes | Update your own post only |
| `deletePost` | DELETE | /api/posts/:id | ✅ Yes | Delete your own post only |
| `getPostsByUser` | GET | /api/posts/user/:userId | ❌ No | Get all posts by a specific author |

#### 2.2 Create Post Routes — `src/routes/post.routes.js`
Maps each URL to its controller function. Protected routes will have the auth middleware applied.

#### 2.3 Key Logic Details
- **Authorization Check:** When updating/deleting a post, we must verify that `req.user.id === post.author`. A user should NOT be able to delete someone else's post!
- **Populate Author:** When fetching posts, use `.populate('author', 'name email bio')` so the frontend gets the author's name, not just a random MongoDB ID.
- **Pagination:** Use `.limit()` and `.skip()` for basic pagination initially.

### Testing Checklist
- [ ] Create a post while logged in → returns the new post
- [ ] Create a post while NOT logged in → returns 401
- [ ] Get all posts → returns paginated list
- [ ] Get single post → returns post with populated author details
- [ ] Update your OWN post → success
- [ ] Update someone ELSE's post → returns 403 Forbidden
- [ ] Delete post → removes from database

---

## Phase 3: Input Validation & Error Handling ✅
**Estimated Time:** 1 day  
**Status:** 🔴 Not Started

### Why This Phase Matters
Right now, if someone sends a request without an email field, your server will crash with an ugly Mongoose validation error. We need to catch bad data BEFORE it ever reaches the database.

### What We Will Build

#### 3.1 Install express-validator
```bash
npm install express-validator
```

#### 3.2 Add Validation to Routes
Instead of blindly trusting `req.body`, we validate first:
- Register: name must not be empty, email must be valid format, password must be 6+ characters
- Login: email and password must be present
- Create Post: title and content must not be empty

#### 3.3 Create Global Error Handler — `src/middleware/error.middleware.js`
A centralized error handler that catches ALL errors across the entire app and sends clean, consistent error responses. No more try-catch in every single controller (optional refactor).

### Testing Checklist
- [ ] Register with empty name → returns validation error
- [ ] Register with invalid email format → returns validation error
- [ ] Register with password < 6 characters → returns validation error
- [ ] Create post with empty title → returns validation error

---

## Phase 4: Comments System 💬
**Estimated Time:** 1-2 days  
**Status:** 🔴 Not Started

### What We Will Build

#### 4.1 Comment Model — `src/models/comment.model.js`
```
Fields:
- content (String, required)
- author (ObjectId, ref: "User", required)
- post (ObjectId, ref: "Post", required)
- timestamps: true
```

#### 4.2 Comment Controller — `src/controllers/comment.controller.js`

| Function | HTTP Method | URL | Auth? | Description |
|----------|------------|-----|-------|-------------|
| `addComment` | POST | /api/comments/:postId | ✅ | Add a comment to a post |
| `getCommentsByPost` | GET | /api/comments/:postId | ❌ | Get all comments on a post |
| `deleteComment` | DELETE | /api/comments/:commentId | ✅ | Delete your own comment |

#### 4.3 Comment Routes — `src/routes/comment.routes.js`

#### 4.4 Update Post Model (Optional)
Add a `commentsCount` virtual field or maintain a `comments` array reference in the Post model.

### Testing Checklist
- [ ] Add a comment while logged in → success
- [ ] Add a comment while NOT logged in → 401
- [ ] Get all comments for a post → returns list with author names
- [ ] Delete your own comment → success
- [ ] Delete someone else's comment → 403

---

## Phase 5: Image Uploads (Profile Picture & Blog Cover) 📸
**Estimated Time:** 1-2 days  
**Status:** 🔴 Not Started

### Why This Phase Matters
A blogging platform without images is incomplete. Users should be able to upload a profile picture and attach a cover image to their blog posts.

### What We Will Build

#### 5.1 Install Dependencies
```bash
npm install multer cloudinary
```

#### 5.2 Set Up Cloudinary
- Create a free [Cloudinary](https://cloudinary.com/) account
- Get your Cloud Name, API Key, and API Secret
- Add them to `.env`

#### 5.3 Create Upload Middleware — `src/middleware/upload.middleware.js`
Multer handles the file from the frontend. Cloudinary stores the image on their cloud servers and gives us back a URL.

#### 5.4 Update Models
- Add `profilePicture` field to User model (String URL)
- Add `coverImage` field to Post model (String URL)

#### 5.5 Update Controllers
- Add `uploadProfilePicture` endpoint in user controller
- Modify `createPost` to accept an optional cover image

### Testing Checklist
- [ ] Upload a profile picture → returns Cloudinary URL
- [ ] Create a post with a cover image → image URL saved in database
- [ ] Create a post without an image → works fine with default/no image

---

## Phase 6: Password Reset via Email 📧
**Estimated Time:** 1-2 days  
**Status:** 🔴 Not Started

### What We Will Build

#### 6.1 Install Dependencies
```bash
npm install nodemailer crypto
```

#### 6.2 Create Email Utility — `src/utils/sendEmail.js`
A reusable function that sends emails using Nodemailer (we'll use Gmail SMTP or Mailtrap for testing).

#### 6.3 Update User Model
Add two new fields:
- `resetPasswordToken` (String)
- `resetPasswordExpires` (Date)

#### 6.4 Update User Controller
- `forgotPassword` — Generates a reset token, saves it to the user, sends an email with the reset link
- `resetPassword` — Verifies the token, lets user set a new password

#### 6.5 Update User Routes
- `POST /api/users/forgot-password`
- `POST /api/users/reset-password/:token`

### Security Note
The reset token expires after 10 minutes. The response always says "If an account exists with this email, we've sent a password reset link." (Remember our security discussion!)

### Testing Checklist
- [ ] Request password reset → email sent with link
- [ ] Click reset link → able to set new password
- [ ] Use expired token → returns error
- [ ] Login with new password → success

---

## Phase 7: Advanced Features & Polish ⚡
**Estimated Time:** 2-3 days  
**Status:** 🔴 Not Started

### 7.1 Search & Filter
- Search posts by title or content using regex
- Filter posts by tags
- `GET /api/posts?search=nodejs&tag=Tech&page=1&limit=10`

### 7.2 Like/Unlike Posts
- Add a `likes` array to Post model (array of User ObjectIds)
- `PUT /api/posts/:id/like` — Toggle like/unlike
- Prevent duplicate likes from the same user

### 7.3 Aggregation Pipeline — Blog Analytics
Use MongoDB aggregation to build powerful analytics:
- Top 5 most liked posts
- Most active authors (by post count)
- Posts per tag (tag distribution)
- `GET /api/posts/analytics/top` 

### 7.4 Pagination with mongoose-aggregate-paginate-v2
```bash
npm install mongoose-aggregate-paginate-v2
```
Apply pagination to aggregated results for performance at scale.

### 7.5 Rate Limiting
```bash
npm install express-rate-limit helmet
```
- Limit API requests to 100 per 15 minutes per IP
- Add `helmet` for security headers

### Testing Checklist
- [ ] Search posts by keyword → returns matching posts
- [ ] Like a post → likes count increases
- [ ] Like same post again → unlike (toggle behavior)
- [ ] Analytics endpoint → returns aggregated data
- [ ] Exceed rate limit → returns 429 Too Many Requests

---

## Phase 8: API Documentation 📄
**Estimated Time:** 1 day  
**Status:** 🔴 Not Started

### What We Will Build
Professional API documentation so that any frontend developer can understand and use your API.

#### Option A: Swagger/OpenAPI (Industry Standard)
```bash
npm install swagger-jsdoc swagger-ui-express
```
Creates a beautiful interactive API documentation page at `/api-docs` where developers can read about and even TEST your endpoints directly.

#### Option B: Manual Documentation in `docs/API_REFERENCE.md`
A markdown file listing every endpoint, its method, required fields, auth requirements, and example responses.

---

## Phase 9: Deployment 🌐
**Estimated Time:** 1 day  
**Status:** 🔴 Not Started

### Where We Will Deploy

| Service | Purpose | Cost |
|---------|---------|------|
| **Render** or **Railway** | Host the Node.js/Express server | Free tier available |
| **MongoDB Atlas** | Already set up! Database is already in the cloud | Free tier (M0) |
| **Cloudinary** | Already set up in Phase 5! Image hosting | Free tier |

### Deployment Steps
1. Push code to GitHub (make sure `.env` is in `.gitignore`!)
2. Create a Render/Railway account
3. Connect your GitHub repo
4. Set all `.env` variables in their dashboard
5. Deploy! Your API will be live at something like `https://blogpulse-api.onrender.com`

### Post-Deployment Checklist
- [ ] All endpoints work on the live URL
- [ ] MongoDB Atlas is accessible from the server
- [ ] Environment variables are correctly set
- [ ] CORS is configured for your frontend domain
- [ ] Rate limiting is active

---

## 📋 Complete API Endpoints Summary

### Users (`/api/users`)
| Method | Endpoint | Auth | Phase | Description |
|--------|----------|------|-------|-------------|
| POST | /register | ❌ | 1 | Register a new user |
| POST | /login | ❌ | 1 | Login and get JWT token |
| GET | /profile | ✅ | 1 | Get logged-in user's profile |
| PUT | /profile | ✅ | 1 | Update profile (name, bio) |
| PUT | /profile/picture | ✅ | 5 | Upload profile picture |
| POST | /forgot-password | ❌ | 6 | Request password reset email |
| POST | /reset-password/:token | ❌ | 6 | Reset password with token |

### Posts (`/api/posts`)
| Method | Endpoint | Auth | Phase | Description |
|--------|----------|------|-------|-------------|
| POST | / | ✅ | 2 | Create a new blog post |
| GET | / | ❌ | 2 | Get all posts (paginated) |
| GET | /:id | ❌ | 2 | Get a single post |
| PUT | /:id | ✅ | 2 | Update your own post |
| DELETE | /:id | ✅ | 2 | Delete your own post |
| GET | /user/:userId | ❌ | 2 | Get all posts by a user |
| PUT | /:id/like | ✅ | 7 | Like/Unlike a post |
| GET | /analytics/top | ❌ | 7 | Top posts by likes |

### Comments (`/api/comments`)
| Method | Endpoint | Auth | Phase | Description |
|--------|----------|------|-------|-------------|
| POST | /:postId | ✅ | 4 | Add comment to a post |
| GET | /:postId | ❌ | 4 | Get comments for a post |
| DELETE | /:commentId | ✅ | 4 | Delete your own comment |

---

## 🎯 Key Principles to Follow Throughout

1. **Never trust frontend data** — Always validate inputs on the backend
2. **Never store plain text passwords** — Always hash with bcrypt
3. **Never expose sensitive data** — Don't return passwords in API responses
4. **Always use environment variables** — No hardcoded secrets in code
5. **Always handle errors** — Every controller should have try-catch
6. **Keep controllers thin** — Move reusable logic to `utils/`
7. **Test every endpoint** — Use Postman after building each feature

---

## 📦 Final Dependencies List

### Production
```json
{
  "express": "Web framework",
  "mongoose": "MongoDB ODM",
  "dotenv": "Environment variables",
  "cors": "Cross-origin resource sharing",
  "bcryptjs": "Password hashing",
  "jsonwebtoken": "JWT authentication",
  "express-validator": "Input validation",
  "multer": "File upload handling",
  "cloudinary": "Cloud image storage",
  "nodemailer": "Email sending",
  "mongoose-aggregate-paginate-v2": "Aggregation pagination",
  "express-rate-limit": "API rate limiting",
  "helmet": "Security headers",
  "swagger-jsdoc": "API documentation",
  "swagger-ui-express": "API docs UI"
}
```

### Development
```json
{
  "nodemon": "Auto-restart server on file changes"
}
```

---

> **Note:** This plan is a living document. As we complete each phase, we will update the checkboxes and add any lessons learned or changes made along the way. Happy coding! 🚀

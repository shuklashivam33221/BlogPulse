# BlogPulse — RESTful Blog Platform API

A backend API for a blog platform built with Node.js, Express 5, and MongoDB. Designed with a strict MVC architecture, JWT authentication, and layered middleware for validation, error handling, and security hardening.

> **Live API:** [blogpulse-4jc9.onrender.com](https://blogpulse-4jc9.onrender.com)  
> **API Docs:** [Swagger UI](https://blogpulse-4jc9.onrender.com/api-docs)

---

## Architecture Decisions

### Why Stateless JWT Over Session-Based Auth
Sessions require server-side storage — either in memory (lost on restart) or in a store like Redis. JWT is self-contained: the token carries the user identity, so the server doesn't need to store session state. This means any instance of the API can verify a request independently, which simplifies deployment on stateless platforms like Render.

**Trade-off accepted:** JWTs can't be invalidated before expiry. If a token is compromised, it's valid until it expires. Mitigated by keeping token expiry short.

### Why MVC With Separate Validation Middleware
Early versions had validation logic inside controllers. This worked but made controllers long and mixed two concerns: "is this input valid?" and "what should I do with it?" Extracting validation into dedicated middleware (`express-validator` chains in route files + `validate.middleware.js`) keeps each layer focused on one job.

### Why Multer Runs Before express-validator
`express.json()` can't parse `multipart/form-data`. When a post includes a cover image, the request body is multipart — so `express-validator` sees an empty `req.body` and rejects the request. Multer must run first to parse the multipart data and populate `req.body`, then validation can run on the populated fields.

This was a bug that took time to diagnose. The fix is middleware ordering: `protectRoute → upload.single() → [validators] → validate → controller`.

### Why Controller-Level Ownership Checks (Not Middleware)
Initially tried to verify resource ownership (e.g., "does this user own this post?") in middleware. The problem: middleware runs before the controller, and checking ownership requires fetching the resource from the database — the same fetch the controller would do. This meant either:
- Fetching the resource twice (once in middleware, once in controller), or
- Passing data between middleware and controller via `req.resource` (messy coupling)

Moved ownership checks into controllers where the resource is already fetched. Simpler, one DB call.

---

## What Broke During Development

### The ObjectId Comparison Bug
**Problem:** The `toggleLike` endpoint uses an array of user IDs on each post. Checking if a user already liked a post with `likes.includes(userId)` always returned `false` — even when the user ID was clearly in the array.

**Cause:** Mongoose ObjectIds are objects, not strings. JavaScript `===` compares object references, not values. Two different ObjectId objects pointing to the same ID are not "equal" by reference.

**Fix:** Used `.some(id => id.toString() === userId.toString())` for comparison and `.filter()` for removal instead of `.pull()` or `.splice()`.

### Route Ordering: `/analytics` vs `/:id`
**Problem:** `GET /api/posts/analytics` returned "Invalid post ID format" — the param validator was rejecting "analytics" as an invalid MongoDB ObjectId.

**Cause:** Express matches routes top-to-bottom. The `/:id` route was defined before `/analytics`, so Express treated "analytics" as an `:id` parameter.

**Fix:** Moved static routes (`/analytics`) above parameterized routes (`/:id`). Route ordering in Express is execution order.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js (ES Modules) | Server-side JavaScript |
| Framework | Express 5 | HTTP routing and middleware |
| Database | MongoDB + Mongoose | Document storage and ODM |
| Auth | jsonwebtoken + bcryptjs | Token generation and password hashing |
| Validation | express-validator | Request body/param validation |
| File Uploads | Multer + Cloudinary | Image processing and cloud storage |
| Security | Helmet + express-rate-limit | HTTP header hardening, brute-force protection |
| Documentation | swagger-jsdoc + swagger-ui-express | Interactive API documentation |
| Testing | Jest + Supertest | Integration tests |

---

## API Endpoints

### Users — `/api/users`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login, returns JWT | No |
| GET | `/profile` | Get current user profile | Yes |
| PUT | `/profile` | Update profile | Yes |
| DELETE | `/profile` | Delete account | Yes |

### Posts — `/api/posts`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all posts (search, filter, paginate) | No |
| GET | `/analytics` | Aggregated blog analytics | No |
| GET | `/:id` | Get single post by ID | No |
| POST | `/` | Create post (supports cover image upload) | Yes |
| PUT | `/:id` | Update post (owner only) | Yes |
| DELETE | `/:id` | Delete post (owner only) | Yes |
| PUT | `/:id/like` | Toggle like/unlike on a post | Yes |

**Query parameters for `GET /`:**
- `search` — keyword search across title and content (regex)
- `tag` — filter by tag
- `page` — page number (default: 1)
- `limit` — results per page (default: 10)

### Comments — `/api/comments`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/:postId` | Add comment to a post | Yes |
| GET | `/:postId` | Get all comments for a post | No |
| PUT | `/:id` | Update comment (owner only) | Yes |
| DELETE | `/:id` | Delete comment (owner only) | Yes |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api-docs` | Swagger UI documentation |

---

## Request Flow

```
Client Request
  → CORS (cross-origin filtering)
  → Helmet (security headers)
  → Rate Limiter (100 req / 15 min per IP)
  → Router
    → Auth Middleware (JWT verification, if protected route)
    → Multer (file upload parsing, if multipart)
    → express-validator (input validation)
    → validate middleware (check for errors, return 400 if any)
    → Controller (business logic)
    → MongoDB (data operation)
  → Response
  → Global Error Handler (catches anything unhandled, returns consistent JSON)
```

---

## Project Structure

```
BlogPulse/
├── index.js                          # Entry point, middleware chain, route mounting
├── package.json
├── .env                              # Environment variables (not committed)
├── tests/
│   └── app.test.js                   # Integration tests (Jest + Supertest)
└── src/
    ├── config/
    │   └── db.config.js              # MongoDB connection
    ├── controllers/
    │   ├── user.controller.js        # Auth (register/login) + profile CRUD
    │   ├── post.controller.js        # Post CRUD + likes + analytics pipeline
    │   └── comment.controller.js     # Comment CRUD with ownership checks
    ├── middleware/
    │   ├── auth.middleware.js         # JWT verification + req.user injection
    │   ├── validate.middleware.js     # express-validator error aggregation
    │   ├── error.middleware.js        # Global 4-param error handler
    │   └── upload.middleware.js       # Multer + Cloudinary storage config
    ├── models/
    │   ├── user.model.js             # name, email, password (hashed)
    │   ├── post.model.js             # title, content, tags, coverImage, likes[]
    │   └── comment.model.js          # text, post (ref), user (ref)
    └── routes/
        ├── user.routes.js            # /api/users — with Swagger annotations
        ├── post.routes.js            # /api/posts — with Swagger annotations
        └── comment.routes.js         # /api/comments — with Swagger annotations
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- Cloudinary account (for image uploads)

### Installation

```bash
git clone https://github.com/shuklashivam33221/BlogPulse.git
cd BlogPulse
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/blogpulse
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Run

```bash
# Development (with hot reload)
npm run dev

# Run tests
npm test
```

### Test the API

Visit [localhost:5000/api-docs](http://localhost:5000/api-docs) for the interactive Swagger documentation, or use curl:

```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "email": "test@test.com", "password": "password123"}'
```

---

## Author

**Shivam Shukla** — [GitHub](https://github.com/shuklashivam33221) · [LinkedIn](https://www.linkedin.com/in/shivamshukla33221/)

## License

ISC

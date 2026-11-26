# 🏗️ Nexora Authentication Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          NEXORA CLIENT                              │
│                         (React + Vite)                              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    React Components                          │  │
│  │                                                              │  │
│  │  LoginPage ──────────────→ API Call ──────────────→ Server  │  │
│  │     │                          │                             │  │
│  │     └─→ AuthContext.login()   └─→ Axios + Interceptor      │  │
│  │            ↓                       ↓                        │  │
│  │     Save token to localStorage   Send JWT in header        │  │
│  │     Redirect to /dashboard                                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        NEXORA SERVER                                │
│                    (Node.js + Express)                              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Entry Point: server.js                                       │  │
│  │                                                              │  │
│  │ app.use(cors())              ← Cross-origin requests        │  │
│  │ app.use(express.json())      ← Parse JSON bodies           │  │
│  │ app.use("/api/auth", authRoutes)                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                           │                                         │
│                           ↓                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Routes: routes/authRoutes.js                                 │  │
│  │                                                              │  │
│  │ POST /register                                               │  │
│  │   ├─ express-validator checks (format, length)              │  │
│  │   └─ register controller                                     │  │
│  │                                                              │  │
│  │ POST /login                                                  │  │
│  │   ├─ express-validator checks                               │  │
│  │   └─ login controller                                        │  │
│  │                                                              │  │
│  │ GET /me (protected)                                          │  │
│  │   ├─ authMiddleware (verify JWT)                            │  │
│  │   └─ getMe controller                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                           │                                         │
│                           ↓                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Middleware: middleware/authMiddleware.js                     │  │
│  │                                                              │  │
│  │ 1. Extract token from Authorization header                  │  │
│  │ 2. Verify signature with JWT_SECRET                         │  │
│  │ 3. Check expiry                                             │  │
│  │ 4. Attach req.user = { userId, iat, exp }                 │  │
│  │ 5. Call next() to proceed                                   │  │
│  │ 6. Or return 401/403 error                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                           │                                         │
│                           ↓                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Controllers: controllers/authController.js                   │  │
│  │                                                              │  │
│  │ register(req, res, next):                                    │  │
│  │   ├─ Validate input                                         │  │
│  │   ├─ Check duplicate email                                  │  │
│  │   ├─ Create User object                                     │  │
│  │   ├─ Save to database (triggers bcrypt pre-save hook)      │  │
│  │   ├─ Generate JWT token                                     │  │
│  │   └─ Return { accessToken, user }                          │  │
│  │                                                              │  │
│  │ login(req, res, next):                                       │  │
│  │   ├─ Validate input                                         │  │
│  │   ├─ Find user by email                                     │  │
│  │   ├─ Compare password with bcryptjs                         │  │
│  │   ├─ Generate JWT token                                     │  │
│  │   └─ Return { accessToken, user }                          │  │
│  │                                                              │  │
│  │ getMe(req, res, next):                                       │  │
│  │   ├─ Get userId from req.user (set by middleware)          │  │
│  │   ├─ Fetch user from database                              │  │
│  │   └─ Return { user } (no password)                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                           │                                         │
│                           ↓                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Models: models/User.js (Mongoose Schema)                     │  │
│  │                                                              │  │
│  │ Schema fields:                                               │  │
│  │  ├─ name: String (required, trimmed)                        │  │
│  │  ├─ email: String (required, unique, email regex)           │  │
│  │  ├─ password: String (required, select: false)              │  │
│  │  ├─ role: String (enum: freelancer/client/admin)            │  │
│  │  ├─ isVerified: Boolean (default: false)                    │  │
│  │  └─ timestamps: createdAt, updatedAt                        │  │
│  │                                                              │  │
│  │ Pre-save hook:                                               │  │
│  │  ├─ Check if password is modified                           │  │
│  │  ├─ Generate salt (10 rounds)                               │  │
│  │  ├─ Hash password with bcryptjs                             │  │
│  │  └─ Save hashed password                                    │  │
│  │                                                              │  │
│  │ Methods:                                                     │  │
│  │  └─ matchPassword(enteredPassword)                          │  │
│  │     └─ Securely compare with bcryptjs.compare()             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                           │                                         │
│                           ↓                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Database: MongoDB Atlas                                      │  │
│  │                                                              │  │
│  │ Collection: users                                            │  │
│  │ ┌─────────────────────────────────────────────────────────┐ │  │
│  │ │ _id: ObjectId                                           │ │  │
│  │ │ name: "John Doe"                                        │ │  │
│  │ │ email: "john@example.com" (unique index)               │ │  │
│  │ │ password: "$2b$10$abcd1234..." (bcrypt hash)          │ │  │
│  │ │ role: "freelancer"                                      │ │  │
│  │ │ isVerified: false                                       │ │  │
│  │ │ createdAt: 2024-06-18T10:00:00Z                        │ │  │
│  │ │ updatedAt: 2024-06-18T10:00:00Z                        │ │  │
│  │ └─────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Request Flow: Registration

```
User Input
  │ name, email, password, role
  ↓
POST /api/auth/register
  ↓
express-validator Middleware
  ├─ Check name is not empty ✓
  ├─ Check email format ✓
  ├─ Check password length >= 6 ✓
  └─ If any fail → return 400 error
  ↓
register() Controller
  │
  ├─ Validate: name, email, password present ✓
  │
  ├─ Database Query: findOne({ email })
  │  └─ If exists → return 409 "User already exists"
  │
  ├─ Create User Object
  │  ├─ name: "John Doe"
  │  ├─ email: "john@example.com"
  │  ├─ password: "plaintext_password_123" (TEMPORARY)
  │  └─ role: "freelancer"
  │
  └─ user.save()
     │
     ↓
     Pre-save Hook (Mongoose)
     │
     ├─ Check password modified? YES
     ├─ Generate salt (10 rounds)
     ├─ Hash password: "$2b$10$abcd1234..."
     └─ Update this.password with hash
     │
     ↓
     MongoDB: Insert document
     │
     ↓
     Return to Controller
     │
     ├─ generateToken(user._id)
     │  └─ jwt.sign({ userId }, JWT_SECRET, { expiresIn: "24h" })
     │
     └─ Return Response
        ├─ accessToken: "eyJ0eXAi..."
        └─ user: { id, name, email, role }
        
Client receives response
  └─ Store token in localStorage
     └─ "eyJ0eXAi..."
```

---

## Request Flow: Login

```
User Input
  │ email, password
  ↓
POST /api/auth/login
  ↓
express-validator Middleware
  ├─ Check email format ✓
  ├─ Check password not empty ✓
  └─ If any fail → return 400 error
  ↓
login() Controller
  │
  ├─ Validate: email, password present ✓
  │
  ├─ Database Query: findOne({ email }).select("+password")
  │  ├─ Get user object
  │  └─ Include password field (normally excluded)
  │
  ├─ If user not found
  │  └─ Return 401 "Invalid email or password"
  │
  ├─ user.matchPassword(enteredPassword)
  │  └─ bcryptjs.compare(enteredPassword, storedHashedPassword)
  │     └─ Returns true/false WITHOUT revealing password
  │
  ├─ If password invalid
  │  └─ Return 401 "Invalid email or password"
  │
  ├─ generateToken(user._id)
  │  └─ jwt.sign({ userId }, JWT_SECRET, { expiresIn: "24h" })
  │
  └─ Return Response
     ├─ accessToken: "eyJ0eXAi..."
     └─ user: { id, name, email, role }
        
Client receives response
  └─ Store token in localStorage
```

---

## Request Flow: Protected Route (GET /me)

```
Authenticated User with Token
  │ Browser sends request with token
  ↓
GET /api/auth/me
  │ Header: Authorization: Bearer eyJ0eXAi...
  ↓
authMiddleware (Middleware)
  │
  ├─ Extract header: "Bearer eyJ0eXAi..."
  ├─ Split and get token: "eyJ0eXAi..."
  │
  ├─ If no token
  │  └─ Return 401 "Access token required"
  │
  ├─ jwt.verify(token, JWT_SECRET)
  │  ├─ Decode header, payload, signature
  │  ├─ Calculate: HMAC-SHA256(header.payload, JWT_SECRET)
  │  ├─ Compare with provided signature
  │  │
  │  ├─ If invalid
  │  │  └─ Return 403 "Invalid or expired token"
  │  │
  │  ├─ If expired (check exp timestamp)
  │  │  └─ Return 403 "Invalid or expired token"
  │  │
  │  └─ If valid
  │     ├─ Decode payload: { userId, iat, exp }
  │     ├─ req.user = { userId, iat, exp }
  │     └─ call next() → proceed to controller
  ↓
getMe() Controller
  │
  ├─ Get userId from req.user.userId
  ├─ Database Query: findById(userId).select("-password")
  │  └─ Fetch user, exclude password field
  │
  └─ Return Response
     └─ user: { id, name, email, role, isVerified }
        
Client receives response
  └─ Display user profile
```

---

## Security Checkpoints

```
┌─────────────────────────────────────────────────────────────┐
│                  SECURITY CHECKPOINTS                        │
└─────────────────────────────────────────────────────────────┘

1️⃣ INPUT VALIDATION (express-validator)
   ├─ Email format check
   ├─ Password length check (min 6)
   ├─ Required fields check
   └─ Prevents invalid data from reaching database

2️⃣ MONGOOSE SCHEMA VALIDATION
   ├─ Unique email constraint
   ├─ Email regex match
   ├─ Required fields enforcement
   └─ Type checking

3️⃣ BUSINESS LOGIC VALIDATION
   ├─ Check if user already exists
   ├─ Compare password with bcryptjs (not plaintext)
   └─ Appropriate error messages

4️⃣ PASSWORD HASHING
   ├─ bcryptjs with 10 salt rounds
   ├─ Pre-save hook automatic
   ├─ Never store plaintext
   └─ Secure comparison prevents timing attacks

5️⃣ JWT SIGNATURE VERIFICATION
   ├─ Verify signature hasn't been tampered with
   ├─ Check expiry timestamp
   ├─ Validate using JWT_SECRET
   └─ Prevents token forgery

6️⃣ ERROR HANDLING
   ├─ Generic error messages ("Invalid email or password")
   ├─ No sensitive data in responses
   ├─ Prevents user enumeration
   └─ Consistent error formats
```

---

## Data Flow: Password Hashing

```
User enters password: "MySecure123"
        ↓
Input Validation: length >= 6 ✓
        ↓
User saved to database
        ↓
Mongoose Pre-save Hook
        │
        ├─ bcryptjs.genSalt(10)
        │  └─ Generate random salt string
        │
        ├─ bcryptjs.hash("MySecure123", salt)
        │  └─ Apply CPU-intensive hash function
        │
        └─ Result: "$2b$10$a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
        
Stored in Database: $2b$10$a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
        ↓ (months later)
        ↓
User logs in with: "MySecure123"
        ↓
bcryptjs.compare("MySecure123", "$2b$10$a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6")
        ├─ Extract salt from stored hash
        ├─ Hash entered password with same salt
        ├─ Compare hashes (constant-time)
        └─ Return true or false (NO PASSWORD REVEALED)
        ↓
Grant token if true
```

---

## Token Structure

```
JWT: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.
     eyJ1c2VySWQiOiI2NDlmM2QxY2M0YzZlMDAyMjU3ZTU2YzAiLCJpYXQiOjE3MjMwMDAwMDAsImV4cCI6MTcyMzA4NjQwMH0.
     GHhSTmYe_z3_fgMSxV9zw2n4vGbVqy3Cxw4lFnTmB1s
     
     Part 1: Part 2: Part 3:
     Header  Payload  Signature

┌────────────────────────────────────────────────────────────┐
│ HEADER (base64url decoded)                                 │
├────────────────────────────────────────────────────────────┤
│ {                                                          │
│   "typ": "JWT",                                           │
│   "alg": "HS256"                                          │
│ }                                                          │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ PAYLOAD (base64url decoded)                                │
├────────────────────────────────────────────────────────────┤
│ {                                                          │
│   "userId": "649f3d1cc4c6e00225...",   ← User ID         │
│   "iat": 1723000000,                   ← Issued at       │
│   "exp": 1723086400                    ← Expires at      │
│ }                                                          │
│                                                            │
│ ⚠️ NEVER put in payload:                                   │
│    - passwords                                             │
│    - API keys                                              │
│    - credit cards                                          │
│    - tokens                                                │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ SIGNATURE (HMAC-SHA256)                                    │
├────────────────────────────────────────────────────────────┤
│ HMACSHA256(                                               │
│   header + "." + payload,                                 │
│   "nexora_dev_secret_key_2024_change_in_production_env"  │
│ )                                                          │
│                                                            │
│ ✓ Verifies token hasn't been tampered with                │
│ ✓ Only valid if signature matches                          │
│ ✓ Attacker can't forge without knowing secret             │
└────────────────────────────────────────────────────────────┘
```

---

## Validation Layers

```
┌─────────────────────────────────────────────┐
│ Layer 1: Route-Level Validation             │
│ (express-validator)                         │
├─────────────────────────────────────────────┤
│ Checks:                                     │
│ • Email format (valid email syntax)        │
│ • Password length (min 6 chars)            │
│ • Required fields (name, email, password)  │
│ • Input sanitization (trim, encode)        │
│                                             │
│ If fails → 400 Bad Request                 │
└─────────────────────────────────────────────┘
         ↓ (if pass)
┌─────────────────────────────────────────────┐
│ Layer 2: Schema Validation                  │
│ (Mongoose)                                  │
├─────────────────────────────────────────────┤
│ Checks:                                     │
│ • Required fields (can't save without them) │
│ • Unique email (no duplicates)              │
│ • Email regex pattern                       │
│ • Role enum (only freelancer/client/admin)  │
│ • Type checking (string, number, etc)       │
│                                             │
│ If fails → MongoDB error                   │
└─────────────────────────────────────────────┘
         ↓ (if pass)
┌─────────────────────────────────────────────┐
│ Layer 3: Business Logic Validation          │
│ (Controller)                                │
├─────────────────────────────────────────────┤
│ Checks:                                     │
│ • User exists (for login)                   │
│ • Password matches (for login)              │
│ • Email unique (for registration)           │
│ • Appropriate error messages                │
│                                             │
│ If fails → 401/409 with message             │
└─────────────────────────────────────────────┘
         ↓ (if pass)
┌─────────────────────────────────────────────┐
│ Layer 4: Security Middleware                │
│ (authMiddleware)                            │
├─────────────────────────────────────────────┤
│ Checks:                                     │
│ • Token present                             │
│ • Signature valid                           │
│ • Token not expired                         │
│ • User ID in payload                        │
│                                             │
│ If fails → 401/403 error                    │
└─────────────────────────────────────────────┘
         ↓ (if pass)
    ✓ Request allowed
```

---

## Technology Integration

```
Client (React)
    ↓ (axios with interceptors)
    ├─ Auto-attach JWT to headers
    ├─ Auto-refresh on 401
    └─ Store token in localStorage
    
    ↓ HTTP/HTTPS
    
Server (Express)
    ├─ CORS middleware (allow cross-origin)
    ├─ JSON parser (parse request bodies)
    ├─ Router → Controller → Model
    │
    ├─ express-validator
    │  └─ Input validation
    │
    ├─ Middleware chain
    │  ├─ authMiddleware (verify JWT)
    │  └─ errorHandler (catch errors)
    │
    ├─ Mongoose
    │  ├─ Schema validation
    │  ├─ Pre-save hooks (bcrypt)
    │  └─ Database methods
    │
    ├─ bcryptjs
    │  ├─ Hash passwords
    │  └─ Compare passwords
    │
    └─ jsonwebtoken
       ├─ Sign tokens
       └─ Verify tokens
    
    ↓
    
Database (MongoDB Atlas)
    └─ Store users (hashed passwords)
```

---

## This Architecture Provides:

✅ **Security:** Multiple validation layers, password hashing, JWT signatures
✅ **Scalability:** Stateless JWT tokens work across multiple servers
✅ **Maintainability:** Clear separation of concerns (routes, controllers, models)
✅ **Testability:** Each layer can be tested independently
✅ **Extensibility:** Easy to add new features (2FA, refresh tokens, etc)
✅ **Performance:** No session storage overhead, just signature verification
✅ **User Experience:** 24-hour tokens balance security and convenience

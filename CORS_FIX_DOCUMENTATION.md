# CORS Preflight Failure - Fix Documentation

## ✅ Problem Summary

Frontend hosted on `https://expense-tracker-eta-ashy-39.vercel.app` was unable to call API on `https://expense-tracker-backend-azure-alpha.vercel.app` with errors:
- `PreflightMissingAllowOriginHeader`
- `net::ERR_FAILED`

**Root Cause:** The backend authentication middleware was blocking OPTIONS preflight requests instead of allowing them to pass through immediately.

---

## ✅ Solution Implemented

### 1. **Updated Authentication Middleware** (`middleware/authMiddleware.js`)

**Problem:** The `protect` middleware was attempting to verify JWT tokens on ALL requests, including OPTIONS preflight requests.

**Solution:** Added a check to skip authentication for OPTIONS requests:

```javascript
const protect = async (req, res, next) => {
  // ✅ SKIP OPTIONS preflight requests - they don't need authentication
  if (req.method === "OPTIONS") {
    return next();
  }

  // ... rest of authentication logic
};
```

**Why it works:** OPTIONS requests are sent by the browser automatically before actual requests. They should respond instantly with CORS headers WITHOUT authentication checks.

---

### 2. **Enhanced CORS Configuration in `api/index.js` (Vercel Serverless)**

**Improvements:**
- ✅ Added `optionsSuccessStatus: 200` (some legacy browsers need this)
- ✅ Added `exposedHeaders` for frontend to read Authorization header
- ✅ Added `maxAge: 86400` to cache preflight results (24 hours)
- ✅ Added `X-Requested-With` and `Accept` to allowed headers
- ✅ Improved origin validation with callback function
- ✅ Skip database connection for OPTIONS requests

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for origin: " + origin));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle ALL preflight requests

// Skip DB for OPTIONS requests
app.use(async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  // ... DB connection logic
});
```

---

### 3. **Updated `server.js` (Local Development)**

Applied the same CORS configuration for consistency between local and production environments:
- ✅ Added `localhost:5173` (Vite frontend default port)
- ✅ Same CORS options as `api/index.js`
- ✅ Proper OPTIONS handling
- ✅ Consistent headers and caching

---

### 4. **Created Optional Enhanced CORS Middleware** (`middleware/corsMiddleware.js`)

A reusable CORS configuration module that can be imported and used anywhere:

```javascript
const { corsOptions, manualCorsHandler } = require("./middleware/corsMiddleware");

// Option 1: Use with cors() middleware
app.use(cors(corsOptions));

// Option 2: Use manual handler as fallback
app.use(manualCorsHandler);
```

---

## ✅ What Happens Now

### Browser Preflight Request Flow:

1. **Browser sends OPTIONS request:**
   ```
   OPTIONS /v1/auth/login HTTP/1.1
   Host: expense-tracker-backend-azure-alpha.vercel.app
   Origin: https://expense-tracker-eta-ashy-39.vercel.app
   Access-Control-Request-Method: POST
   Access-Control-Request-Headers: Content-Type, Authorization
   ```

2. **Server responds immediately (no DB/auth):**
   ```
   HTTP/1.1 200 OK
   Access-Control-Allow-Origin: https://expense-tracker-eta-ashy-39.vercel.app
   Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept
   Access-Control-Allow-Credentials: true
   Access-Control-Max-Age: 86400
   ```

3. **Browser then sends actual POST request** (allowed because preflight succeeded)
4. **Authentication middleware processes actual request** (checks JWT token)

---

## ✅ Current Configuration

### Allowed Origins
- ✅ `http://localhost:3000` (local development)
- ✅ `http://localhost:5173` (Vite dev server)
- ✅ `https://expense-tracker-eta-ashy-39.vercel.app` (production frontend)

### Allowed Methods
- ✅ GET, POST, PUT, PATCH, DELETE, OPTIONS

### Allowed Headers
- ✅ `Content-Type` - JSON payloads
- ✅ `Authorization` - JWT tokens
- ✅ `X-Requested-With` - XMLHttpRequest identifier
- ✅ `Accept` - Content type preference

### Exposed Headers (readable by frontend)
- ✅ `Content-Type`
- ✅ `Authorization`

### Credentials
- ✅ `credentials: true` - cookies and authorization headers allowed

---

## ✅ Testing the Fix

### Test 1: OPTIONS Preflight Request
```bash
curl -X OPTIONS https://expense-tracker-backend-azure-alpha.vercel.app/v1/auth/login \
  -H "Origin: https://expense-tracker-eta-ashy-39.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v
```

**Expected Response:**
- Status: `200 OK`
- Headers include `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, etc.

### Test 2: Actual POST Request
```bash
curl -X POST https://expense-tracker-backend-azure-alpha.vercel.app/v1/auth/login \
  -H "Origin: https://expense-tracker-eta-ashy-39.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -v
```

**Expected Response:**
- Status: `200 OK` (successful login) or `401 Unauthorized` (invalid credentials)
- CORS headers included

### Test 3: Protected Route with JWT
```bash
curl -X GET https://expense-tracker-backend-azure-alpha.vercel.app/v1/auth/getUser \
  -H "Origin: https://expense-tracker-eta-ashy-39.vercel.app" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -v
```

**Expected Response:**
- Status: `200 OK` (with user data) or `401 Unauthorized` (invalid token)

---

## ✅ Files Modified

1. **`middleware/authMiddleware.js`**
   - Added OPTIONS request skip

2. **`api/index.js`** (Vercel serverless)
   - Enhanced CORS configuration
   - Added preflight handling
   - Optimized OPTIONS responses (skip DB connection)

3. **`server.js`** (Local development)
   - Updated CORS configuration for consistency
   - Added `localhost:5173` support

4. **`middleware/corsMiddleware.js`** (NEW)
   - Reusable CORS configuration
   - Optional manual CORS handler

---

## ✅ Performance Optimization

- ✅ `maxAge: 86400` caches preflight results for 24 hours
- ✅ OPTIONS requests skip database operations
- ✅ No JWT verification for preflight requests
- ✅ Instant response to preflight requests

---

## ✅ Production Checklist

- ✅ Frontend URL configured: `https://expense-tracker-eta-ashy-39.vercel.app`
- ✅ Backend URL accessible: `https://expense-tracker-backend-azure-alpha.vercel.app`
- ✅ Authentication headers properly handled
- ✅ Preflight requests respond immediately
- ✅ Credentials allowed for cookies/auth
- ✅ All HTTP methods supported
- ✅ Performance optimized with caching

---

## ✅ Troubleshooting

If you still see CORS errors:

1. **Verify frontend URL** is in `allowedOrigins` array
2. **Check browser console** for exact error message
3. **Test with curl** (commands provided above)
4. **Clear browser cache** - cached preflight might have wrong headers
5. **Verify environment variables** are loaded (`.env` file)
6. **Check Vercel deployment logs** for any errors

---

## ✅ Additional Resources

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Middleware](https://github.com/expressjs/cors)
- [Preflight Requests](https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request)

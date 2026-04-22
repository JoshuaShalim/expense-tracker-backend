# CORS Fix - Testing Examples

## ✅ Test Scenario 1: Preflight Request (OPTIONS)

**What the browser sends automatically:**
```bash
OPTIONS /v1/auth/login HTTP/1.1
Host: expense-tracker-backend-azure-alpha.vercel.app
Origin: https://expense-tracker-eta-ashy-39.vercel.app
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization
```

**Expected server response (200 OK):**
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://expense-tracker-eta-ashy-39.vercel.app
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

**Test with cURL:**
```bash
curl -X OPTIONS https://expense-tracker-backend-azure-alpha.vercel.app/v1/auth/login \
  -H "Origin: https://expense-tracker-eta-ashy-39.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -H "Content-Type: application/json" \
  -v
```

---

## ✅ Test Scenario 2: Login Request (POST with credentials)

**What the browser sends after preflight succeeds:**
```bash
POST /v1/auth/login HTTP/1.1
Host: expense-tracker-backend-azure-alpha.vercel.app
Origin: https://expense-tracker-eta-ashy-39.vercel.app
Content-Type: application/json
Accept: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Expected response:**
```json
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://expense-tracker-eta-ashy-39.vercel.app
Access-Control-Allow-Credentials: true
Content-Type: application/json

{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123456",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Test with cURL:**
```bash
curl -X POST https://expense-tracker-backend-azure-alpha.vercel.app/v1/auth/login \
  -H "Origin: https://expense-tracker-eta-ashy-39.vercel.app" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }' \
  -v
```

---

## ✅ Test Scenario 3: Protected Route (GET with Authorization)

**What the browser sends (after preflight):**
```bash
GET /v1/auth/getUser HTTP/1.1
Host: expense-tracker-backend-azure-alpha.vercel.app
Origin: https://expense-tracker-eta-ashy-39.vercel.app
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

**Expected response (200 OK with user data):**
```json
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://expense-tracker-eta-ashy-39.vercel.app
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: Content-Type, Authorization
Content-Type: application/json

{
  "user": {
    "id": "123456",
    "email": "user@example.com",
    "name": "John Doe",
    "profileImage": "https://..."
  }
}
```

**Test with cURL:**
```bash
curl -X GET https://expense-tracker-backend-azure-alpha.vercel.app/v1/auth/getUser \
  -H "Origin: https://expense-tracker-eta-ashy-39.vercel.app" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Accept: application/json" \
  -v
```

---

## ✅ Test Scenario 4: Add Expense (POST with auth)

**Preflight (automatic by browser):**
```bash
OPTIONS /v1/expense/add HTTP/1.1
```

**Actual request:**
```bash
POST /v1/expense/add HTTP/1.1
Host: expense-tracker-backend-azure-alpha.vercel.app
Origin: https://expense-tracker-eta-ashy-39.vercel.app
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "amount": 50.00,
  "category": "Food",
  "description": "Lunch",
  "date": "2024-04-22"
}
```

**Expected response (201 Created):**
```json
HTTP/1.1 201 Created
Access-Control-Allow-Origin: https://expense-tracker-eta-ashy-39.vercel.app
Access-Control-Allow-Credentials: true
Content-Type: application/json

{
  "message": "Expense added successfully",
  "expense": {
    "id": "expense_123",
    "amount": 50.00,
    "category": "Food",
    "description": "Lunch",
    "date": "2024-04-22",
    "userId": "user_123"
  }
}
```

**Test with cURL:**
```bash
curl -X POST https://expense-tracker-backend-azure-alpha.vercel.app/v1/expense/add \
  -H "Origin: https://expense-tracker-eta-ashy-39.vercel.app" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "category": "Food",
    "description": "Lunch",
    "date": "2024-04-22"
  }' \
  -v
```

---

## ✅ Test Scenario 5: Registration (POST without auth)

**Preflight (automatic):**
```bash
OPTIONS /v1/auth/register HTTP/1.1
```

**Actual request:**
```bash
POST /v1/auth/register HTTP/1.1
Host: expense-tracker-backend-azure-alpha.vercel.app
Origin: https://expense-tracker-eta-ashy-39.vercel.app
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User"
}
```

**Expected response (201 Created):**
```json
HTTP/1.1 201 Created
Access-Control-Allow-Origin: https://expense-tracker-eta-ashy-39.vercel.app
Content-Type: application/json

{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123456",
    "email": "newuser@example.com",
    "name": "New User"
  }
}
```

**Test with cURL:**
```bash
curl -X POST https://expense-tracker-backend-azure-alpha.vercel.app/v1/auth/register \
  -H "Origin: https://expense-tracker-eta-ashy-39.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User"
  }' \
  -v
```

---

## ✅ Browser DevTools Testing

### Step 1: Open Frontend
Navigate to: `https://expense-tracker-eta-ashy-39.vercel.app`

### Step 2: Open DevTools
- Windows/Linux: `F12` or `Ctrl+Shift+I`
- Mac: `Cmd+Option+I`

### Step 3: Go to Network Tab
- Click on "Network" tab
- Make sure "XHR/Fetch" filter is enabled

### Step 4: Trigger a Request
- Click "Login" button
- Or "Add Expense" button
- Or any API call

### Step 5: Check Preflight
- Look for TWO requests to same endpoint:
  1. **OPTIONS** (preflight) - should show `200 OK`
  2. **POST/GET/etc** (actual request) - should show `200/201 OK`

### Step 6: Verify Headers
- Click on OPTIONS request
- Go to "Response Headers" tab
- Verify:
  ✅ `access-control-allow-origin: https://expense-tracker-eta-ashy-39.vercel.app`
  ✅ `access-control-allow-methods: ...`
  ✅ `access-control-allow-headers: ...`
  ✅ Status: `200 OK`

---

## ✅ Error Troubleshooting

### Error: `PreflightMissingAllowOriginHeader`
**Meaning:** OPTIONS response missing `Access-Control-Allow-Origin` header
**Solution:** Check api/index.js CORS config - should be fixed now ✅

### Error: `net::ERR_FAILED`
**Meaning:** Browser rejected request due to CORS policy
**Solution:** Check origin validation in CORS middleware - should be fixed now ✅

### Error: `401 Unauthorized on OPTIONS request`
**Meaning:** Auth middleware blocking preflight
**Solution:** Check authMiddleware.js has OPTIONS skip - should be fixed now ✅

### Error: `401 Unauthorized on actual request`
**Meaning:** JWT token invalid or missing
**Solution:** 
- Ensure you logged in first (have valid JWT)
- Include `Authorization: Bearer YOUR_TOKEN` header
- Token not expired

### Error: `CORS policy: Origin not allowed`
**Meaning:** Frontend URL not in allowedOrigins
**Solution:** Add frontend URL to allowedOrigins in CORS config

---

## ✅ Success Indicators

When the fix is working, you should see:
- ✅ OPTIONS request returns `200 OK` (not 401, not 500)
- ✅ Actual request succeeds with correct status code
- ✅ `access-control-allow-*` headers present in OPTIONS response
- ✅ Browser DevTools shows NO CORS errors in Console
- ✅ Preflight requests complete in < 100ms
- ✅ Subsequent requests use cached preflight (faster)

---

## ✅ Performance Baseline

**Before fix:**
- Preflight request: ❌ 401 (failed)
- Actual request: ❌ blocked by browser
- User sees: CORS error

**After fix:**
- Preflight request: ✅ 200 (instant, ~50ms)
- Actual request: ✅ 200/201 (normal processing)
- User sees: ✅ App works!

---

## Quick Command to Test Everything

```bash
#!/bin/bash
# Replace YOUR_JWT_TOKEN_HERE with actual token from login response

echo "🧪 Test 1: Register"
curl -X POST https://expense-tracker-backend-azure-alpha.vercel.app/v1/auth/register \
  -H "Origin: https://expense-tracker-eta-ashy-39.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test"}' \
  -w "\nStatus: %{http_code}\n"

echo -e "\n🧪 Test 2: Login"
curl -X POST https://expense-tracker-backend-azure-alpha.vercel.app/v1/auth/login \
  -H "Origin: https://expense-tracker-eta-ashy-39.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  -w "\nStatus: %{http_code}\n"

echo -e "\n🧪 Test 3: Get User (requires token)"
curl -X GET https://expense-tracker-backend-azure-alpha.vercel.app/v1/auth/getUser \
  -H "Origin: https://expense-tracker-eta-ashy-39.vercel.app" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -w "\nStatus: %{http_code}\n"

echo -e "\n✅ All tests completed!"
```

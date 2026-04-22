/**
 * Enhanced CORS Middleware
 * Provides comprehensive CORS handling with support for preflight requests
 * and proper header configuration for frontend cross-origin requests
 */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://expense-tracker-eta-ashy-39.vercel.app",
];

/**
 * CORS Configuration Object
 * Use this with cors() middleware: app.use(cors(corsOptions))
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl requests, Postman, etc.)
    // OR requests from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // Cache preflight results for 24 hours
  optionsSuccessStatus: 200, // Some legacy browsers need 200 instead of 204
};

/**
 * Manual CORS Handler Middleware
 * Use this as a fallback or in addition to cors() middleware
 */
const manualCorsHandler = (req, res, next) => {
  const origin = req.headers.origin;

  // Allow specific origins or no origin
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin"
    );
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Max-Age", "86400");
  }

  // Handle OPTIONS preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
};

module.exports = {
  corsOptions,
  manualCorsHandler,
  allowedOrigins,
};

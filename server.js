

import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import cors from "cors";
import MongoStore from "connect-mongo"; // Add this import

dotenv.config();

console.log("=== Environment Check ===");
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Loaded" : "❌ Missing");
console.log("Port:", process.env.PORT);
console.log("=========================");

import connectDB from "./config/db.js";
import route from "./routes/authRoute.js";
import passport from "./config/passport.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - ADD THIS
app.get("/", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Health check - ADD THIS
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Session configuration with MongoStore
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      ttl: 24 * 60 * 60, // 1 day
      autoRemove: 'native',
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', 
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://react-supabase-frontend.vercel.app"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

app.use(passport.initialize());
app.use(passport.session());

const port = process.env.PORT || 5000;

app.use("/api/auth", route);

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Running on port:${port}`);
    });
  })
  .catch((err) => {
    console.error(err, "Failed to run the server");
  });
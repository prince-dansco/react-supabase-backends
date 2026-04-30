import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import cors from "cors"


dotenv.config();

console.log("=== Environment Check ===");
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Loaded" : "❌ Missing");
console.log("Port:", process.env.PORT);
console.log("=========================");



import connectDB from "./config/db.js";
import route from "./routes/authRoute.js";
import passport from "./config/passport.js";

// dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
  session({
    secret: process.env.SESSION_SECRET,  
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);



const allowedOrigins = [
  "http://localhost:5173",
  
  ""
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
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
            console.log(`Running on localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error(err, "Failed to run the server");
    });
import express from "express"
import { creatingUser, login,   getAllUsers
    ,googleCallback,  forgotPassword, resetPassword, getMe
 } from "../controllers/authController.js";
import protect from "../middleware/protect.js";
import passport from "../config/passport.js";

const route = express.Router();

route.post("/register", creatingUser)
route.post("/login", login)
route.get("/seeall",  protect, getAllUsers )
route.get("/me",  protect, getMe )


route.post("/forgot-password", forgotPassword);
route.post("/reset-password", resetPassword);

route.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

route.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/auth/google/failure" }),
  googleCallback
);

route.get("/google/failure", (req, res) => {
  res.status(401).json({ message: "Google authentication failed" });
});


export default route;
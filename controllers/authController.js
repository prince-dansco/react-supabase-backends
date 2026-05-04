import jwt from "jsonwebtoken";
import User from "../model/User.js";
import crypto  from "crypto"
import { sendWelcomeEmail, sendPasswordResetEmail } from "../utils/emailService.js";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
export const creatingUser = async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please provide name, email, and password" });
    }
    
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const user = await User.create({ name, email, password });

          await sendWelcomeEmail(email, name);
    
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.log("FULL ERROR:", error);  
        console.log(error, "fail to signup");
        return res.status(500).json({ message: "Server error", error: error.message }); 
    }
};
export const login = async (req, res) => {
    const { email, password } = req.body;
    
    // Add validation
    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" });
    }
    
    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        
        if (!user.password) {
            return res.status(401).json({ message: "Please login with Google" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.status(200).json({  
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.log(error, "fail to login");
        return res.status(500).json({ message: "Server error" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password"); 
        res.status(200).json({
            success: true,
            count: users.length,
            users: users
        });
    } catch (error) {
        console.log(error, "fail to get all users");
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const googleCallback = async (req, res) => {
  try {
    // req.user is set by passport after successful OAuth
    const token = generateToken(req.user._id);

    // Redirect to React frontend with token in URL
    res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/auth/google/failure`);
  }
};


// export const forgotPassword = async (req, res) => {
//   const { email } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const resetToken = crypto.randomBytes(32).toString("hex");
//     user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
//     user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    
//     await user.save();
    
//     // Send email
//     const emailResult = await sendPasswordResetEmail(email, resetToken);
    
//     if (!emailResult.success) {
//       return res.status(500).json({ message: "Error sending email" });
//     }
    
//     res.status(200).json({ message: "Password reset email sent" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    
    await user.save();

    console.log("Attempting to send email to:", email);
    console.log("EMAIL_USER set:", !!process.env.EMAIL_USER);
    console.log("EMAIL_PASS set:", !!process.env.EMAIL_PASS);
    console.log("CLIENT_URL:", process.env.CLIENT_URL);
    
    const emailResult = await sendPasswordResetEmail(email, resetToken);
    
    console.log("Email result:", emailResult);
    
    if (!emailResult.success) {
      console.error("Email failed:", emailResult.error); 
      return res.status(500).json({ 
        message: "Error sending email",
        error: emailResult.error  
      });
    }
    
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("forgotPassword full error:", error); 
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};




export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  
  try {
    const resetToken = crypto.createHash("sha256").update(token).digest("hex");
    
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

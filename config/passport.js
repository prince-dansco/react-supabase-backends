
// import dotenv from "dotenv";
// dotenv.config();



// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import User from "../model/User.js";

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/api/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ googleId: profile.id });

//         if (user) {
//           return done(null, user);
//         }

//         // Check if user exists with same email (signed up manually before)
//         user = await User.findOne({ email: profile.emails[0].value });

//         if (user) {
//           user.googleId = profile.id;
//           user.avatar = profile.photos[0].value;
//           await user.save();
//           return done(null, user);
//         }

//         // Create a brand new user
//         user = await User.create({
//           name: profile.displayName,
//           email: profile.emails[0].value,
//           googleId: profile.id,
//           avatar: profile.photos[0].value,
//         });

//         return done(null, user);
//       } catch (error) {
//         return done(error, null);
//       }
//     }
//   )
// );

// passport.serializeUser((user, done) => done(null, user.id));
// passport.deserializeUser(async (id, done) => {
//   const user = await User.findById(id);
//   done(null, user);
// });

// export default passport;


// config/passport.js


import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../model/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        console.log("Google OAuth attempt for email:", email);

        // Step 1: already has Google account
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          console.log("Found existing Google user");
          return done(null, user);
        }

        // Step 2: registered manually with same email
        user = await User.findOne({ email });
        if (user) {
          console.log("Found existing email user, linking Google account");
          user.googleId = profile.id;
          user.avatar = profile.photos[0].value;
          await user.save();
          return done(null, user);
        }

        // Step 3: brand new user
        console.log("Creating new Google user");
        user = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          avatar: profile.photos[0].value,
        });

        return done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error.message);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;


// import { sendWelcomeEmail } from "./utils/emailService.js";
// import dotenv from "dotenv";

// dotenv.config();

// async function test() {
//   const result = await sendWelcomeEmail("lorddansco@gmail.com", "Test User");
//   if (result.success) {
//     console.log("✅ Email sent successfully!");
//   } else {
//     console.error("❌ Failed:", result.error);
//   }


import { sendWelcomeEmail } from "./utils/emailService.js";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  console.log("=== TESTING BREVO SMTP ===\n");
  console.log("SMTP User:", process.env.BREVO_USER);
  console.log("SMTP Pass exists:", !!process.env.BREVO_PASS);
  
  const result = await sendWelcomeEmail("lorddansco@gmail.com", "Test User");
  
  if (result.success) {
    console.log("\n✅ Email sent successfully!");
  } else {
    console.error("\n❌ Failed:", result.error);
  }
}

test();
 

import { sendWelcomeEmail } from "./utils/emailService.js";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  const result = await sendWelcomeEmail("lorddansco@gmail.com", "Test User");
  if (result.success) {
    console.log("✅ Email sent successfully!");
  } else {
    console.error("❌ Failed:", result.error);
  }
}

test();
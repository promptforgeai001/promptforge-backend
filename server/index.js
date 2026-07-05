console.log("OPENAI:", process.env.OPENAI_API_KEY ? "FOUND" : "MISSING");
console.log("STRIPE:", process.env.STRIPE_SECRET_KEY ? "FOUND" : "MISSING");
console.log("FIREBASE:", process.env.FIREBASE_PROJECT_ID ? "FOUND" : "MISSING");
import express from "express";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import OpenAI from "openai";
import Stripe from "stripe";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import cors from "cors";
import nodemailer from "nodemailer";

dotenv.config({ override: true });
const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});


app.use(express.urlencoded({ extended: true }));



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore();


// ======================
//       ROUTES
// ======================
console.log("Creating checkout session with $4.99");
// Create Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      const userData = userSnap.data();

      if (userData.plan === "premium") {
        return res.status(400).json({
          error: "You are already a premium user.",
        });
      }
    }

    console.log("Creating checkout session with $4.99");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      metadata: { uid },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "PromptForge AI Pro" },
            unit_amount: 499,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
     success_url: "https://www.promptforgehub.com/payment-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://www.promptforgehub.com/pricing",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});
// Generate endpoint
app.post("/generate", async (req, res) => {
  try {
    const { input, uid } = req.body;

    if (!input || input.trim().length < 3) {
      return res.status(400).json({ error: "Please enter at least 3 characters." });
    }

    if (!uid) {
      return res.status(401).json({ error: "User ID is required" });
    }

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      const userData = userSnap.data();
      const today = new Date().toISOString().split("T")[0];

      let dailyCount = userData.dailyCount || 0;
      const plan = userData.plan || "free";

      if (userData.lastDate !== today) {
        dailyCount = 0;
      }

      if (plan !== "premium" && dailyCount >= 10) {
        return res.status(403).json({ error: "Daily limit reached. Upgrade to Premium." });
      }

      await userRef.update({
        dailyCount: dailyCount + 1,
        lastDate: today,
        promptsUsedToday: dailyCount + 1,
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
        content: `You are an expert prompt engineer. Create a highly detailed, professional, and effective prompt for the user's idea.`,
          },
        
        { role: "user", content: `User Idea: ${input}` },
      ],
      temperature: 0.7,
    });

    const generatedPrompt = completion.choices[0].message.content;

    res.json({ prompt: generatedPrompt });
  } catch (error) {
    console.error("Generate Error:", error);
    res.status(500).json({ error: "Failed to generate prompt. Please try again." });
  }
});



// Rewrite endpoint (single - duplicate එක ඉවත් කරලා)
app.post("/rewrite", async (req, res) => {
  try {
    const { input } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Rewrite the following professionally." },
        { role: "user", content: input },
      ],
    });

    res.json({ result: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/summarize", async (req, res) => {
  try {
    const { input } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Summarize this clearly and professionally." },
        { role: "user", content: input },
      ],
    });

    res.json({ result: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Upgrade success
app.post("/upgrade-success", async (req, res) => {
  try {
    const { uid } = req.body;
    await db.collection("users").doc(uid).update({ plan: "premium" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/change-plan", async (req, res) => {
  try {
    const { uid, plan } = req.body;
    await db.collection("users").doc(uid).update({ plan });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/ban-user", async (req, res) => {
  try {
    const { uid, banned } = req.body;
    await db.collection("users").doc(uid).update({ banned });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/reset-usage", async (req, res) => {
  try {
    const { uid } = req.body;
    await db.collection("users").doc(uid).update({
      dailyCount: 0,
      promptsUsedToday: 0,
      lastDate: new Date().toISOString().split("T")[0],
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/delete-user", async (req, res) => {
  try {
    const { uid } = req.body;
    await db.collection("users").doc(uid).delete();

    const prompts = await db.collection("savedPrompts").where("userId", "==", uid).get();
    const batch = db.batch();
    prompts.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/save-prompt", async (req, res) => {
  try {
    const { uid, prompt } = req.body;

    if (!uid || !prompt) {
      return res.status(400).json({ error: "Missing data" });
    }

    await db.collection("savedPrompts").add({
      userId: uid,
      prompt,
      createdAt: new Date(),
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/saved-prompts", async (req, res) => {
  try {
    const { uid } = req.query;

    const snap = await db
      .collection("savedPrompts")
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();

    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/contact", async (req, res) => {
  console.log("CONTACT ROUTE HIT:", req.body);

  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const smtpReady =
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.ADMIN_EMAIL;

    if (!smtpReady) {
      console.log("SMTP not configured. Contact message:");
      console.log({ name, email, subject, message });

      return res.json({
        success: true,
        message: "Message received. Email not configured yet.",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      text: `New contact message\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "We received your message",
      text: `Hi ${name},\n\nThanks for contacting us. We’ve received your message and will get back to you soon.\n\n— PromptForge Team`,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Contact Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to send message.",
    });
  }
});
// Stripe webhook
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const uid = session.metadata.uid;

    if (uid) {
      await db.collection("users").doc(uid).update({ plan: "premium" });
      console.log("User upgraded to premium:", uid);
    }
  }

  res.json({ received: true });
});


const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
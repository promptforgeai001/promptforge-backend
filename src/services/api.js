import { auth } from "./firebase";

/* ================= AI GENERATE ================= */

export async function generatePrompt(input) {

  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first");
  }

  const response = await fetch(
    "https://promptforge-backend-v8z7.onrender.com/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: input,
        uid: user.uid
      })
    }
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.prompt;
}

/* ================= AI REWRITE ================= */

export async function rewritePrompt(input) {

  const response = await fetch(
    "https://promptforge-backend-v8z7.onrender.com/rewrite",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ input })
    }
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.result;
}

/* ================= AI SUMMARIZE ================= */

export async function summarizePrompt(input) {

  const response = await fetch(
    "https://promptforge-backend-v8z7.onrender.com/summarize",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ input })
    }
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.result;
}

/* ================= STRIPE CHECKOUT ================= */

export async function createCheckoutSession() {

  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first");
  }

  const response = await fetch(
    "https://promptforge-backend-v8z7.onrender.com/create-checkout-session",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        uid: user.uid
      })
    }
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.url;
}
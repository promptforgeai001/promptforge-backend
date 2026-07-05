const { onRequest } = require("firebase-functions/v2/https");

exports.stripeWebhook = onRequest((req, res) => {
  console.log("Stripe event received:", req.body);

  res.status(200).send("Webhook received");
});
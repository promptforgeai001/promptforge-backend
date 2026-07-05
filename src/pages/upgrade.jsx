import { auth } from "../services/firebase";
import { useTheme } from "../context/ThemeContext";

function Upgrade() {
  const { theme } = useTheme();

  async function handleUpgrade() {
    const user = auth.currentUser;

    if (!user) {
      alert("Please login first");
      return;
    }

    try {
      const response = await fetch("https://promptforge-backend-v8z7.onrender.com/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Stripe URL not found");
      }
    } catch (error) {
      console.log(error);
      alert(error.message || "Something went wrong");
    }
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "80px 20px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "40px", marginBottom: "20px" }}>
        Upgrade to Pro
      </h1>

      <p style={{ opacity: 0.7, marginBottom: "40px" }}>
        Unlock unlimited prompts and premium features.
      </p>

      <div
        style={{
          background: theme === "dark" ? "#111" : "#f2f2f2",
          padding: "40px",
          borderRadius: "16px",
        }}
      >
        <h2 style={{ fontSize: "28px", marginBottom: "20px" }}>
          Pro Plan
        </h2>

        <p style={{ fontSize: "22px", marginBottom: "30px" }}>
          $4.99 / month
        </p>

        <button
          onClick={handleUpgrade}
          style={{
            background: "#2563eb",
            color: "white",
            padding: "15px 40px",
            borderRadius: "12px",
            fontSize: "18px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
}

export default Upgrade;
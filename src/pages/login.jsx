import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../services/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  sendEmailVerification,
} from "firebase/auth";

function Login() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const styles = {
    pageBg: isDark ? "#000" : "#fff",
    text: isDark ? "#fff" : "#000",
    card: isDark ? "#111827" : "#f3f4f6",
    border: isDark ? "#1f2937" : "#e5e7eb",
    muted: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)",
    inputBg: isDark ? "#0b1220" : "#fff",
    inputBorder: isDark ? "#1f2937" : "#d1d5db",
    primary: "#2563eb",
    danger: "#dc2626",
  };

  async function handleEmailLogin(e) {
    e.preventDefault();

    if (!email.trim()) return toast.error("Please enter your email");
    if (!password) return toast.error("Please enter your password");

    try {
      setLoading(true);

      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = result.user;

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        await signOut(auth);
        toast.error(
          "Email not verified! A new verification link has been sent. Please verify and try again.",
          { duration: 6000 }
        );
        return;
      }

      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        toast.error("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        toast.error("Incorrect password.");
      } else if (err.code === "auth/invalid-credential") {
        toast.error("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.");
      } else {
        toast.error(err?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Google login successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.message || "Google login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      toast.error("Enter your email first.");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
      toast.success("Password reset email sent!");
    } catch (err) {
      toast.error(err?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: styles.pageBg,
        color: styles.text,
        padding: "44px 16px",
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          margin: "0 auto",
          background: styles.card,
          border: `1px solid ${styles.border}`,
          borderRadius: "18px",
          padding: "28px",
          boxShadow: isDark
            ? "0 14px 50px rgba(0,0,0,0.5)"
            : "0 14px 45px rgba(0,0,0,0.12)",
        }}
      >
        <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 6 }}>
          Login
        </h1>
        <p style={{ color: styles.muted, marginBottom: 18 }}>
          Welcome back 👋 Please sign in to continue.
        </p>

        <form onSubmit={handleEmailLogin} style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ color: styles.muted, fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                border: `1px solid ${styles.inputBorder}`,
                background: styles.inputBg,
                color: styles.text,
                outline: "none",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ color: styles.muted, fontWeight: 600 }}>
              Password
            </label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: `1px solid ${styles.inputBorder}`,
                  background: styles.inputBg,
                  color: styles.text,
                  outline: "none",
                  fontSize: 14,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                style={{
                  borderRadius: "10px",
                  border: `1px solid ${styles.border}`,
                  background: isDark ? "#0b1220" : "#fff",
                  color: styles.text,
                  padding: "10px 12px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              background: styles.primary,
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "12px 16px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 800,
              fontSize: 15,
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              marginTop: 2,
            }}
          >
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              style={{
                background: "transparent",
                border: "none",
                color: isDark ? "#93c5fd" : "#1d4ed8",
                cursor: "pointer",
                fontWeight: 700,
                padding: 0,
              }}
            >
              Forgot Password?
            </button>

            <Link
              to="/register"
              style={{
                color: isDark ? "#93c5fd" : "#1d4ed8",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Create account
            </Link>
          </div>
        </form>

        <div style={{ marginTop: 18 }}>
          <div
            style={{ height: 1, background: styles.border, margin: "18px 0" }}
          />
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: "100%",
              background: isDark ? "#0b1220" : "#fff",
              border: `1px solid ${styles.border}`,
              color: styles.text,
              borderRadius: "12px",
              padding: "12px 16px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 800,
              transition: "opacity 0.2s ease",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Please wait..." : "Continue with Google"}
          </button>

          <p
            style={{
              color: styles.muted,
              marginTop: 14,
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            By continuing, you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
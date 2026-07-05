import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth, db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const navigate = useNavigate();

  async function handleRegister() {
    if (!email.trim()) return alert("Please enter your email");
    if (!password || password.length < 6)
      return alert("Password must be at least 6 characters");

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        plan: "free",
        banned: false,
        dailyCount: 0,
        lastDate: new Date().toISOString().split("T")[0],
        emailVerified: false,
        createdAt: serverTimestamp(),
      });

      await sendEmailVerification(user);

      await signOut(auth);

      setSent(true);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered. Please login.");
      } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        alert("Password must be at least 6 characters.");
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="bg-white/10 p-8 rounded-xl w-96 text-center">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
          <p className="text-white/70 mb-6">
            We sent a verification link to{" "}
            <span className="text-blue-400 font-bold">{email}</span>.
            <br />
            <br />
            Please check your inbox and spam folder, then click the link to
            verify your account.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-600 p-3 rounded font-bold hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
          <p className="text-white/50 text-sm mt-4">
            Didn't receive the email? Register again with the same email after a
            few minutes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-white/10 p-8 rounded-xl w-96">
        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-white/60 mb-6">
          A verification email will be sent to confirm your address.
        </p>
        <input
          className="w-full p-3 mb-4 bg-white/20 rounded"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-3 mb-4 bg-white/20 rounded"
          placeholder="Password (min 6 characters)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleRegister}
          disabled={loading}
          className={`w-full p-3 rounded font-bold transition ${
            loading
              ? "bg-blue-600/50 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
          }`}
        >
          {loading ? "Creating Account..." : "Register"}
        </button>
        <p className="text-center text-white/50 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-400 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
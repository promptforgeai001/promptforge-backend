import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

const ADMIN_EMAIL = "hirusha3458@gmail.com";

function AdminRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return null; // or show spinner UI

  if (!user) return <Navigate to="/login" />;

  const userEmail = (user.email || "").trim().toLowerCase();
  const adminEmail = ADMIN_EMAIL.trim().toLowerCase();

  if (userEmail !== adminEmail) return <Navigate to="/dashboard" replace />;

  return children;
}

export default AdminRoute;
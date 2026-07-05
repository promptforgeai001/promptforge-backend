import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import { auth, db } from "../services/firebase";

import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { useTheme } from "../context/ThemeContext";

function Profile() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [profileData, setProfileData] = useState({
    plan: "free",
    dailyCount: 0,
    promptsUsedToday: 0,
    banned: false,
  });

  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  const colors = useMemo(
    () => ({
      bg: isDark ? "#0b1220" : "#f9fafb",
      card: isDark ? "#0f172a" : "#ffffff",
      border: isDark ? "#1f2937" : "#e5e7eb",
      text: isDark ? "#e5e7eb" : "#0f172a",
      muted: isDark ? "#9ca3af" : "#6b7280",
      primary: "#2563eb",
      danger: "#dc2626",
      success: "#16a34a",
      inputBg: isDark ? "#111827" : "#ffffff",
      shadow: isDark
        ? "0 20px 60px rgba(0,0,0,0.35)"
        : "0 20px 60px rgba(2,6,23,0.10)",
    }),
    [isDark]
  );

  async function loadUserDoc(u) {
    try {
      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        setProfileData({
          plan: data.plan || "free",
          dailyCount: data.dailyCount || 0,
          promptsUsedToday: data.promptsUsedToday || 0,
          banned: data.banned === true,
        });
      } else {
        // new user
        setProfileData({
          plan: "free",
          dailyCount: 0,
          promptsUsedToday: 0,
          banned: false,
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load profile details.");
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);

      if (u) {
        setDisplayName(u.displayName || "");
        loadUserDoc(u);
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      toast.success("Logged out successfully.");
      navigate("/login");
    } catch (e) {
      toast.error(e.message || "Logout failed.");
    }
  }

  async function handleSaveDisplayName(e) {
    e.preventDefault();
    if (!user) return;

    const nextName = displayName.trim();
    if (!nextName) {
      toast.error("Display name cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      await updateProfile(user, { displayName: nextName });
      toast.success("Profile updated!");
    } catch (e) {
      toast.error(e.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: colors.muted }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    // if not logged in
    navigate("/login", { replace: true });
    return null;
  }

  const planPillStyle = {
    background: profileData.plan === "premium" ? "rgba(22,163,74,0.16)" : "rgba(107,114,128,0.18)",
    color: profileData.plan === "premium" ? "#22c55e" : "#9ca3af",
    border: `1px solid ${profileData.plan === "premium" ? "rgba(34,197,94,0.35)" : colors.border}`,
    padding: "8px 14px",
    borderRadius: "999px",
    fontWeight: 800,
    fontSize: 12,
    display: "inline-flex",
    gap: 8,
    alignItems: "center",
  };

  return (
    <div style={{ padding: "40px 0" }}>
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 20,
        }}
      >
        {/* Left: Profile card */}
        <div
          style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 18,
            padding: 24,
            boxShadow: colors.shadow,
          }}
        >
          <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: "50%",
                background: colors.primary,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "0 0 auto",
              }}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ color: "#fff", fontWeight: 900, fontSize: 22 }}>
                  {(user.email?.[0] || "U").toUpperCase()}
                </span>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: 28, color: colors.text, fontWeight: 900 }}>
                  {user.displayName?.trim() ? user.displayName : "Your Profile"}
                </h1>
                <span style={planPillStyle}>
                  {profileData.plan === "premium" ? "PREMIUM" : "FREE"}
                </span>
              </div>

              <p style={{ margin: "10px 0 0", color: colors.muted, wordBreak: "break-word" }}>
                <b>Email:</b> {user.email}
              </p>

              <p style={{ margin: "8px 0 0", color: colors.muted }}>
                <b>UID:</b> {user.uid}
              </p>

              {profileData.banned && (
                <p style={{ margin: "10px 0 0", color: "#ef4444", fontWeight: 800 }}>
                  Status: Banned
                </p>
              )}
            </div>
          </div>

          <div style={{ height: 18 }} />

          {/* Update display name */}
          <form onSubmit={handleSaveDisplayName}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <label style={{ display: "block", color: colors.muted, marginBottom: 8, fontWeight: 700 }}>
                  Display Name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{
                    width: "100%",
                    background: colors.inputBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    color: colors.text,
                    outline: "none",
                  }}
                  placeholder="Enter your display name"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  height: 44,
                  padding: "0 18px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 900,
                  background: saving ? "#93c5fd" : colors.primary,
                  color: "#fff",
                  transition: "all 0.2s ease",
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>

          <div style={{ height: 20 }} />

          {/* Logout */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={handleLogout}
              style={{
                height: 42,
                padding: "0 18px",
                borderRadius: 12,
                border: `1px solid ${colors.border}`,
                cursor: "pointer",
                fontWeight: 900,
                background: "transparent",
                color: colors.text,
              }}
            >
              Logout
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              style={{
                height: 42,
                padding: "0 18px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontWeight: 900,
                background: "rgba(37,99,235,0.15)",
                color: colors.primary,
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* Right: Usage card */}
        <div
          style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 18,
            padding: 22,
            boxShadow: colors.shadow,
            height: "fit-content",
          }}
        >
          <h2 style={{ margin: 0, color: colors.text, fontSize: 22, fontWeight: 900 }}>
            Usage & Plan
          </h2>
          <p style={{ marginTop: 8, color: colors.muted }}>
            Today usage and plan status.
          </p>

          <div style={{ height: 16 }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            <InfoRow label="Today's Usage" value={profileData.plan === "premium" ? "Unlimited" : `${profileData.promptsUsedToday || profileData.dailyCount}/10`} />
            <InfoRow label="Daily Count" value={String(profileData.dailyCount || 0)} />
            <InfoRow label="Plan" value={profileData.plan === "premium" ? "Premium" : "Free"} />
            <InfoRow
              label="Account Status"
              value={profileData.banned ? "Banned" : "Active"}
              valueColor={profileData.banned ? "#ef4444" : colors.success}
            />
          </div>

          <div style={{ height: 18 }} />

          <div
            style={{
              padding: 14,
              borderRadius: 14,
              border: `1px solid ${colors.border}`,
              background: isDark ? "rgba(255,255,255,0.02)" : "rgba(2,6,23,0.02)",
            }}
          >
            <p style={{ margin: 0, color: colors.muted, fontWeight: 700 }}>
              Tip
            </p>
            <p style={{ marginTop: 6, marginBottom: 0, color: colors.text, lineHeight: 1.6 }}>
              If you want more generations every day, upgrade to <b>Premium</b>.
            </p>

            <button
              onClick={() => navigate("/pricing")}
              style={{
                marginTop: 12,
                width: "100%",
                height: 44,
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontWeight: 900,
                background: colors.primary,
                color: "#fff",
              }}
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, valueColor }) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid rgba(148,163,184,0.25)",
        padding: 14,
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <span style={{ color: "inherit", fontWeight: 800, opacity: 0.9 }}>{label}</span>
      <span style={{ fontWeight: 1000, color: valueColor || "inherit" }}>{value}</span>
    </div>
  );
}

export default Profile;
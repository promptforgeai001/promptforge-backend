import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const [prompts, setPrompts] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [plan, setPlan] = useState("free");
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [todayUsage, setTodayUsage] = useState(0);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function loadData() {
    const user = auth.currentUser;

    if (!user) return;

    setUserEmail(user.email);

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      const data = userDoc.data();
      setPlan(data.plan || "free");
      setTodayUsage(data.dailyCount || 0);
    }

    const q = query(
      collection(db, "savedPrompts"),
      where("userId", "==", user.uid)
    );

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data()
    }));

    setPrompts(data);
    setFavoritesCount(data.filter((item) => item.favorite).length);
  }

  async function toggleFavorite(id, currentValue) {
    try {
      await updateDoc(doc(db, "savedPrompts", id), {
        favorite: !currentValue
      });

      toast.success(!currentValue ? "Added to favorites" : "Removed from favorites");

      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function deletePrompt(id) {
    const confirmDelete = window.confirm("Are you sure you want to delete this prompt?");

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "savedPrompts", id));
      toast.success("Prompt deleted");
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  }

  function copyPrompt(text) {
    navigator.clipboard.writeText(text);
    toast.success("Prompt copied!");
  }

  function downloadPrompt(text) {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "prompt.txt";
    link.click();

    toast.success("Prompt downloaded");
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredPrompts = prompts
    .filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        item.input?.toLowerCase().includes(searchText) ||
        item.prompt?.toLowerCase().includes(searchText);

      const matchesFilter =
        filter === "all" ||
        (filter === "favorites" && item.favorite);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;

      if (sortOrder === "newest") {
        return bTime - aTime;
      }

      return aTime - bTime;
    });

  const colors = {
    card: isDark ? "#111827" : "#f3f4f6",
    cardBorder: isDark ? "#1f2937" : "#e5e7eb",
    input: isDark ? "#111827" : "#ffffff",
    textMuted: isDark ? "#9ca3af" : "#4b5563",
    modal: isDark ? "#111827" : "#ffffff",
    modalText: isDark ? "#ffffff" : "#000000"
  };

  const pageStyle = {
    padding: "40px 0"
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "20px"
  };

  const baseButton = {
    padding: "10px 18px",
    minWidth: "95px",
    height: "42px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.25s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center"
  };

  function buttonHover(e) {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.opacity = "0.88";
  }

  function buttonLeave(e) {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.opacity = "1";
  }

  const primaryButton = {
    ...baseButton,
    background: "#2563eb",
    color: "#ffffff"
  };

  const dangerButton = {
    ...baseButton,
    background: "#dc2626",
    color: "#ffffff"
  };

  const greenButton = {
    ...baseButton,
    background: "#16a34a",
    color: "#ffffff"
  };

  const yellowButton = {
    ...baseButton,
    background: "#eab308",
    color: "#000000"
  };

  const blueButton = {
    ...baseButton,
    background: "#0284c7",
    color: "#ffffff"
  };

  const statCardStyle = {
    background: colors.card,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: "18px",
    padding: "24px",
    transition: "all 0.25s ease",
    boxShadow: isDark
      ? "0 10px 30px rgba(0,0,0,0.35)"
      : "0 10px 30px rgba(0,0,0,0.08)"
  };

  const promptCardStyle = {
    background: colors.card,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: "18px",
    padding: "26px",
    marginBottom: "22px",
    transition: "all 0.25s ease",
    boxShadow: isDark
      ? "0 8px 28px rgba(0,0,0,0.3)"
      : "0 8px 28px rgba(0,0,0,0.08)"
  };

  function cardHover(e) {
    e.currentTarget.style.transform = "translateY(-4px)";
    e.currentTarget.style.boxShadow = isDark
      ? "0 14px 40px rgba(37,99,235,0.18)"
      : "0 14px 40px rgba(37,99,235,0.12)";
  }

  function cardLeave(e) {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = isDark
      ? "0 8px 28px rgba(0,0,0,0.3)"
      : "0 8px 28px rgba(0,0,0,0.08)";
  }

  return (
    <div style={pageStyle}>

      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1
            style={{
              fontSize: "38px",
              fontWeight: "800",
              marginBottom: "8px"
            }}
          >
            Dashboard
          </h1>

          <p style={{ color: colors.textMuted, marginBottom: "6px" }}>
            Welcome back 👋
          </p>

          <p style={{ marginBottom: "12px" }}>
            {userEmail}
          </p>

          <span
            style={{
              display: "inline-block",
              padding: "7px 16px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: "700",
              background: plan === "premium" ? "#16a34a" : "#6b7280",
              color: "#ffffff"
            }}
          >
            {plan.toUpperCase()}
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            style={primaryButton}
            onClick={() => navigate("/")}
            onMouseEnter={buttonHover}
            onMouseLeave={buttonLeave}
          >
            Home
          </button>

          <button
            style={dangerButton}
            onClick={handleLogout}
            onMouseEnter={buttonHover}
            onMouseLeave={buttonLeave}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "40px"
        }}
      >
        <StatCard
          title="Saved Prompts"
          value={prompts.length}
          style={statCardStyle}
          onMouseEnter={cardHover}
          onMouseLeave={cardLeave}
          mutedColor={colors.textMuted}
        />

        <StatCard
          title="Favorites"
          value={favoritesCount}
          style={statCardStyle}
          onMouseEnter={cardHover}
          onMouseLeave={cardLeave}
          mutedColor={colors.textMuted}
        />

        <StatCard
          title="Plan"
          value={plan.toUpperCase()}
          style={statCardStyle}
          onMouseEnter={cardHover}
          onMouseLeave={cardLeave}
          mutedColor={colors.textMuted}
        />

        <StatCard
          title="Today's Usage"
          value={plan === "premium" ? "Unlimited" : `${todayUsage}/10`}
          style={statCardStyle}
          onMouseEnter={cardHover}
          onMouseLeave={cardLeave}
          mutedColor={colors.textMuted}
        />
      </div>

      {/* Controls */}
      <div style={{ marginTop: "60px" }}>
        <h2
          style={{
            fontSize: "30px",
            fontWeight: "800",
            marginBottom: "10px"
          }}
        >
          My Saved Prompts
        </h2>

        <p style={{ color: colors.textMuted, marginBottom: "22px" }}>
          You have{" "}
          <strong style={{ color: "#2563eb" }}>
            {prompts.length}
          </strong>{" "}
          saved prompts.
        </p>

        <div
          style={{
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
            marginBottom: "28px"
          }}
        >
          <input
            type="text"
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "320px",
              maxWidth: "100%",
              padding: "13px 16px",
              borderRadius: "12px",
              border: `1px solid ${colors.cardBorder}`,
              background: colors.input,
              color: isDark ? "#ffffff" : "#000000",
              outline: "none",
              fontSize: "15px"
            }}
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "13px 16px",
              borderRadius: "12px",
              border: `1px solid ${colors.cardBorder}`,
              background: colors.input,
              color: isDark ? "#ffffff" : "#000000",
              outline: "none",
              fontSize: "15px"
            }}
          >
            <option value="all">All Prompts</option>
            <option value="favorites">Favorites Only</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{
              padding: "13px 16px",
              borderRadius: "12px",
              border: `1px solid ${colors.cardBorder}`,
              background: colors.input,
              color: isDark ? "#ffffff" : "#000000",
              outline: "none",
              fontSize: "15px"
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Prompt List */}
      <div>
        {filteredPrompts.length === 0 ? (
          <p style={{ color: colors.textMuted }}>
            No prompts found.
          </p>
        ) : (
          filteredPrompts.map((item) => (
            <div
              key={item.id}
              style={promptCardStyle}
              onMouseEnter={cardHover}
              onMouseLeave={cardLeave}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "15px",
                  flexWrap: "wrap"
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "22px",
                      color: "#06b6d4",
                      marginBottom: "8px"
                    }}
                  >
                    {item.input}
                  </h3>

                  <p style={{ color: colors.textMuted, fontSize: "14px" }}>
                    {item.createdAt
                      ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
                      : "No date"}
                  </p>
                </div>

                <span
                  style={{
                    fontSize: "22px"
                  }}
                >
                  {item.favorite ? "⭐" : ""}
                </span>
              </div>

              <p
                style={{
                  marginTop: "18px",
                  lineHeight: "1.7",
                  color: isDark ? "#d1d5db" : "#374151"
                }}
              >
                {item.prompt?.length > 240
                  ? item.prompt.substring(0, 240) + "..."
                  : item.prompt}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "22px"
                }}
              >
                <button
                  style={yellowButton}
                  onClick={() => toggleFavorite(item.id, item.favorite)}
                  onMouseEnter={buttonHover}
                  onMouseLeave={buttonLeave}
                >
                  {item.favorite ? "Unfavorite" : "Favorite"}
                </button>

                <button
                  style={greenButton}
                  onClick={() => copyPrompt(item.prompt)}
                  onMouseEnter={buttonHover}
                  onMouseLeave={buttonLeave}
                >
                  Copy
                </button>

                <button
                  style={blueButton}
                  onClick={() => {
                    setSelectedPrompt(item);
                    setShowModal(true);
                  }}
                  onMouseEnter={buttonHover}
                  onMouseLeave={buttonLeave}
                >
                  View
                </button>

                <button
                  style={dangerButton}
                  onClick={() => deletePrompt(item.id)}
                  onMouseEnter={buttonHover}
                  onMouseLeave={buttonLeave}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && selectedPrompt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >
          <div
            style={{
              width: "720px",
              maxWidth: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              background: colors.modal,
              color: colors.modalText,
              borderRadius: "18px",
              padding: "28px",
              border: `1px solid ${colors.cardBorder}`
            }}
          >
            <h2
              style={{
                fontSize: "26px",
                marginBottom: "10px"
              }}
            >
              {selectedPrompt.input}
            </h2>

            <p
              style={{
                color: colors.textMuted,
                marginBottom: "20px"
              }}
            >
              Full generated prompt
            </p>

            <div
              style={{
                whiteSpace: "pre-line",
                lineHeight: "1.7",
                background: isDark ? "#030712" : "#f9fafb",
                padding: "20px",
                borderRadius: "14px",
                border: `1px solid ${colors.cardBorder}`
              }}
            >
              {selectedPrompt.prompt}
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "24px"
              }}
            >
              <button
                style={greenButton}
                onClick={() => copyPrompt(selectedPrompt.prompt)}
                onMouseEnter={buttonHover}
                onMouseLeave={buttonLeave}
              >
                Copy
              </button>

              <button
                style={yellowButton}
                onClick={() => downloadPrompt(selectedPrompt.prompt)}
                onMouseEnter={buttonHover}
                onMouseLeave={buttonLeave}
              >
                Download TXT
              </button>

              <button
                style={dangerButton}
                onClick={() => setShowModal(false)}
                onMouseEnter={buttonHover}
                onMouseLeave={buttonLeave}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ title, value, style, onMouseEnter, onMouseLeave, mutedColor }) {
  return (
    <div
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <p style={{ color: mutedColor, marginBottom: "10px" }}>
        {title}
      </p>

      <h2
        style={{
          fontSize: "30px",
          fontWeight: "800"
        }}
      >
        {value}
      </h2>
    </div>
  );
}

export default Dashboard;
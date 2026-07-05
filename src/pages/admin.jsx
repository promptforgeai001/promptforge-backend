import { useEffect, useMemo, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs
} from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

function Admin() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [totalUsers, setTotalUsers] = useState(0);
  const [premiumUsers, setPremiumUsers] = useState(0);
  const [freeUsers, setFreeUsers] = useState(0);
  const [bannedUsers, setBannedUsers] = useState(0);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [revenue, setRevenue] = useState("0.00");

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const API_URL = "http://localhost:5001";

  const colors = {
    bgCard: isDark ? "#111827" : "#f3f4f6",
    bgInput: isDark ? "#111827" : "#ffffff",
    border: isDark ? "#1f2937" : "#e5e7eb",
    textMuted: isDark ? "#9ca3af" : "#4b5563",
    text: isDark ? "#ffffff" : "#000000",
    tableHead: "#2563eb",
    modal: isDark ? "#111827" : "#ffffff"
  };

  async function loadStats() {
    try {
      setLoading(true);

      const usersSnapshot = await getDocs(collection(db, "users"));

      const usersData = usersSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));

      setUsers(usersData);
      setTotalUsers(usersData.length);

      const premium = usersData.filter((user) => user.plan === "premium");
      const free = usersData.filter((user) => user.plan !== "premium");
      const banned = usersData.filter((user) => user.banned === true);

      setPremiumUsers(premium.length);
      setFreeUsers(free.length);
      setBannedUsers(banned.length);

      // $4.99 monthly estimated revenue
      setRevenue((premium.length * 4.99).toFixed(2));

      const promptsSnapshot = await getDocs(collection(db, "savedPrompts"));
      setTotalPrompts(promptsSnapshot.size);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load admin stats");
    } finally {
      setLoading(false);
    }
  }

  async function postAction(endpoint, body, successMessage) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Action failed");
      }

      toast.success(successMessage);
      loadStats();

    } catch (error) {
      toast.error(error.message);
    }
  }

  async function changePlan(uid, plan) {
    await postAction(
      "/change-plan",
      { uid, plan },
      `User changed to ${plan}`
    );
  }

  async function toggleBan(uid, currentStatus) {
    await postAction(
      "/ban-user",
      { uid, banned: !currentStatus },
      currentStatus ? "User unbanned" : "User banned"
    );
  }

  async function resetUsage(uid) {
    await postAction(
      "/reset-usage",
      { uid },
      "Usage reset successfully"
    );
  }

  async function deleteUser(uid) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user and all saved prompts?"
    );

    if (!confirmDelete) return;

    await postAction(
      "/delete-user",
      { uid },
      "User deleted successfully"
    );
  }

  function formatDate(timestamp) {
    if (!timestamp?.seconds) return "-";
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  }

  function exportUsersCSV() {
    const headers = ["Email", "Plan", "Daily Count", "Banned", "Joined"];

    const rows = filteredUsers.map((user) => [
      user.email || "-",
      user.plan || "free",
      user.dailyCount || 0,
      user.banned ? "Yes" : "No",
      formatDate(user.createdAt)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "promptforge-users.csv";
    link.click();

    toast.success("Users exported");
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const email = user.email || "";

      const matchesSearch = email
        .toLowerCase()
        .includes(search.toLowerCase());

      let matchesFilter = true;

      if (filter === "premium") {
        matchesFilter = user.plan === "premium";
      }

      if (filter === "free") {
        matchesFilter = user.plan !== "premium";
      }

      if (filter === "banned") {
        matchesFilter = user.banned === true;
      }

      return matchesSearch && matchesFilter;
    });
  }, [users, search, filter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const planChartData = [
    { name: "Premium", value: premiumUsers },
    { name: "Free", value: freeUsers }
  ];

  const barChartData = [
    { name: "Users", value: totalUsers },
    { name: "Premium", value: premiumUsers },
    { name: "Prompts", value: totalPrompts },
    { name: "Banned", value: bannedUsers }
  ];

  const cardStyle = {
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: "18px",
    padding: "24px",
    transition: "all 0.25s ease",
    boxShadow: isDark
      ? "0 10px 30px rgba(0,0,0,0.35)"
      : "0 10px 30px rgba(0,0,0,0.08)"
  };

  function cardHover(e) {
    e.currentTarget.style.transform = "translateY(-4px)";
    e.currentTarget.style.boxShadow = isDark
      ? "0 18px 45px rgba(37,99,235,0.22)"
      : "0 18px 45px rgba(37,99,235,0.15)";
  }

  function cardLeave(e) {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = isDark
      ? "0 10px 30px rgba(0,0,0,0.35)"
      : "0 10px 30px rgba(0,0,0,0.08)";
  }

  const baseButton = {
    height: "40px",
    padding: "0 16px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
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

  const blueButton = {
    ...baseButton,
    background: "#2563eb",
    color: "#ffffff"
  };

  const redButton = {
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

  const grayButton = {
    ...baseButton,
    background: isDark ? "#374151" : "#e5e7eb",
    color: colors.text
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  return (
    <div style={{ padding: "40px 0" }}>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "40px"
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "40px",
              fontWeight: "800",
              marginBottom: "8px"
            }}
          >
            Admin Dashboard
          </h1>

          <p style={{ color: colors.textMuted }}>
            Manage users, subscriptions, prompts and platform analytics.
          </p>
        </div>

        <button
          style={blueButton}
          onClick={loadStats}
          onMouseEnter={buttonHover}
          onMouseLeave={buttonLeave}
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "50px"
        }}
      >
        <StatCard
          title="Total Users"
          value={totalUsers}
          emoji="👥"
          style={cardStyle}
          onMouseEnter={cardHover}
          onMouseLeave={cardLeave}
          muted={colors.textMuted}
        />

        <StatCard
          title="Premium Users"
          value={premiumUsers}
          emoji="💎"
          style={cardStyle}
          onMouseEnter={cardHover}
          onMouseLeave={cardLeave}
          muted={colors.textMuted}
        />

        <StatCard
          title="Free Users"
          value={freeUsers}
          emoji="🆓"
          style={cardStyle}
          onMouseEnter={cardHover}
          onMouseLeave={cardLeave}
          muted={colors.textMuted}
        />

        <StatCard
          title="Saved Prompts"
          value={totalPrompts}
          emoji="📄"
          style={cardStyle}
          onMouseEnter={cardHover}
          onMouseLeave={cardLeave}
          muted={colors.textMuted}
        />

        <StatCard
          title="Banned Users"
          value={bannedUsers}
          emoji="🚫"
          style={cardStyle}
          onMouseEnter={cardHover}
          onMouseLeave={cardLeave}
          muted={colors.textMuted}
        />

        <StatCard
          title="Estimated Revenue"
          value={`$${revenue}`}
          emoji="💰"
          style={cardStyle}
          onMouseEnter={cardHover}
          onMouseLeave={cardLeave}
          muted={colors.textMuted}
        />
      </div>

      {/* Charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "25px",
          marginBottom: "60px"
        }}
      >
        <div
          style={cardStyle}
          onMouseEnter={cardHover}
          onMouseLeave={cardLeave}
        >
          <h2 style={{ fontSize: "22px", marginBottom: "20px" }}>
            Plan Distribution
          </h2>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={planChartData}
                dataKey="value"
                outerRadius={90}
                label
              >
                <Cell fill="#2563eb" />
                <Cell fill="#6b7280" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div
          style={cardStyle}
          onMouseEnter={cardHover}
          onMouseLeave={cardLeave}
        >
          <h2 style={{ fontSize: "22px", marginBottom: "20px" }}>
            Platform Overview
          </h2>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="name" stroke={colors.textMuted} />
              <YAxis stroke={colors.textMuted} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Users Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "25px"
        }}
      >
        <div>
          <h2 style={{ fontSize: "30px", fontWeight: "800" }}>
            Users
          </h2>

          <p style={{ color: colors.textMuted, marginTop: "6px" }}>
            Showing {filteredUsers.length} users
          </p>
        </div>

        <button
          style={greenButton}
          onClick={exportUsersCSV}
          onMouseEnter={buttonHover}
          onMouseLeave={buttonLeave}
        >
          Export CSV
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "14px",
          flexWrap: "wrap",
          marginBottom: "25px"
        }}
      >
        <input
          type="text"
          placeholder="Search user email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "320px",
            maxWidth: "100%",
            padding: "13px 16px",
            borderRadius: "12px",
            border: `1px solid ${colors.border}`,
            background: colors.bgInput,
            color: colors.text,
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
            border: `1px solid ${colors.border}`,
            background: colors.bgInput,
            color: colors.text,
            outline: "none",
            fontSize: "15px"
          }}
        >
          <option value="all">All Users</option>
          <option value="premium">Premium Users</option>
          <option value="free">Free Users</option>
          <option value="banned">Banned Users</option>
        </select>
      </div>

      {/* Users Table */}
      <div
        style={{
          overflowX: "auto",
          borderRadius: "18px",
          border: `1px solid ${colors.border}`,
          background: colors.bgCard
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "900px"
          }}
        >
          <thead>
            <tr style={{ background: colors.tableHead, color: "#ffffff" }}>
              <th style={thStyle}>Joined</th>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Plan</th>
              <th style={thStyle}>Daily Count</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: "30px", textAlign: "center" }}>
                  Loading users...
                </td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: "30px", textAlign: "center" }}>
                  No users found.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: `1px solid ${colors.border}`
                  }}
                >
                  <td style={tdStyle}>
                    {formatDate(user.createdAt)}
                  </td>

                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px"
                      }}
                    >
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          background: "#2563eb",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700"
                        }}
                      >
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </div>

                      <div>
                        <p style={{ fontWeight: "700" }}>
                          {user.email || "No Email"}
                        </p>

                        <p
                          style={{
                            color: colors.textMuted,
                            fontSize: "12px"
                          }}
                        >
                          {user.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <StatusBadge
                      text={user.plan === "premium" ? "Premium" : "Free"}
                      type={user.plan === "premium" ? "success" : "neutral"}
                    />
                  </td>

                  <td style={tdStyle}>
                    {user.dailyCount || 0}
                  </td>

                  <td style={tdStyle}>
                    <StatusBadge
                      text={user.banned ? "Banned" : "Active"}
                      type={user.banned ? "danger" : "success"}
                    />
                  </td>

                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap"
                      }}
                    >
                      <button
                        style={blueButton}
                        onClick={() =>
                          changePlan(
                            user.id,
                            user.plan === "premium" ? "free" : "premium"
                          )
                        }
                        onMouseEnter={buttonHover}
                        onMouseLeave={buttonLeave}
                      >
                        {user.plan === "premium" ? "Make Free" : "Make Premium"}
                      </button>

                      <button
                        style={user.banned ? greenButton : redButton}
                        onClick={() => toggleBan(user.id, user.banned)}
                        onMouseEnter={buttonHover}
                        onMouseLeave={buttonLeave}
                      >
                        {user.banned ? "Unban" : "Ban"}
                      </button>

                      <button
                        style={yellowButton}
                        onClick={() => resetUsage(user.id)}
                        onMouseEnter={buttonHover}
                        onMouseLeave={buttonLeave}
                      >
                        Reset
                      </button>

                      <button
                        style={redButton}
                        onClick={() => deleteUser(user.id)}
                        onMouseEnter={buttonHover}
                        onMouseLeave={buttonLeave}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "25px"
          }}
        >
          <button
            style={grayButton}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>

          <span
            style={{
              padding: "10px 14px",
              color: colors.textMuted
            }}
          >
            Page {currentPage} of {totalPages}
          </span>

          <button
            style={grayButton}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
}

const thStyle = {
  padding: "16px",
  textAlign: "left",
  fontSize: "14px"
};

const tdStyle = {
  padding: "16px",
  verticalAlign: "middle"
};

function StatCard({ title, value, emoji, style, onMouseEnter, onMouseLeave, muted }) {
  return (
    <div
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <p style={{ color: muted, marginBottom: "12px" }}>
        {emoji} {title}
      </p>

      <h2
        style={{
          fontSize: "34px",
          fontWeight: "800"
        }}
      >
        {value}
      </h2>
    </div>
  );
}

function StatusBadge({ text, type }) {
  const styles = {
    success: {
      background: "rgba(22,163,74,0.16)",
      color: "#22c55e"
    },
    danger: {
      background: "rgba(220,38,38,0.16)",
      color: "#ef4444"
    },
    neutral: {
      background: "rgba(107,114,128,0.18)",
      color: "#9ca3af"
    }
  };

  return (
    <span
      style={{
        ...styles[type],
        padding: "6px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "700"
      }}
    >
      {text} 
    </span>
  );
}

export default Admin;
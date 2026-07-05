import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../services/firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

const ADMIN_EMAIL = "hirusha3458@gmail.com";

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);

      const email = (u?.email || "").trim().toLowerCase();
      const adminEmail = ADMIN_EMAIL.trim().toLowerCase();
      setIsAdmin(email === adminEmail);
    });

    return () => unsub();
  }, []);

  const linkStyle = (path) => ({
    position: "relative",
    textDecoration: "none",
    color:
      location.pathname === path
        ? "#3b82f6"
        : theme === "dark"
          ? "#fff"
          : "#000",
    paddingBottom: "4px",
    transition: "all 0.3s ease",
    fontWeight: 500,
  });

  const underlineStyle = (path) => ({
    position: "absolute",
    left: 0,
    bottom: 0,
    width: location.pathname === path ? "100%" : "0%",
    height: "2px",
    backgroundColor: "#3b82f6",
    transition: "width 0.3s ease",
  });

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/library", label: "Prompt Library" },
    { path: "/pricing", label: "Pricing" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <nav
      style={{
        padding: "15px 20px",
        borderBottom: theme === "dark" ? "1px solid #333" : "1px solid #e5e7eb",
        backgroundColor: theme === "dark" ? "#000" : "#fff",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#3b82f6",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
          onClick={() => setMenuOpen(false)}
        >
          PromptForge AI
        </Link>

        {/* Desktop menu */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "center",
          }}
          className="desktop-nav"
        >
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} style={linkStyle(item.path)}>
              {item.label}
              <span style={underlineStyle(item.path)} />
            </Link>
          ))}

          <button
            onClick={toggleTheme}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: "none",
              background: theme === "dark" ? "#1f2937" : "#e5e7eb",
              color: theme === "dark" ? "#fff" : "#000",
              cursor: "pointer",
            }}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>

          {user ? (
            <Link
              to="/profile"
              style={{ textDecoration: "none" }}
              aria-label="Profile"
            >
              <div
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  background: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ color: "white", fontWeight: 800 }}>
                    {user.email?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <Link to="/login" style={{ fontWeight: 600, textDecoration: "none" }}>
              Login
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" style={{ marginLeft: 12, fontWeight: 700, textDecoration: "none" }}>
              Admin Dashboard
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "transparent",
            border: "none",
            fontSize: "28px",
            cursor: "pointer",
            color: theme === "dark" ? "#fff" : "#000",
          }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            marginTop: "15px",
            padding: "15px",
            borderTop: theme === "dark" ? "1px solid #333" : "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
          className="mobile-menu"
        >
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: "none",
                color:
                  location.pathname === item.path
                    ? "#3b82f6"
                    : theme === "dark"
                      ? "#fff"
                      : "#000",
                fontWeight: 500,
              }}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <button
            onClick={toggleTheme}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "none",
              background: theme === "dark" ? "#1f2937" : "#e5e7eb",
              color: theme === "dark" ? "#fff" : "#000",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>

          {user ? (
            <Link
              to="/profile"
              style={{ textDecoration: "none", fontWeight: 600 }}
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </Link>
          ) : (
            <Link
              to="/login"
              style={{ textDecoration: "none", fontWeight: 600 }}
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              style={{ textDecoration: "none", fontWeight: 700 }}
              onClick={() => setMenuOpen(false)}
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}

      {/* Mobile/desktop switching CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }

        @media (min-width: 769px) {
          .mobile-menu-btn {
            display: none !important;
          }
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
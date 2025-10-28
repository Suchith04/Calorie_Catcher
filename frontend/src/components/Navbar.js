import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedin, logout } from "../utils/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        {/* Left Logo */}
        <div style={styles.left}>
          <h2 style={styles.logo}>Calorie Catcher</h2>
        </div>

        {/* Hamburger icon (visible on small screens) */}
        <div style={styles.hamburger} onClick={toggleMenu}>
          <div style={styles.bar}></div>
          <div style={styles.bar}></div>
          <div style={styles.bar}></div>
        </div>

        {/* Right Links */}
        <div
          style={{
            ...styles.right,
            ...(menuOpen ? styles.menuOpen : {}),
          }}
        >
          {isLoggedin() && (
            <Link to="/dashboard" style={styles.link} onClick={() => setMenuOpen(false)}>
              Home
            </Link>
          )}
          {isLoggedin() && (
            <Link to="/history" style={styles.link} onClick={() => setMenuOpen(false)}>
              History
            </Link>
          )}

          {isLoggedin() ? (
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          ) : (
            <Link to="/login" style={styles.loginBtn} onClick={() => setMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    width: "100vw", // ✅ Full width
    backgroundColor: "#1e293b",
    color: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 40px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  left: { display: "flex", alignItems: "center" },
  logo: { margin: 0, fontSize: "22px", fontWeight: "bold", color: "#fff" },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "16px",
  },
  loginBtn: {
    color: "#fff",
    background: "#3b82f6",
    padding: "8px 16px",
    borderRadius: "8px",
    textDecoration: "none",
  },
  logoutBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  hamburger: {
    display: "none",
    flexDirection: "column",
    cursor: "pointer",
  },
  bar: {
    width: "25px",
    height: "3px",
    backgroundColor: "#fff",
    margin: "4px 0",
    borderRadius: "2px",
  },

  // Mobile Menu Styles
  menuOpen: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    // top: "60px",
    right: "0",
    backgroundColor: "#1e293b",
    padding: "20px",
    width: "100%",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    gap: "15px",
  },
};

// 🧠 Responsive overrides (CSS-in-JS trick)
const mediaQuery = window.matchMedia("(max-width: 768px)");
if (mediaQuery.matches) {
  styles.right = { display: "none" };
  styles.hamburger = { ...styles.hamburger, display: "flex" };
}

export default Navbar;

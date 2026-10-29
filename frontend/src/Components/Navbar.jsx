import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function handleSearch(event) {
    event.preventDefault();

    if (search.trim()) {
      navigate(`/charities?search=${encodeURIComponent(search.trim())}`);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMenuOpen(false);
    navigate("/login");
    window.location.reload();
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <span className="brand-logo">♥</span>
        <span className="brand-name">
          Crow<span>Funding</span>
          <small>Small Steps. Big Impact.</small>
        </span>
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/charities">Donate</Link>
        <Link to="/charity/register">Fundraise</Link>
        <Link to="/charities">Initiatives</Link>
        <Link to="/about">About</Link>
      </div>

      <form className="navbar-search" onSubmit={handleSearch}>
  <input
    type="search"
    placeholder="Search charities..."
    value={search}
    onChange={(event) => setSearch(event.target.value)}
  />

  <button type="submit">Search</button>
</form>

      <Link to="charity/register" className="campaign-btn">
        {" "}
        + Start a Campaign
      </Link>

      <div className="account-area">
        {token && user ? (
          <div className="user-menu">
            <button
              className="user-button"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="user-avatar">
                {(user.name || "U").charAt(0).toUpperCase()}
              </span>
              <span>{user.name || "My Account"}</span>
              <span>⌄</span>
            </button>

            {menuOpen && (
              <div className="dropdown">
                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                  My Profile
                </Link>
                <Link to="/donation-history" onClick={() => setMenuOpen(false)}>
                  My Donations
                </Link>
                <Link to="/charity/profile" onClick={() => setMenuOpen(false)}>
                  My Campaigns
                </Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="login-btn">
              Login
            </Link>
            <Link to="/register" className="register-btn">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

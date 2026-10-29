import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import "./user.css";

function Profile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function getProfile() {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");

        const response = await api.get(`/user/profile/${storedUser.id}`);

        const user = response.data.user;

        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        });
      } catch (error) {
        console.error("Get profile error:", error.response?.data || error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
        } else {
          setMessage(
            error.response?.data?.message || "Unable to load your profile",
          );
        }
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [navigate]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleUpdate(event) {
    event.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");

      if (!storedUser?.id) {
        setMessage("User information not found. Please log in again.");
        navigate("/login", { replace: true });
        return;
      }

      // Use this URL if your backend route is PUT /user/:id
      const response = await api.put(
        `/user/profile/${storedUser.id}`,
        formData,
      );

      const updatedUser = response.data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setFormData({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
      });

      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Update profile error:", error.response?.data || error);

      setMessage(error.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="page-message">Loading profile...</p>;
  }

  return (
    <div className="profile-page">
      <div className="profile-info">
        <h2>My Information</h2>
        <p>
          <strong>Name:</strong> {formData.name}
        </p>
        <p>
          <strong>Email:</strong> {formData.email}
        </p>
        <p>
          <strong>Phone:</strong> {formData.phone}
        </p>
      </div>

      <div className="profile-card">
        <h2>Edit Profile</h2>
        <p>Update your CrowFunding account details.</p>

        <form onSubmit={handleUpdate}>
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          {message && <p className="auth-message">{message}</p>}

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Update Profile"}
          </button>
        </form>

        <Link className="history-link" to="/donation-history">
          View My Donation History
        </Link>
      </div>
    </div>
  );
}

export default Profile;

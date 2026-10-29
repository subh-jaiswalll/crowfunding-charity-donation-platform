
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import "./Charity.css";

function CharityProfile() {
  const [charity, setCharity] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function getCharity() {
      try {
        const response = await api.get("/ngo/my-profile");
        setCharity(response.data.ngo || response.data);
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "Unable to load charity profile."
        );
      }
    }

    getCharity();
  }, []);

  if (!charity) {
    return <p>{message || "Loading charity profile..."}</p>;
  }

  const photoUrl = charity.photo
    ? charity.photo.startsWith("http")
      ? charity.photo
      : `http://localhost:3000/uploads/${charity.photo.replace(/^\/+/, "")}`
    : "";

  return (
    <div className="charity-profile">
      <h2>My Charity Profile</h2>

      {photoUrl ? (
        <img
          src={photoUrl}
          alt={charity.name}
          className="charity-photo"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.style.display = "none";
            setMessage("Charity photo could not be loaded.");
          }}
        />
      ) : (
        <p>No charity photo uploaded.</p>
      )}

      <h3>{charity.name}</h3>

      <p><strong>Mission:</strong> {charity.mission}</p>
      <p><strong>Goal:</strong> {charity.goal}</p>
      <p><strong>Project:</strong> {charity.project}</p>
      <p><strong>Category:</strong> {charity.category}</p>
      <p><strong>Address:</strong> {charity.address}</p>
      <p><strong>City:</strong> {charity.city}</p>
      <p><strong>State:</strong> {charity.state}</p>
      <p><strong>Email:</strong> {charity.contactEmail}</p>

      <p>
        <strong>Verification:</strong>{" "}
        {charity.verificationStatus}
      </p>

      {message && <p>{message}</p>}

      <Link to="/charity/update">Update Charity Details</Link>
    </div>
  );
}

export default CharityProfile;

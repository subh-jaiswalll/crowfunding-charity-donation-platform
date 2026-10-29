
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api";
import "./Charity.css";

function CharityDetails() {
  const { id } = useParams();

  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCharityById() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/ngo/${id}`);
        const data = response.data;

        setCharity(data.ngo || data.charity || data);
      } catch (err) {
        console.error("Unable to load charity:", err);

        setError(
          err.response?.status === 404
            ? "Charity not found."
            : "Unable to load charity details."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCharityById();
  }, [id]);

  function getPhoto(charity) {
    const fallback =
      "https://placehold.co/600x400/e5f4eb/176b4d?text=No+Photo";

    if (!charity.photo) {
      return fallback;
    }

    if (/^https?:\/\//i.test(charity.photo)) {
      return charity.photo;
    }

    const filename = charity.photo.replace(/^\/+/, "");

    return `http://localhost:3000/uploads/${filename}`;
  }

  if (loading) {
    return (
      <p className="charity-details-message">
        Loading charity...
      </p>
    );
  }

  if (error || !charity) {
    return (
      <div className="charity-details-message">
        <h2>{error || "Charity not found."}</h2>
        <Link to="/charities">← View All Charities</Link>
      </div>
    );
  }

  return (
    <main className="charity-details-page">
      <Link to="/charities" className="details-back-link">
        ← All Charities
      </Link>

      <article className="charity-details-card">
        <img
          className="home-charity-image"
          src={getPhoto(charity)}
          alt={charity.name || "Charity"}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src =
              "https://placehold.co/600x400/e5f4eb/176b4d?text=Photo+Unavailable";
          }}
        />

        <div className="charity-details-content">
          <span className="details-category">
            {charity.category || "Community"}
          </span>

          <h1>{charity.name}</h1>

          <h2>Our Mission</h2>
          <p>
            {charity.mission || "Mission details are not available."}
          </p>

          <h2>Our Project</h2>
          <p>
            {charity.project || "Project details are not available."}
          </p>

          <h2>Our Goal</h2>
          <p>{charity.goal || "Goal details are not available."}</p>

          <h2>Location</h2>
          <p>
            {[charity.address, charity.city, charity.state]
              .filter(Boolean)
              .join(", ") || "Location not provided"}
          </p>

          {charity.contactEmail && (
            <>
              <h2>Contact Email</h2>
              <p>{charity.contactEmail}</p>
            </>
          )}

          <div className="charity-details-actions">
            <Link to={`/donate?charityId=${charity.id}`}>
              Donate Now
            </Link>

            <Link
              to={`/charity/${charity.id}/impact-reports`}
              className="details-impact-button"
            >
              View Impact Reports
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}

export default CharityDetails;

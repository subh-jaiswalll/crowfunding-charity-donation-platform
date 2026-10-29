
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api";
import "./Charity.css";

function Charities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchParams] = useSearchParams();

  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const limit = 9;

  // Reset pagination when the filter changes
  useEffect(() => {
    setPage(1);
  }, [category, search]);

  // Fetch charities for the current page
  useEffect(() => {
    async function fetchCharities() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/ngo?page=${page}&limit=${limit}`
        );

        const data = response.data;
        const list = data.ngos || data.charities || data.rows || [];

        setCharities(
          list.filter(
            (charity) =>
              charity.verificationStatus === "APPROVED"
          )
        );

        const pages =
          data.pagination?.totalPages ??
          data.totalPages ??
          1;

        setTotalPages(Math.max(1, pages));
      } catch (err) {
        console.error("Unable to load charities:", err);
        setError("Could not load charities. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchCharities();
  }, [page]);

  function getPhoto(charity) {
    if (!charity.photo) {
      return "https://placehold.co/600x400/e5f4eb/176b4d?text=No+Photo";
    }

    if (/^https?:\/\//i.test(charity.photo)) {
      return charity.photo;
    }

    const filename = charity.photo.replace(/^\/+/, "");
    return `http://localhost:3000/uploads/${filename}`;
  }

  // These filters apply to the charities currently loaded on this page
  const filteredCharities = charities.filter((charity) => {
    const matchesCategory =
      !category || charity.category === category;

    const text = [
      charity.name || "",
      charity.mission || "",
      charity.city || "",
      charity.state || "",
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="charities-page">
      <section className="charities-header">
        <span>MAKE A DIFFERENCE</span>
        <h1>Explore All Charities</h1>
        <p>
          Discover causes and support communities that matter to you.
        </p>
      </section>

      <div className="charities-toolbar">
        <div>
          <h2>{category || "All Causes"}</h2>
          <p>
            {loading
              ? "Loading charities..."
              : `${filteredCharities.length} charities on this page`}
          </p>
        </div>

        <Link to="/" className="back-home-link">
          ← Back to Home
        </Link>
      </div>

      {loading ? (
        <p className="charities-message">Loading charities...</p>
      ) : error ? (
        <p className="charities-message error-message">{error}</p>
      ) : filteredCharities.length === 0 ? (
        <div className="charities-empty">
          <h2>No charities found</h2>
          <p>Try another search or explore all causes.</p>
          <Link to="/charities">View all charities</Link>
        </div>
      ) : (
        <div className="all-charity-grid">
          {filteredCharities.map((charity) => (
            <article className="all-charity-card" key={charity.id}>
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

              <div className="all-charity-content">
                <span className="all-charity-category">
                  {charity.category || "Community"}
                </span>

                <h3>{charity.name}</h3>

                <p>
                  {charity.mission ||
                    charity.project ||
                    "Supporting positive change in the community."}
                </p>

                <p className="all-charity-location">
                  📍{" "}
                  {[charity.city, charity.state]
                    .filter(Boolean)
                    .join(", ") || "India"}
                </p>

                <Link
                  to={`/charities/${charity.id}`}
                  className="all-charity-button"
                >
                  View Details →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <nav className="charity-pagination" aria-label="Charity pages">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            ← Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next →
          </button>
        </nav>
      )}
    </main>
  );
}

export default Charities;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./Home.css";

function Home() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [subscriberEmail, setSubscriberEmail] = useState("");
const [subscribeMessage, setSubscribeMessage] = useState("");


  useEffect(() => {
    async function fetchCharities() {
      try {
        const response = await api.get("/ngo?page=1&limit=6");
        const data = response.data;

        const list = Array.isArray(data)
          ? data
          : data.ngos || data.charities || data.rows || [];

        setCharities(
          list.filter(
            (charity) =>
              !charity.verificationStatus ||
              charity.verificationStatus === "APPROVED",
          ),
        );
      } catch (error) {
        console.error("Unable to load charities:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCharities();
  }, []);

  const categories = [
    {
      icon: "📚",
      name: "Education",
      description: "Help children access learning.",
    },
    {
      icon: "🏥",
      name: "Healthcare",
      description: "Support healthier communities.",
    },
    {
      icon: "🍲",
      name: "Food and Hunger Relief",
      description: "Help families access meals.",
    },
    { icon: "🌱", name: "Environment", description: "Protect our planet." },
    {
      icon: "🐾",
      name: "Animal Welfare",
      description: "Care for animals in need.",
    },
    {
      icon: "🤝",
      name: "Community Development",
      description: "Build stronger communities.",
    },
  ];


async function handleSubscribe(event) {
  event.preventDefault();
  setSubscribeMessage("");

  try {
    const response = await api.post("/email/subscribe", {
      email: subscriberEmail.trim(),
    });

    setSubscribeMessage(response.data.message);
    setSubscriberEmail("");
  } catch (error) {
    setSubscribeMessage(
      error.response?.data?.message ||
        "Unable to subscribe. Check your server connection."
    );
  }
}

function getPhoto(charity) {
  if (!charity.photo) {
    return "https://placehold.co/600x400/e5f4eb/176b4d?text=No+Photo";
  }

  if (
    charity.photo.startsWith("http://") ||
    charity.photo.startsWith("https://")
  ) {
    return charity.photo;
  }

  return `http://localhost:3000/uploads/${charity.photo.replace(/^\/+/, "")}`;
}


  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-tag">GIVE HOPE. CHANGE LIVES.</span>

          <h1>
            Small Steps.
            <br />
            <span>Big Impact.</span>
          </h1>

          <p>
            Every act of kindness can change a life. Discover meaningful causes,
            support trusted charities, and help create a better future for
            everyone.
          </p>

          <div className="hero-buttons">
            <Link to="/charities" className="hero-primary-btn">
              Explore Charities →
            </Link>

            <Link to="/charity/register" className="hero-secondary-btn">
              Register Your Charity
            </Link>
          </div>

          <div className="hero-trust">
            <span>✓ Discover meaningful causes</span>
            <span>✓ Support communities</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-card">
            <img
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=85"
              alt="Volunteers helping children in a community"
            />

            <div className="hero-image-caption">
              <span className="caption-heart">♥</span>
              <div>
                <strong>Every contribution matters</strong>
                <p>Be part of something meaningful.</p>
              </div>
            </div>
          </div>
          <div className="hero-decoration" />
        </div>
      </section>

      <section className="impact-strip">
        <div>
          <strong>One Community</strong>
          <span>United by kindness</span>
        </div>
        <div>
          <strong>Many Causes</strong>
          <span>Support what matters</span>
        </div>
        <div>
          <strong>Lasting Change</strong>
          <span>Make every action count</span>
        </div>
      </section>

      <section className="categories-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">FIND YOUR CAUSE</span>
            <h2>What do you care about?</h2>
            <p>Choose a cause and discover charities making a difference.</p>
          </div>
          <Link to="/charities" className="text-link">
            Explore all causes →
          </Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/charities?category=${encodeURIComponent(category.name)}`}
              className="category-card"
            >
              <span className="category-icon">{category.icon}</span>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <span className="category-arrow">Explore cause →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="home-about">
        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=900&q=85"
            alt="Volunteers working together to help the community"
          />
        </div>

        <div className="about-content">
          <span className="section-eyebrow">ABOUT OUR PLATFORM</span>

          <h2>Together, we can make a difference.</h2>

          <p>
            Our platform connects people who want to help with charities working
            to improve lives. We make it easier to discover meaningful causes,
            support communities, and contribute to a better future.
          </p>

          <div className="about-points">
            <div>
              <span>✓</span>
              <p>Discover meaningful charitable causes</p>
            </div>

            <div>
              <span>✓</span>
              <p>Connect with charitable organizations</p>
            </div>

            <div>
              <span>✓</span>
              <p>Make a positive impact through donations</p>
            </div>
          </div>

          <Link to="/about" className="about-learn-btn">
            Learn More About Us →
          </Link>
        </div>
      </section>

      <section className="charities-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">MAKE A DIFFERENCE</span>
            <h2>Charities worth supporting</h2>
            <p>Explore organizations working to create positive change.</p>
          </div>

          <Link to="/charities" className="text-link">
            View all charities →
          </Link>
        </div>

        {loading ? (
          <p className="home-message">Loading charities...</p>
        ) : charities.length === 0 ? (
          <div className="home-empty">
            <span>♡</span>
            <h3>Every great cause starts somewhere.</h3>
            <p>Check back soon to discover charities on our platform.</p>
            <Link to="/charities">Explore charities</Link>
          </div>
        ) : (
          <div className="charity-card-grid">
            {charities.map((charity) => (
              <article className="home-charity-card" key={charity.id}>
                <img
                  className="home-charity-image"
                  src={getPhoto(charity)}
                  alt={charity.name}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src =
                      "https://placehold.co/600x400/e5f4eb/176b4d?text=Photo+Unavailable";
                  }}
                />

                <div className="home-charity-content">
                  <span className="charity-category">
                    {charity.category || "Community"}
                  </span>

                  <h3>{charity.name}</h3>
                  <p>
                    {charity.mission ||
                      charity.project ||
                      "Supporting meaningful change in the community."}
                  </p>

                  <div className="charity-location">
                    <span>⌖</span>
                    {[charity.city, charity.state].filter(Boolean).join(", ") ||
                      "India"}
                  </div>

                  <Link
                    to={`/charities/${charity.id}`}
                    className="charity-details-link"
                  >
                    Learn more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      
<section className="subscribe-section">
  <div className="subscribe-content">
    <span className="subscribe-tag">STAY CONNECTED</span>

    <h2>Good things are worth sharing.</h2>

    <p>
      Subscribe to receive updates about new NGOs, upcoming charity
      events, inspiring stories, and opportunities to make a difference.
    </p>

    <div className="subscribe-benefits">
      <span>✓ New charity updates</span>
      <span>✓ Upcoming events</span>
      <span>✓ Inspiring impact stories</span>
    </div>

<form className="subscribe-form" onSubmit={handleSubscribe}>
  <input
    type="email"
    placeholder="Enter your email address"
    aria-label="Email address for updates"
    value={subscriberEmail}
    onChange={(event) => {
      setSubscriberEmail(event.target.value);
      setSubscribeMessage("");
    }}
    required
  />

  <button type="submit">Subscribe →</button>
</form>

{subscribeMessage && (
  <p className="subscribe-message" role="status">
    {subscribeMessage}
  </p>
)}

    <small>
      Stay informed about causes that matter. You can unsubscribe anytime.
    </small>
  </div>

  <div className="subscribe-decoration" aria-hidden="true">
    <span className="subscribe-icon">✉</span>
    <span className="subscribe-heart">♥</span>
    <span className="subscribe-star">✦</span>
  </div>
</section>


      <section className="home-cta">
        <div>
          <span className="section-eyebrow">ARE YOU MAKING A DIFFERENCE?</span>
          <h2>Bring your cause to the community.</h2>
          <p>
            Register your charity, share your mission, and connect with people
            who care about your cause.
          </p>
        </div>

        <Link to="/charity/register" className="cta-button">
          Register Your Charity →
        </Link>
      </section>
    </main>
  );
}

export default Home;

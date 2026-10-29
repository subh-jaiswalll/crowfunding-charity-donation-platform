
import { Link } from "react-router-dom";
import "./About.css";

function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <p className="about-eyebrow">ABOUT OUR PLATFORM</p>
        <h1>Small Acts. Big Changes.</h1>
        <p>
          We connect people who want to help with charities working
          to make a difference in their communities.
        </p>

        <Link to="/charities" className="about-button">
          Explore Initiatives
        </Link>
      </section>

      <section className="about-intro">
        <div>
          <h2>Our Mission</h2>
          <p>
            Our mission is to make charitable giving easier by helping
            donors discover causes they care about and connect with
            organizations creating positive change.
          </p>
        </div>

        <div>
          <h2>Our Vision</h2>
          <p>
            We envision a world where every genuine cause has an
            opportunity to receive support and every contribution
            can help build a stronger community.
          </p>
        </div>
      </section>

      <section className="about-how">
        <h2>How It Works</h2>

        <div className="about-steps">
          <article className="about-step">
            <span>01</span>
            <h3>Discover</h3>
            <p>Explore charities and find causes that matter to you.</p>
          </article>

          <article className="about-step">
            <span>02</span>
            <h3>Contribute</h3>
            <p>Choose a cause and support it through a donation.</p>
          </article>

          <article className="about-step">
            <span>03</span>
            <h3>Make an Impact</h3>
            <p>Help organizations work toward their charitable goals.</p>
          </article>
        </div>
      </section>

      <section className="about-cta">
        <h2>Ready to Make a Difference?</h2>
        <p>Explore initiatives and find a cause you want to support.</p>
        <Link to="/charities" className="about-button">
          Find a Cause
        </Link>
      </section>
    </main>
  );
}

export default About;

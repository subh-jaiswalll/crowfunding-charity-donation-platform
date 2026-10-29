import {Link} from 'react-router-dom'
import './Footer.css'


function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section footer-brand">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-icon">♥</span>
            Crow<span>Funding</span>
          </Link>

          <p>Small Steps. Big Impact</p>

          <p className="footer-description">
            Join us in making a difference. Support meaningful causes, help
            communities, and create a better future together.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/donate">Donate</Link>
          <Link to="/charity/register">Fundraise</Link>
          <Link to="/charities">Our Initiatives</Link>
        </div>

        <div className="footer-section">
          <h3>Explore Causes</h3>
          <Link to="/charities?category=Education">Education</Link>
          <Link to="/charities?category=Healthcare">Healthcare</Link>
          <Link to="/charities?category=Food">Food & Hunger Relief</Link>
          <Link to="/charities?category=Environment">Environment</Link>
          <Link to="/charities?category=Animal%20Welfare">Animal Welfare</Link>
        </div>

        <div className="footer-section">
          <h3>Get Involved</h3>
          <Link to="/charity/register">Start a Campaign</Link>
          <Link to="/register">Join Our Community</Link>
          <Link to="/Login">My Account</Link>
          <Link to="/contact">Contact Us</Link>

          <h3 className="footer-follow-heading">Follow Us</h3>
          <div className="footer-socials">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              f
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              ◎
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              in
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} CrowFunding. All rights reserved.</p>

        <div className="footer-legal">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

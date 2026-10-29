
import { useState } from "react";
import "./Contact.css";
import api from "../api"

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
  event.preventDefault();
  setSuccess("");

  try {
    const response = await api.post("/email/contact", formData);

    setSuccess(
      response.data.message || "Message sent successfully!"
    );

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  } catch (error) {
    setSuccess(
      error.response?.data?.message ||
        "Unable to send your message."
    );
  }
}

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <h1>Contact Us</h1>
        <p>
          Have a question or need help with a donation?
          We're here to help you make a difference.
        </p>
      </section>

      <div className="contact-container">
        <section className="contact-info">
          <h2>Get in Touch</h2>
          <p>
            Contact our team for assistance with donations,
            charity registration, or your account.
          </p>

          <div className="contact-item">
            <span>📧</span>
            <div>
              <h3>Email Us</h3>
              <p>support@crowdfunding.com</p>
            </div>
          </div>

          <div className="contact-item">
            <span>📍</span>
            <div>
              <h3>Our Location</h3>
              <p>Jabalpur, Madhya Pradesh, India</p>
            </div>
          </div>

          <div className="contact-item">
            <span>🤝</span>
            <div>
              <h3>Our Mission</h3>
              <p>
                Connecting generous donors with charities
                that create meaningful change.
              </p>
            </div>
          </div>
        </section>

        <section className="contact-form-section">
          <h2>Send Us a Message</h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              name="subject"
              placeholder="Enter subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />

            <label htmlFor="message">Your Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder="Write your message here..."
              value={formData.message}
              onChange={handleChange}
              required
            />

            <button type="submit">Send Message</button>

            {success && <p className="contact-success">{success}</p>}
          </form>
        </section>
      </div>
    </div>
  );
}

export default Contact;

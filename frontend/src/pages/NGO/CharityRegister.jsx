import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./Charity.css";
function CharityRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    mission: "",
    goal: "",
    project: "",
    category: "",
    address: "",
    city: "",
    state: "",
    contactEmail: "",
  });

  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

 
async function handleSubmit(event) {
  event.preventDefault();
  setMessage("");
  setLoading(true);

  try {
    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    if (photo) {
      data.append("photo", photo);
    }

    const response = await api.post("/ngo/", data);

    setMessage(
      response.data.message || "Charity registered successfully!"
    );

    // Update role only if the backend confirms it.
    const returnedUser = response.data.user;

    if (returnedUser) {
      const currentUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (currentUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({ ...currentUser, ...returnedUser })
        );
      }
    }

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    navigate("/charity/profile");
  } catch (error) {
    setMessage(
      error.response?.data?.message ||
        "Charity registration failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="charity-form-page">
      <form
        className="charity-form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <h2>Register Your Charity</h2>
        <p>Enter your charity's details below.</p>

        <label>Charity Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Mission</label>
        <textarea
          name="mission"
          value={formData.mission}
          onChange={handleChange}
          required
        />

        <label>Goal</label>
        <input
          type="number"
          name="goal"
          value={formData.goal}
          onChange={handleChange}
          min="0"
          required
        />

        <label>Project</label>
        <textarea
          name="project"
          value={formData.project}
          onChange={handleChange}
        />

        <label>Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          <option value="Education">Education</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Food and Hunger Relief">
            Food and Hunger Relief
          </option>
          <option value="Environment">Environment</option>
          <option value="Animal Welfare">Animal Welfare</option>
          <option value="Women Empowerment">
            Women Empowerment
          </option>
          <option value="Community Development">
            Community Development
          </option>
          <option value="Other">Other</option>
        </select>

        <label>Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        <label>City</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
        />

        <label>State</label>
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
        />

        <label>Contact Email</label>
        <input
          type="email"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleChange}
          required
        />

        <label>Charity Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(event) =>
            setPhoto(event.target.files[0] || null)
          }
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register Charity"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default CharityRegister;

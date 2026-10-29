
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./Charity.css";

function CharityUpdate() {
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
  const [currentPhoto, setCurrentPhoto] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const PHOTO_BASE_URL = "http://localhost:3000/uploads/";

  useEffect(() => {
    async function loadCharity() {
      try {
        const response = await api.get("/ngo/my-profile");
        const charity = response.data.ngo || response.data;

        setFormData({
          name: charity.name || "",
          mission: charity.mission || "",
          goal: charity.goal || "",
          project: charity.project || "",
          category: charity.category || "",
          address: charity.address || "",
          city: charity.city || "",
          state: charity.state || "",
          contactEmail: charity.contactEmail || "",
        });

        if (charity.photo) {
          const imageUrl = charity.photo.startsWith("http")
            ? charity.photo
            : `${PHOTO_BASE_URL}${charity.photo.replace(/^\/+/, "")}`;

          setCurrentPhoto(imageUrl);
        }
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "Unable to load charity details."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCharity();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    if (photo) {
      data.append("photo", photo);
    }

    try {
      const response = await api.put("/ngo/my-profile", data);

      setMessage(
        response.data.message || "Charity updated successfully!"
      );

      navigate("/charity/profile");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to update charity."
      );
    }
  }

  if (loading) {
    return <p>Loading charity details...</p>;
  }

  return (
    <div className="charity-form-page">
      <form
        className="charity-form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <h2>Update Charity Details</h2>

        <label>Charity Name</label>
        <input
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
        <textarea
          name="goal"
          value={formData.goal}
          onChange={handleChange}
          required
        />

        <label>Project</label>
        <textarea
          name="project"
          value={formData.project}
          onChange={handleChange}
          required
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
          <option value="Women Empowerment">Women Empowerment</option>
          <option value="Community Development">
            Community Development
          </option>
          <option value="Other">Other</option>
        </select>

        <label>Address</label>
        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        <label>City</label>
        <input
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
        />

        <label>State</label>
        <input
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

        <label>Current Charity Photo</label>

        {currentPhoto ? (
          <img
            src={currentPhoto}
            alt="Current charity"
            className="charity-current-photo"
            onError={() => setCurrentPhoto("")}
          />
        ) : (
          <p>No photo available.</p>
        )}

        <label>Change Charity Photo (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const selectedFile = event.target.files[0];
            setPhoto(selectedFile || null);

            if (selectedFile) {
              setCurrentPhoto(URL.createObjectURL(selectedFile));
            }
          }}
        />

        <button type="submit">Save Changes</button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default CharityUpdate;

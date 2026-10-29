import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import  './user.css'

function DonationHistory() {
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDonations() {
      try {
        const response = await api.get("/user/donations");

        setDonations(
          Array.isArray(response.data)
            ? response.data
            : response.data.donations || [],
        );
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setMessage("Unable to load donation history.");
        }
      } finally {
        setLoading(false);
      }
    }
    getDonations();
  }, [navigate]);

  if (loading) {
    return <p className="page-message">Loading donation history...</p>;
  }

  return (
    <div className="donation-history">
      <h2>My Donation History</h2>
      <p>Thank you for helping make a difference!</p>

      {message && <p className="auth-message">{message}</p>}

      {!message && donations.length === 0 && (
        <div className="empty-donations">
          <h3>No donation yet</h3>
          <p>Your donations will appear when you contribute</p>
          <Link to="/donate">Explore Charities</Link>
        </div>
      )}

      {donations.length > 0 && (
        <div className="donation-table-wrapper">
          <table className="donation-table">
            <thead>
              <tr>
                <th>Donation Id</th>
                <th>Charity</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {donations.map((donation) => (
                <tr key={donation.id}>
                  <td>{donation.id}</td>
                  <td>
                    {donation.ngo?.name ||
                      donation.charity?.name ||
                      donation.ngoName ||
                      "Charity"}
                  </td>
                  <td> ₹{Number(donation.amount).toLocaleString("en-IN")}</td>
                  <td>
                    {donation.createdAt ? new Date(donation.createdAt).toLocaleDateString('en-IN') : "-"}
                  </td>
                  <td>{donation.status || donation.paymentStatus || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link className="history-link" to='/profile'>Back to Profile</Link>
    </div>
  );
}

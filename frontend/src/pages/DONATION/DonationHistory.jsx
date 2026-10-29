import { useEffect, useState } from "react";
import api from "../../api";
import "./Donation.css";

function DonationHistory() {
  const [donations, setDonations] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await api.get("/donation/my-history");
        setDonations(response.data.donations || []);
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Unable to load donation history."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  async function downloadReceipt(donationId) {
    try {
      const response = await api.get(
        `/donation/${donationId}/receipt`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = url;
      link.download = `donation-receipt-${donationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to download receipt."
      );
    }
  }

  if (loading) return <p className="page-message">Loading donations...</p>;

  return (
    <main className="donation-page">
      <section className="history-container">
        <h1>My Donation History</h1>

        {message && <p className="form-message">{message}</p>}

        {donations.length === 0 ? (
          <p>You haven't made any donations yet.</p>
        ) : (
          <div className="table-wrapper">
            <table className="donation-table">
              <thead>
                <tr>
                  <th>Donation ID</th>
                  <th>Charity ID</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>

              <tbody>
                {donations.map((donation) => (
                  <tr key={donation.id}>
                    <td>{donation.id}</td>
                    <td>{donation.ngoId}</td>
                    <td>₹{Number(donation.amount).toFixed(2)}</td>
                    <td>
                      {donation.createdAt
                        ? new Date(donation.createdAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td>
                      <span className={`status ${String(donation.status).toLowerCase()}`}>
                        {donation.status}
                      </span>
                    </td>
                    <td>
                      {donation.status === "PAID" ? (
                        <button
                          type="button"
                          className="small-button"
                          onClick={() => downloadReceipt(donation.id)}
                        >
                          Download PDF
                        </button>
                      ) : (
                        "Available after payment"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default DonationHistory;
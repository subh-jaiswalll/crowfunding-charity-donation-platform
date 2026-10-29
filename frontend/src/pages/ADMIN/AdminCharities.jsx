
import { useEffect, useState } from "react";
import api from "../../api";

function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadCharities() {
    setLoading(true);

    try {
      // This endpoint must return ALL charities,
      // including pending and rejected registrations.
      const response = await api.get("/admin/charities");

      setCharities(
        Array.isArray(response.data)
          ? response.data
          : response.data.charities || response.data.ngos || []
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to load charities."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCharities();
  }, []);

  async function updateStatus(id, status) {
    setMessage("");

    try {
      await api.patch(`/admin/charities/${id}/status`, {
        verificationStatus: status,
      });

      setMessage(`Charity ${status.toLowerCase()} successfully.`);
      await loadCharities();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to update charity status."
      );
    }
  }

  if (loading) {
    return <p>Loading charities...</p>;
  }

  return (
    <section>
      <h2>Charity Management</h2>

      {message && <p role="status">{message}</p>}

      {charities.length === 0 ? (
        <p>No charities found.</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>City</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {charities.map((charity) => (
                <tr key={charity.id}>
                  <td>{charity.name}</td>
                  <td>{charity.category}</td>
                  <td>{charity.city}</td>
                  <td>{charity.contactEmail}</td>
                  <td>{charity.verificationStatus}</td>
                  <td>
                    {charity.verificationStatus === "PENDING" && (
                      <div className="admin-actions">
                        <button
                          className="approve-btn"
                          onClick={() =>
                            updateStatus(charity.id, "APPROVED")
                          }
                        >
                          Approve
                        </button>

                        <button
                          className="reject-btn"
                          onClick={() =>
                            updateStatus(charity.id, "REJECTED")
                          }
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminCharities;

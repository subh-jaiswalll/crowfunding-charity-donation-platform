
import  { useEffect, useState } from "react";
import api from "../../api";
import "./AllDonations.css";

function AllDonations() {

    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");

    // Fetch all donations
    const fetchDonations = async () => {

        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await api.get(
                `/admin/donations?page=${page}&limit=10`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setDonations(response.data.donations || []);
            setTotalPages(response.data.totalPages);

        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                "Unable to fetch donations"
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, [page]);

    // Search and filter donations
    const filteredDonations = donations.filter((donation) => {

        const donorName = donation.donor?.name || "";
        const ngoName = donation.ngo?.name || "";

        const matchesSearch =
            donorName.toLowerCase().includes(search.toLowerCase()) ||
            ngoName.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            status === "ALL" ||
            donation.status?.toUpperCase() === status;

        return matchesSearch && matchesStatus;
    });

    // Calculate successful donation amount on current page
  

    const successfulAmount = donations
  .filter((donation) => donation.status === "PAID")
  .reduce((total, donation) => total + Number(donation.amount), 0);

    return (
        <div className="admin-donations">

            <div className="donation-header">
                <div>
                    <h1>All Donations</h1>
                    <p>Manage and monitor all platform donations.</p>
                </div>
            </div>

            {/* Statistics */}
            <div className="donation-stats">

                <div className="stat-card">
                    <span>Total Donations</span>
                    <h2>{donations.length}</h2>
                </div>

                <div className="stat-card">
                    <span>Successful Amount (Current Page)</span>
                    <h2>₹{successfulAmount.toLocaleString("en-IN")}</h2>
                </div>

                <div className="stat-card">
                    <span>Total Records</span>
                    <h2>{(page - 1) * 10 + donations.length}</h2>
                </div>

            </div>

            {/* Search and Filter */}
            <div className="donation-filters">

                <input
                    type="text"
                    placeholder="Search donor or NGO..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="ALL">All Status</option>
                    <option value="PAID">Success</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                </select>

            </div>

            {/* Donations Table */}
            <div className="donation-table-container">

                {loading ? (
                    <p className="donation-message">Loading donations...</p>
                ) : error ? (
                    <p className="donation-error">{error}</p>
                ) : filteredDonations.length === 0 ? (
                    <p className="donation-message">No donations found.</p>
                ) : (

                    <table className="donation-table">

                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Donor</th>
                                <th>NGO</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredDonations.map((donation) => (

                                <tr key={donation.id}>

                                    <td>#{donation.id}</td>

                                    <td>
                                        <strong>
                                            {donation.donor?.name || "Unknown"}
                                        </strong>
                                        <small>
                                            {donation.donor?.email || "No email"}
                                        </small>
                                    </td>

                                    <td>
                                        <strong>
                                            {donation.ngo?.name || "Unknown NGO"}
                                        </strong>
                                        <small>
                                            {donation.ngo?.category || ""}
                                        </small>
                                    </td>

                                    <td className="donation-amount">
                                        ₹{Number(donation.amount || 0).toLocaleString("en-IN")}
                                    </td>

                                    <td>
                                        <span className={`status-badge ${donation.status?.toLowerCase()}`}>
                                            {donation.status || "Unknown"}
                                        </span>
                                    </td>

                                    <td>
                                        {donation.createdAt
                                            ? new Date(donation.createdAt).toLocaleDateString("en-IN")
                                            : "N/A"}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                )}

            </div>

            {/* Pagination */}
            {!loading && !error && (
                <div className="donation-pagination">

                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Previous
                    </button>

                    <span>
                        Page {page} of {totalPages}
                    </span>

                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                    </button>

                </div>
            )}

        </div>
    );
}

export default AllDonations;

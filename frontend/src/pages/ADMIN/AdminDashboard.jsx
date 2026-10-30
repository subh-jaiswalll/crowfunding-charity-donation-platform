
import { useState } from "react";
import AdminUsers from "./AdminUsers";
import AdminCharities from "./AdminCharities";
import AllDonations from "./AllDonations";
import "./Admin.css";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("charities");

  return (
    <div className="admin-layout">

      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>

        <button
          className={activeTab === "charities" ? "active" : ""}
          onClick={() => setActiveTab("charities")}
        >
          Manage Charities
        </button>

        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          Manage Users
        </button>

        <button
          className={activeTab === "donations" ? "active" : ""}
          onClick={() => setActiveTab("donations")}
        >
          All Donations
        </button>

      </aside>

      <main className="admin-content">
        <h1>Admin Dashboard</h1>
        <p>Manage users, charities and donations.</p>

        {activeTab === "charities" && <AdminCharities />}

        {activeTab === "users" && <AdminUsers />}

        {activeTab === "donations" && <AllDonations />}

      </main>
    </div>
  );
}

export default AdminDashboard;

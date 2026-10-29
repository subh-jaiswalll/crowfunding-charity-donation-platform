
import { useEffect, useState } from "react";
import api from "../../api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    setLoading(true);

    try {
      const response = await api.get("/admin/users");

      setUsers(
        Array.isArray(response.data)
          ? response.data
          : response.data.users || []
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function deleteUser(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/admin/users/${id}`);

      setMessage("User deleted successfully.");
      await loadUsers();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to delete user."
      );
    }
  }

  if (loading) {
    return <p>Loading users...</p>;
  }

  return (
    <section>
      <h2>User Management</h2>

      {message && <p role="status">{message}</p>}

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || "—"}</td>
                  <td>{user.role}</td>
                  <td>
                    {user.role !== "ADMIN" && (
                      <button
                        className="reject-btn"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </button>
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

export default AdminUsers;

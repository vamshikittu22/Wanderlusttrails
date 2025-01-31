import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [roleChangeVisible, setRoleChangeVisible] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost/WanderlustTrails/backend/config/AdminDashboard/manageUsers/getUsers.php");
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId) => {
    if (!newRole) {
      alert("Please select a role before saving.");
      return;
    }
    try {
      const response = await axios.post("http://localhost/WanderlustTrails/backend/config/AdminDashboard/manageUsers/updateUserRole.php", {
        id: userId,
        role: newRole,
      });
      if (response.data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
        );
        setRoleChangeVisible(false);
      } else {
        console.error("Failed to update role:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await axios.post("http://localhost/WanderlustTrails/backend/config/AdminDashboard/manageUsers/deleteUser.php", {
        user_id: userId,
      });
      if (response.data.success) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        setDeletePopupVisible(false);
      } else {
        console.error("Failed to delete user:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      <table className="table-auto w-full border-collapse border border-gray-400">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Role</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td className="border border-gray-300 px-4 py-2">
                  {user.firstName} {user.lastName}
                </td>
                <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                <td className="border border-gray-300 px-4 py-2">{user.role}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setNewRole(user.role);
                      setRoleChangeVisible(true);
                    }}
                    className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Change Role
                  </button>
                  <button
                    onClick={() => {
                      setUserToDelete(user.id);
                      setDeletePopupVisible(true);
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete User
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center p-4">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {roleChangeVisible && (
        <div className="mt-4 p-4 bg-gray-600 rounded">
          <h2 className="text-lg font-semibold text-green-500 mb-2 font-serif ">Change Role</h2>
          <label className="ml-4 text-red-400 font-semibold">
            <input
              type="radio"
              value="Admin"
              checked={newRole === "Admin"}
              onChange={(e) => setNewRole(e.target.value)}
            />
            Admin
          </label>
          <label className="ml-4 text-red-400 font-semibold">
            <input
              type="radio"
              value="User"
              checked={newRole === "User"}
              onChange={(e) => setNewRole(e.target.value)}
            />
            User
          </label>
          <div className="mt-4">
            <button
              onClick={() => handleRoleChange(selectedUserId)}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            >
              Save
            </button>
            <button
              onClick={() => setRoleChangeVisible(false)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {deletePopupVisible && (
        <div className="mt-4 p-4 bg-red-300 rounded">
          <h2 className="text-lg font-semibold mb-2">Delete Confirmation</h2>
          <p>Are you sure you want to delete this user?</p>
          <div className="mt-4">
            <button
              onClick={() => handleDeleteUser(userToDelete)}
              className="bg-red-500 text-white px-4 py-2 rounded mr-2"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setDeletePopupVisible(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;

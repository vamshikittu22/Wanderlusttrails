import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import { toast } from 'react-toastify';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [roleChangeVisible, setRoleChangeVisible] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [deletePopupVisible, setDeletePopupVisible] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        console.log("Fetching users");
        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/AdminDashboard/manageUsers/getUsers.php',
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                console.log("Fetched users:", response);
                if (Array.isArray(response)) {
                    setUsers(response);
                } else {
                    toast.error(response.message || 'Unexpected response format');
                }
            },
            error: function (xhr) {
                console.error("Error fetching users:", xhr);
                let errorMessage = 'Error fetching users: Server error';
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = 'Error fetching users: ' + (response.message || 'Server error');
                } catch (e) {
                    errorMessage = xhr.statusText || 'Server error';
                }
                toast.error(errorMessage);
            },
            complete: function () {
                setLoading(false);
            }
        });
    };

    const handleRoleChange = (userId) => {
        if (!newRole) {
            toast.error('Please select a role before saving.');
            return;
        }
        console.log("Updating role for userId:", userId, "to:", newRole);
        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/AdminDashboard/manageUsers/updateUserRole.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ id: userId, role: newRole }),
            dataType: 'json',
            success: function (response) {
                console.log("Update role response:", response);
                if (response.success) {
                    setUsers(prevUsers =>
                        prevUsers.map(user => (user.id === userId ? { ...user, role: newRole } : user))
                    );
                    setRoleChangeVisible(false);
                    setNewRole('');
                    setSelectedUserId(null);
                    toast.success('User role updated successfully!');
                } else {
                    toast.error(response.message || 'Failed to update role');
                }
            },
            error: function (xhr) {
                console.error("Error updating role:", xhr);
                let errorMessage = 'Error updating role: Server error';
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = 'Error updating role: ' + (response.message || 'Server error');
                } catch (e) {
                    errorMessage = xhr.statusText || 'Server error';
                }
                toast.error(errorMessage);
            }
        });
    };

    const handleDeleteUser = (userId) => {
        console.log("Deleting userId:", userId);
        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/AdminDashboard/manageUsers/deleteUser.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ user_id: userId }),
            dataType: 'json',
            success: function (response) {
                console.log("Delete user response:", response);
                if (response.success) {
                    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
                    setDeletePopupVisible(false);
                    setUserToDelete(null);
                    toast.success('User deleted successfully!');
                } else {
                    toast.error(response.message || 'Failed to delete user');
                }
            },
            error: function (xhr) {
                console.error("Error deleting user:", xhr);
                let errorMessage = 'Error deleting user: Server error';
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = 'Error deleting user: ' + (response.message || 'Server error');
                } catch (e) {
                    errorMessage = xhr.statusText || 'Server error';
                }
                toast.error(errorMessage);
            }
        });
    };

    if (loading) {
        return <div className="text-center p-4 text-white">Loading users...</div>;
    }

    return (
        <div className="container mx-auto p-6 bg-gray-700 rounded-lg shadow-md">
            <h1 className="text-3xl font-semibold text-orange-600 mb-6">Manage Users</h1>
            <table className="table-auto w-full border-collapse border border-gray-400 bg-gray-800 text-white">
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
                        users.map(user => (
                            <tr key={user.id}>
                                <td className="border border-gray-300 px-4 py-2">
                                    {user.firstName} {user.lastName}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setSelectedUserId(user.id);
                                            setNewRole(user.role.charAt(0).toUpperCase() + user.role.slice(1));
                                            setRoleChangeVisible(true);
                                        }}
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                                    >
                                        Change Role
                                    </button>
                                    <button
                                        onClick={() => {
                                            setUserToDelete(user.id);
                                            setDeletePopupVisible(true);
                                        }}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                                    >
                                        Delete User
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center p-4 text-gray-300">
                                No users found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {roleChangeVisible && (
                <div className="mt-6 p-6 bg-gray-800 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold text-orange-600 mb-4">Change Role</h2>
                    <div className="flex items-center space-x-6 mb-4">
                        <label className="flex items-center text-gray-300 font-semibold">
                            <input
                                type="radio"
                                value="Admin"
                                checked={newRole === 'Admin'}
                                onChange={e => setNewRole(e.target.value)}
                                className="mr-2"
                            />
                            Admin
                        </label>
                        <label className="flex items-center text-gray-300 font-semibold">
                            <input
                                type="radio"
                                value="User"
                                checked={newRole === 'User'}
                                onChange={e => setNewRole(e.target.value)}
                                className="mr-2"
                            />
                            User
                        </label>
                    </div>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => handleRoleChange(selectedUserId)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => {
                                setRoleChangeVisible(false);
                                setNewRole('');
                                setSelectedUserId(null);
                            }}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {deletePopupVisible && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
                        <h2 className="text-xl font-semibold text-orange-600 mb-4">Delete Confirmation</h2>
                        <p className="text-gray-300 mb-4">Are you sure you want to delete this user?</p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => handleDeleteUser(userToDelete)}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={() => {
                                    setDeletePopupVisible(false);
                                    setUserToDelete(null);
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
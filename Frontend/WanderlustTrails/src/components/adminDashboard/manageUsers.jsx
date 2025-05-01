import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext'; // Import UserContext to manage logged-in user
import Popup from './../Popup'; // Import Popup component
import Pagination from './../Pagination'; // Import Pagination component

// ManageUsers component
const ManageUsers = () => {
    const [users, setUsers] = useState([]); // State to hold users fetched from the server
    const [selectedUserId, setSelectedUserId] = useState(null); // State to hold the ID of the user whose role is being changed
    const [roleChangeVisible, setRoleChangeVisible] = useState(false); // State to control visibility of the role change popup 
    const [newRole, setNewRole] = useState(''); // State to hold the new role selected by the admin
    const [deletePopupVisible, setDeletePopupVisible] = useState(false); // State to control visibility of the delete confirmation popup
    const [userToDelete, setUserToDelete] = useState(null); // State to hold the ID of the user to be deleted 
    const [loading, setLoading] = useState(true); // State to control loading state
    const [currentPage, setCurrentPage] = useState(1); // Pagination state
    const itemsPerPage = 6; // Number of users per page

    const navigate = useNavigate(); // Use useNavigate to navigate to different routes
    const { user, setUser } = useUser(); // Access logged-in user from UserContext

    // Fetch users when the component mounts
    useEffect(() => {
        fetchUsers();
    }, []);

    // Fetch users from the server
    const fetchUsers = () => {
        console.log("Fetching users");
        $.ajax({ // Use jQuery AJAX to fetch users
            url: 'http://localhost/WanderlustTrails/Backend/config/AdminDashboard/manageUsers/getUsers.php',
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                console.log("Fetched users:", response);
                if (Array.isArray(response)) {
                    setUsers(response.map(u => ({ ...u, id: Number(u.id) })));
                } else {
                    toast.error(response.message || 'Unexpected response format');
                }
            },
            error: function (xhr) { // Handle errors from the server
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
            complete: function () { // Set loading to false after the request completes
                setLoading(false);
            }
        });
    };

    // Handle role change for a user
    const handleRoleChange = (userId) => {
        if (!newRole) {
            toast.error('Please select a role before saving.');
            return;
        }
        console.log("Updating role for userId:", userId, "to:", newRole);
        $.ajax({ //send role change request to the server
            url: 'http://localhost/WanderlustTrails/Backend/config/AdminDashboard/manageUsers/updateUserRole.php',
            type: 'POST',
            contentType: 'application/json', // Match backend expectation
            data: JSON.stringify({ id: userId, role: newRole }), // Use 'id' and keep role as 'Admin' or 'User'
            dataType: 'json',
            success: function (response) {
                console.log("Update role response:", response);
                if (response.success) {
                    setUsers(prevUsers =>
                        prevUsers.map(user => (user.id === userId ? { ...user, role: newRole.toLowerCase() } : user))
                    ); // Update the user role in the usercontext
                    if (user && user.id === userId) {
                        if (newRole.toLowerCase() !== 'admin') { // If the logged-in user is demoted from admin to user
                            toast.info('Your role has been changed. You will be logged out.');
                            setUser(null);
                            localStorage.removeItem('user');
                            navigate('/login'); // Redirect to login page
                        } else { // If the logged-in user is promoted to admin
                            setUser({ ...user, role: newRole.toLowerCase() });
                            toast.success('Your role has been updated to Admin.');
                        }
                    } else {
                        toast.success('User role updated successfully!');
                    }
                    setRoleChangeVisible(false);
                    setNewRole('');
                    setSelectedUserId(null);
                } else { // Handle error response from the server
                    toast.error(response.message || 'Failed to update role');
                }
            },
            error: function (xhr) { // Handle errors from the server
                console.error("Error updating role:", xhr);
                console.log("Response Text:", xhr.responseText);
                console.log("Status:", xhr.status);
                console.log("Status Text:", xhr.statusText);
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

    // Handle user deletion
    const handleDeleteUser = (userId) => {
        console.log("Deleting userId:", userId);
        if (user && user.id === userId) { // Prevent deletion of the logged-in user
            toast.error('You cannot delete your own account while logged in.');
            setDeletePopupVisible(false);
            setUserToDelete(null);
            return;
        }
        $.ajax({ //send delete request to the server
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
                    // Check if the deleted user was the logged-in user (in case the safeguard is bypassed)
                    if (user && user.id === userId) {
                        toast.info('You have deleted your own account. You will be logged out.');
                        setUser(null);
                        localStorage.removeItem('user');
                        navigate('/login');
                    }
                    const totalItemsAfterDelete = users.length - 1;
                    const totalPagesAfterDelete = Math.ceil(totalItemsAfterDelete / itemsPerPage);
                    if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
                        setCurrentPage(totalPagesAfterDelete);
                    }
                } else {
                    toast.error(response.message || 'Failed to delete user');
                }
            },
            error: function (xhr) { // Handle errors from the server
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

    // Pagination logic
    const totalItems = users.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = users.slice(startIndex, endIndex);

    if (loading) {
        return <div className="text-center p-4 text-white">Loading users...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-700 rounded-lg shadow-md text-white">
            <h1 className="text-3xl font-semibold text-orange-600 mb-6">Manage Users</h1>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-gray-800 text-white rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-900">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Email</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Role</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.length > 0 ? (
                            currentUsers.map(user => (
                                <tr key={user.id} className="border-b border-gray-600 hover:bg-gray-700 transition-colors">
                                    <td className="px-4 py-3 text-gray-300">
                                        {user.firstName} {user.lastName}
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">{user.email}</td>
                                    <td className="px-4 py-3 text-gray-300">
                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </td>
                                    <td className="px-4 py-3 flex space-x-3">
                                        <button
                                            onClick={() => {
                                                setSelectedUserId(user.id);
                                                setNewRole(user.role.charAt(0).toUpperCase() + user.role.slice(1));
                                                setRoleChangeVisible(true);
                                            }}
                                            className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors shadow-md"
                                        >
                                            Change Role
                                        </button>
                                        <button
                                            onClick={() => {
                                                setUserToDelete(user.id);
                                                setDeletePopupVisible(true);
                                            }}
                                            className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors shadow-md"
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
            </div>

            {/* Pagination */}
            <Pagination
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={(page) => setCurrentPage(page)}
            />

            {/* Role Change Popup */}
            <Popup isOpen={roleChangeVisible} onClose={() => setRoleChangeVisible(false)}>
                <h2 className="text-xl font-semibold text-orange-600 mb-4">Change Role</h2>
                <div className="flex items-center space-x-6 mb-6">
                    <label className="flex items-center text-gray-300 font-semibold">
                        <input
                            type="radio"
                            value="Admin"
                            checked={newRole === 'Admin'}
                            onChange={e => setNewRole(e.target.value)}
                            className="mr-2 accent-blue-500"
                        />
                        Admin
                    </label>
                    <label className="flex items-center text-gray-300 font-semibold">
                        <input
                            type="radio"
                            value="User"
                            checked={newRole === 'User'}
                            onChange={e => setNewRole(e.target.value)}
                            className="mr-2 accent-blue-500"
                        />
                        User
                    </label>
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={() => handleRoleChange(selectedUserId)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                    >
                        Save
                    </button>
                    <button
                        onClick={() => {
                            setRoleChangeVisible(false);
                            setNewRole('');
                            setSelectedUserId(null);
                        }}
                        className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors shadow-md"
                    >
                        Cancel
                    </button>
                </div>
            </Popup>

            {/* Delete Confirmation Popup */}
            <Popup isOpen={deletePopupVisible} onClose={() => setDeletePopupVisible(false)}>
                <h2 className="text-xl font-semibold text-orange-600 mb-4">Delete Confirmation</h2>
                <p className="text-gray-300 mb-6">Are you sure you want to delete this user?</p>
                <div className="flex space-x-4">
                    <button
                        onClick={() => handleDeleteUser(userToDelete)}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md"
                    >
                        Yes, Delete
                    </button>
                    <button
                        onClick={() => {
                            setDeletePopupVisible(false);
                            setUserToDelete(null);
                        }}
                        className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors shadow-md"
                    >
                        Cancel
                    </button>
                </div>
            </Popup>
        </div>
    );
};

export default ManageUsers;

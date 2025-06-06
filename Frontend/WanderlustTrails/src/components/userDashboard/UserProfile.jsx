//path: Wanderlusttrails/Frontend/WanderlustTrails/src/components/userDashboard/UserProfile.jsx

import React, { useState, useEffect } from "react";
import $ from "jquery"; 
import { toast } from "react-toastify";
import UserForm from "./../forms/UserForm.jsx";

// UserProfile component
const UserProfile = () => {
  // State to manage user data and form visibility
  const [user, setUser] = useState(null); // Initialize user state to null
  const [isEditing, setIsEditing] = useState(false); // State to manage editing mode
  const [isChangingPassword, setIsChangingPassword] = useState(false); // State to manage password change mode
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    otp: "",
  }); // State to manage password data
  const [otpSent, setOtpSent] = useState(false); // State to manage OTP sent status

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    dob: "",
    gender: "",
    nationality: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  }); // State to manage profile data

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("Please log in to view your profile.");
        return;
      }

      $.ajax({ // Fetch user profile data from the server
        url: `http://localhost/WanderlustTrails/Backend/config/UserDashboard/manageUserProfile/viewProfile.php?userID=${userId}`,
        type: "GET",
        dataType: "json",
        success: function (response) {
          console.log("Fetched user data:", response);
          if (response.success) {
            const userData = response.data[0];
            setUser(userData);
            setProfileData(userData);
          } else {
            toast.error("Failed to fetch profile: " + response.message);
          }
        },
        // Handle error response
        error: function (xhr) {
          console.error("Error fetching profile:", xhr);
          let errorMessage = "Error fetching profile: Server error";
          try {
            const response = JSON.parse(xhr.responseText);
            errorMessage = "Error fetching profile: " + (response.message || "Server error");
          } catch (e) {
            errorMessage = xhr.statusText || "Server error";
          }
          toast.error(errorMessage);
        },
      });
    };

    fetchUserProfile();
  }, []); // Fetch user profile data on component mount

  // Handle profile update submission
  const handleProfileSubmit = (e, updatedProfileData) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");

    console.log("Submitting profile data:", updatedProfileData);
    $.ajax({ // Send updated profile data to the server
      url: "http://localhost/WanderlustTrails/Backend/config/UserDashboard/manageUserProfile/editProfile.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ userID: userId, ...updatedProfileData }),
      dataType: "json",
      success: function (response) {
        console.log("Edit response:", response);
        if (response.success) {
          setUser({ ...user, ...updatedProfileData }); // Update user state with new data
          setIsEditing(false);
          toast.success("Profile updated successfully!");
        } else {
          toast.error("Failed to update profile: " + response.message);
        }
      },
      // Handle error response
      error: function (xhr) {
        console.error("Error updating profile:", xhr);
        let errorMessage = "Error updating profile: Server error";
        try {
          const response = JSON.parse(xhr.responseText);
          errorMessage = "Error updating profile: " + (response.message || "Server error");
        } catch (e) {
          errorMessage = xhr.statusText || "Server error";
        }
        toast.error(errorMessage);
      },
    });
  };

  // Verify current password and send OTP
  const handlePasswordVerification = (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      toast.error("Current password is required");
      return;
    }

    $.ajax({ // Verify current password
      url: "http://localhost/WanderlustTrails/Backend/config/auth/verifyPassword.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ identifier: user.email, currentPassword: passwordData.currentPassword }),
      dataType: "json",
      success: function (verifyResponse) {
        console.log("Verification response:", verifyResponse);
        if (verifyResponse.success) {
          $.ajax({ // Send OTP to the user's email
            url: "http://localhost/WanderlustTrails/Backend/config/auth/forgotPassword.php",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ identifier: user.email }),
            dataType: "json",
            success: function (otpResponse) {
              console.log("OTP response:", otpResponse);
              if (otpResponse.success) {
                setOtpSent(true);
                toast.success("OTP sent to your email!");
              } else {
                toast.error("Failed to send OTP: " + otpResponse.message);
              }
            },
            // Handle error response
            error: function (xhr) {
              console.error("Error sending OTP:", xhr);
              let errorMessage = "Error sending OTP: Server error";
              try {
                const response = JSON.parse(xhr.responseText);
                errorMessage = "Error sending OTP: " + (response.message || "Server error");
              } catch (e) {
                errorMessage = xhr.statusText || "Server error";
              }
              toast.error(errorMessage);
            },
          });
        } else {
          toast.error("Verification failed: " + verifyResponse.message);
        }
      },
      // Handle error response
      error: function (xhr) {
        console.error("Error verifying password:", xhr);
        let errorMessage = "Error verifying password: Server error";
        try {
          const response = JSON.parse(xhr.responseText);
          errorMessage = "Error verifying password: " + (response.message || "Server error");
        } catch (e) {
          errorMessage = xhr.statusText || "Server error";
        }
        toast.error(errorMessage);
      },
    });
  };

  // Handle password change submission with OTP verification
  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    // Validate password fields
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (passwordData.otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    $.ajax({ // Verify OTP and change password
      url: "http://localhost/WanderlustTrails/Backend/config/auth/verifyOtp.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        identifier: user.email,
        otp: passwordData.otp,
        newPassword: passwordData.newPassword,
      }),
      dataType: "json",
      success: function (response) {
        console.log("Verify response:", response);
        if (response.success) {
          setIsChangingPassword(false);
          setOtpSent(false);
          setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "", otp: "" });
          toast.success("Password changed successfully!");
        } else {
          toast.error("Failed to change password: " + response.message);
        }
      },
      // Handle error response
      error: function (xhr) {
        console.error("Error changing password:", xhr);
        let errorMessage = "Error changing password: Server error";
        try {
          const response = JSON.parse(xhr.responseText);
          errorMessage = "Error changing password: " + (response.message || "Server error");
        } catch (e) {
          errorMessage = xhr.statusText || "Server error";
        }
        toast.error(errorMessage);
      },
    });
  };

  // Handle input changes for password fields
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Show loading state if user data is not available
  if (!user) return <div className="p-8 text-white">Loading...</div>; 

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl p-6 bg-gray-700 text-white rounded-lg shadow-md">
        <h2 className="text-2xl text-orange-600 font-bold mb-6 text-center">Edit Profile</h2>
        <UserForm
          formData={profileData}
          setFormData={setProfileData}
          handleSubmit={handleProfileSubmit}
          isEditing={isEditing}
          submitLabel="Save Changes"
          cancelAction={() => setIsEditing(false)}
        />
        {!isEditing && (
          <div className="text-center mt-6 space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="py-2 px-4 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-700 hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="py-2 px-4 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-700 hover:bg-blue-600"
            >
              {isChangingPassword ? "Cancel Password Change" : "Change Password"}
            </button>
          </div>
        )}

        {isChangingPassword && (
          <div className="mt-6">
            <h3 className="text-xl text-orange-600 font-bold mb-4 text-center">Change Password</h3>
            {!otpSent ? (
              <form onSubmit={handlePasswordVerification} noValidate>
                <div className="mb-4 relative">
                  <label htmlFor="currentPassword" className="block text-sm text-sky-300 font-bold mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    placeholder="Current Password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-700 hover:bg-green-600"
                  >
                    Send OTP
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} noValidate>
                <div className="mb-4 relative">
                  <label htmlFor="otp" className="block text-sm text-sky-300 font-bold mb-2">
                    OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    placeholder="Enter OTP"
                    value={passwordData.otp}
                    onChange={handlePasswordChange}
                    maxLength="6"
                    className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="mb-4 relative">
                  <label htmlFor="newPassword" className="block text-sm text-sky-300 font-bold mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    placeholder="New Password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="mb-4 relative">
                  <label htmlFor="confirmNewPassword" className="block text-sm text-sky-300 font-bold mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    placeholder="Confirm New Password"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-700 hover:bg-green-600"
                  >
                    Verify OTP & Change Password
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
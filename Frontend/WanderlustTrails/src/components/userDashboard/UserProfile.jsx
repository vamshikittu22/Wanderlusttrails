// path: Wanderlusttrails/Frontend/WanderlustTrails/src/components/userDashboard/UserProfile.jsx

import React, { useState, useEffect } from "react";
import $ from "jquery"; 
import { toast } from "react-toastify";
import UserForm from "./../forms/UserForm.jsx";

// UserProfile component: handles displaying and editing user profile info, and changing password with OTP verification
const UserProfile = () => {
  // State to store user object (profile info)
  const [user, setUser] = useState(null); // null until fetched from backend

  // State to toggle edit mode for profile info
  const [isEditing, setIsEditing] = useState(false);

  // State to toggle password change mode
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // State to store password fields and OTP during password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    otp: "",
  });

  // State to track if OTP has been sent (used for password change flow)
  const [otpSent, setOtpSent] = useState(false);

  // State to hold user profile form data, initially empty strings (will be set from backend data)
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
  });

  // Fetch user profile data from backend on component mount
  useEffect(() => {
    const fetchUserProfile = () => {
      // Retrieve logged-in userId from localStorage
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("Please log in to view your profile.");
        return;
      }

      // AJAX GET request to fetch user profile data
      $.ajax({
        url: `http://localhost/WanderlustTrails/Backend/config/UserDashboard/manageUserProfile/viewProfile.php?userID=${userId}`,
        type: "GET",
        dataType: "json",
        success: function (response) {
          console.log("Fetched user data:", response);
          if (response.success) {
            // Set user and profileData state with the first data object returned
            const userData = response.data[0];
            setUser(userData);
            // Ensure all required fields are set, including nationality
            setProfileData({
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              userName: userData.userName || "",
              email: userData.email || "",
              dob: userData.dob || "",
              gender: userData.gender || "",
              nationality: userData.nationality || "",
              phone: userData.phone || "",
              street: userData.street || "",
              city: userData.city || "",
              state: userData.state || "",
              zip: userData.zip || ""
            });
          } else {
            toast.error("Failed to fetch profile: " + response.message);
          }
        },
        error: function (xhr) {
          // On error, attempt to parse and display error message or fallback to status text
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
  }, []); // Empty dependency array ensures this runs once on mount

  /**
   * Handle profile update form submission.
   * Sends updated profile data to backend via POST request.
   * @param {Event} e - Form submission event
   * @param {Object} updatedProfileData - Data from the form to update profile
   */
  const handleProfileSubmit = (e, updatedProfileData) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");

    console.log("Submitting profile data:", updatedProfileData);

    // AJAX POST request to update profile info
    $.ajax({
      url: "http://localhost/WanderlustTrails/Backend/config/UserDashboard/manageUserProfile/editProfile.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ userID: userId, ...updatedProfileData }),
      dataType: "json",
      success: function (response) {
        console.log("Edit response:", response);
        if (response.success) {
          // Update local user state with updated profile data and exit editing mode
          setUser({ ...user, ...updatedProfileData });
          setIsEditing(false);
          toast.success("Profile updated successfully!");
        } else {
          toast.error("Failed to update profile: " + response.message);
        }
      },
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

  /**
   * Handle form submission to verify current password before sending OTP for password change.
   * @param {Event} e - Form submission event
   */
  const handlePasswordVerification = (e) => {
    e.preventDefault();

    // Validate current password is entered
    if (!passwordData.currentPassword) {
      toast.error("Current password is required");
      return;
    }

    // Get the username from the user object
    const username = user.userName;
    if (!username) {
      toast.error("Username not found. Please log in again.");
      return;
    }

    // AJAX POST request to verify current password
    $.ajax({
      url: "http://localhost/WanderlustTrails/Backend/config/auth/verifyPassword.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ 
        identifier: user.userName, 
        currentPassword: passwordData.currentPassword 
      }),
      dataType: "json",
      success: function (verifyResponse) {
        console.log("Verification response:", verifyResponse);
        if (verifyResponse.success) {
          // If verified, send OTP to user's email
          $.ajax({
            url: "http://localhost/WanderlustTrails/Backend/config/auth/forgotPassword.php",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ identifier: user.email }),
            dataType: "json",
            success: function (otpResponse) {
              console.log("OTP response:", otpResponse);
              if (otpResponse.success) {
                setOtpSent(true); // Mark that OTP has been sent
                toast.success("OTP sent to your email");
              } else {
                toast.error(otpResponse.message || "Failed to send OTP");
              }
            },
            error: function (xhr) {
              console.error("Error sending OTP:", xhr);
              let errorMessage = "Error sending OTP";
              try {
                const response = JSON.parse(xhr.responseText);
                errorMessage = response.message || errorMessage;
              } catch (e) {
                errorMessage = xhr.statusText || errorMessage;
              }
              toast.error(errorMessage);
            }
          });
        } else {
          toast.error(verifyResponse.message || "Password verification failed");
        }
      },
      error: function (xhr) {
        console.error("Error verifying password:", xhr);
        let errorMessage = "Error verifying password";
        try {
          const response = JSON.parse(xhr.responseText);
          errorMessage = response.message || errorMessage;
        } catch (e) {
          errorMessage = xhr.statusText || errorMessage;
        }
        toast.error(errorMessage);
      }
    });
  };

  /**
   * Handle submission of new password with OTP verification.
   * Validates password inputs before sending request to change password.
   * @param {Event} e - Form submission event
   */
  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    // Basic validation for new password and OTP fields
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

    // AJAX POST request to verify OTP and update password
    $.ajax({
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
          // Reset states on successful password change
          setIsChangingPassword(false);
          setOtpSent(false);
          setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "", otp: "" });
          toast.success("Password changed successfully!");
        } else {
          toast.error("Failed to change password: " + response.message);
        }
      },
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

  /**
   * Update passwordData state on input field changes.
   * @param {Event} e - Input change event
   */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Display loading message while user data is being fetched
  if (!user) return <div className="p-8 text-white">Loading...</div>; 

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl p-6 bg-gray-700 text-white rounded-lg shadow-md">
        {/* Heading */}
        <h2 className="text-2xl text-orange-600 font-bold mb-6 text-center">Edit Profile</h2>

        {/* UserForm component to edit profile data */}
        <UserForm
          formData={profileData}
          setFormData={setProfileData}
          handleSubmit={handleProfileSubmit}
          isEditing={isEditing}
          submitLabel="Save Changes"
          cancelAction={() => setIsEditing(false)}
        />

        {/* Buttons to toggle edit mode and password change mode */}
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

        {/* Password change form */}
        {isChangingPassword && (
          <div className="mt-6">
            <h3 className="text-xl text-orange-600 font-bold mb-4 text-center">Change Password</h3>
            {/* Show form to enter current password and send OTP */}
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
              /* Show form to enter OTP and new password */
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

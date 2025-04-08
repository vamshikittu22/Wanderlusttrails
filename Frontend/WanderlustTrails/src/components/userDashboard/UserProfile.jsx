// src/components/UserProfile.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import UserForm from "./../forms/UserForm.jsx";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
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

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("Please log in to view your profile.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost/WanderlustTrails/backend/config/UserDashboard/manageUserProfile/viewProfile.php?userID=${userId}`
        );
        if (response.data.success) {
          const userData = response.data.data[0];
          console.log("Fetched user data:", userData);
          setUser(userData);
          setProfileData(userData);
        } else {
          toast.error("Failed to fetch profile: " + response.data.message);
        }
      } catch (error) {
        toast.error("Error fetching profile: " + (error.response?.data?.message || "Server error"));
      }
    };

    fetchUserProfile();
  }, []);

  // Handle profile update submission
  const handleProfileSubmit = async (e, updatedProfileData) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");

    try {
      console.log("Submitting profile data:", updatedProfileData);
      const response = await axios.post(
        "http://localhost/WanderlustTrails/backend/config/UserDashboard/manageUserProfile/editProfile.php",
        { userID: userId, ...updatedProfileData },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Edit response:", response.data);

      if (response.data.success) {
        setUser({ ...user, ...updatedProfileData });
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile: " + response.data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile: " + (error.response?.data?.message || "Server error"));
    }
  };

  // Verify current password and send OTP
  const handlePasswordVerification = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      toast.error("Current password is required");
      return;
    }

    try {
      const verifyResponse = await axios.post(
        "http://localhost/WanderlustTrails/backend/config/auth/verifyPassword.php",
        { identifier: user.email, currentPassword: passwordData.currentPassword },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Verification response:", verifyResponse.data);

      if (verifyResponse.data.success) {
        const otpResponse = await axios.post(
          "http://localhost/WanderlustTrails/backend/config/auth/forgotPassword.php",
          { identifier: user.email },
          { headers: { "Content-Type": "application/json" } }
        );
        if (otpResponse.data.success) {
          setOtpSent(true);
          toast.success("OTP sent to your email!");
        } else {
          toast.error("Failed to send OTP: " + otpResponse.data.message);
        }
      } else {
        toast.error("Verification failed: " + verifyResponse.data.message);
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      toast.error("Error verifying password: " + (error.response?.data?.message || "Server error"));
    }
  };

  // Handle password change submission with OTP verification
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

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

    try {
      const response = await axios.post(
        "http://localhost/WanderlustTrails/backend/config/auth/verifyOtp.php",
        {
          identifier: user.email,
          otp: passwordData.otp,
          newPassword: passwordData.newPassword,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Verify response:", response.data);

      if (response.data.success) {
        setIsChangingPassword(false);
        setOtpSent(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "", otp: "" });
        toast.success("Password changed successfully!");
      } else {
        toast.error("Failed to change password: " + response.data.message);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Error changing password: " + (error.response?.data?.message || "Server error"));
    }
  };

  // Handle input changes for password fields
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

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
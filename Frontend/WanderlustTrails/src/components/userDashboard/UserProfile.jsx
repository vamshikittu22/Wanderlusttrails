// path: Wanderlusttrails/Frontend/WanderlustTrails/src/components/userDashboard/UserProfile.jsx

import React, { useState, useEffect } from "react";
import $ from "jquery"; 
import { toast } from "react-toastify";
import UserForm from "./../forms/UserForm.jsx";
// Line 4 - Add this import
import { PasswordInput, ConfirmPasswordInput } from "../PasswordValidator";


// UserProfile component: handles displaying and editing user profile info, and changing password with OTP verification
const UserProfile = () => {
  // State to store user object (profile info)
  const [user, setUser] = useState(null);

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

  // State to track if OTP has been sent
  const [otpSent, setOtpSent] = useState(false);

  // State to track if new password is valid
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // State to hold user profile form data
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    username: "",
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

  /**
   * Fetch user profile data from backend
   * Reusable function that can be called after updates
   */
  const fetchUserProfile = () => {
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      toast.error("Please log in to view your profile.");
      return;
    }

    $.ajax({
      url: `http://localhost/WanderlustTrails/Backend/config/UserDashboard/manageUserProfile/viewProfile.php?userID=${userId}`,
      type: "GET",
      dataType: "json",
      success: function (response) {
        console.log("Fetched user data:", response);
        if (response.success) {
          const userData = response.data[0];
          setUser(userData);
          setProfileData({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            username: userData.username || "",
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

  useEffect(() => {
    fetchUserProfile();
  }, []);

  /**
   * Handle profile update form submission
   * Excludes restricted fields (username, dob) from the update
   */
  const handleProfileSubmit = (e, updatedProfileData) => {
    e.preventDefault();
    
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    // Validate all required fields
    const requiredFields = ['firstName', 'lastName', 'username', 'email', 'dob', 'gender', 'nationality', 'phone', 'street', 'city', 'state', 'zip'];
    const missingFields = requiredFields.filter(field => !updatedProfileData[field]);

    if (missingFields.length > 0) {
      toast.error('Missing required fields: ' + missingFields.join(', '));
      console.error('Missing fields:', missingFields, updatedProfileData);
      return;
    }

    // Prepare data for backend
    // Keep original username and dob (don't allow changes)
    const profileUpdateData = {
      userID: userId,
      firstName: updatedProfileData.firstName,
      lastName: updatedProfileData.lastName,
      username: user.username, // Use original username (not from form)
      email: updatedProfileData.email,
      dob: user.dob, // Use original dob (not from form)
      gender: updatedProfileData.gender,
      nationality: updatedProfileData.nationality,
      phone: updatedProfileData.phone,
      street: updatedProfileData.street,
      city: updatedProfileData.city,
      state: updatedProfileData.state,
      zip: updatedProfileData.zip
    };

    console.log("Submitting profile data:", profileUpdateData);

    $.ajax({
      url: "http://localhost/WanderlustTrails/Backend/config/UserDashboard/manageUserProfile/editProfile.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(profileUpdateData),
      dataType: "json",
      success: function (response) {
        console.log("Edit response:", response);
        if (response.success) {
          toast.success(response.message || "Profile updated successfully!");
          
          if (response.mailSuccess) {
            toast.info('A confirmation email has been sent to your inbox');
          }
          
          setIsEditing(false);
          fetchUserProfile();
        } else {
          toast.error("Failed to update profile: " + response.message);
        }
      },
      error: function (xhr) {
        console.error("Error updating profile - Full details:", {
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText,
          sentData: profileUpdateData
        });
        
        let errorMessage = "Error updating profile: Server error";
        try {
          const response = JSON.parse(xhr.responseText);
          errorMessage = "Error updating profile: " + (response.message || "Server error");
          console.error("Backend error response:", response);
        } catch (e) {
          errorMessage = xhr.responseText || xhr.statusText || "Server error";
        }
        
        toast.error(errorMessage);
      },
    });
  };

  /**
   * Handle password verification before sending OTP
   */
  const handlePasswordVerification = (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      toast.error("Current password is required");
      return;
    }

    const username = user.username;
    if (!username) {
      toast.error("Username not found. Please log in again.");
      return;
    }

    $.ajax({
      url: "http://localhost/WanderlustTrails/Backend/config/auth/verifyPassword.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ 
        identifier: user.username, 
        currentPassword: passwordData.currentPassword 
      }),
      dataType: "json",
      success: function (verifyResponse) {
        console.log("Verification response:", verifyResponse);
        if (verifyResponse.success) {
          $.ajax({
            url: "http://localhost/WanderlustTrails/Backend/config/auth/forgotPassword.php",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ identifier: user.username }),
            dataType: "json",
            success: function (otpResponse) {
              console.log("OTP response:", otpResponse);
              if (otpResponse.success) {
                setOtpSent(true);
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
   * Handle password submission with OTP verification
   */
  const handlePasswordSubmit = (e) => {
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

    $.ajax({
      url: "http://localhost/WanderlustTrails/Backend/config/auth/verifyOtp.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        identifier: user.username,
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
          
          if (response.mailSuccess) {
            toast.info('A confirmation email has been sent to your inbox');
          }
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
   * Handle password field changes
   */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  if (!user) return <div className="p-8 text-white">Loading...</div>; 

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl p-6 bg-gray-600 text-white rounded-lg shadow-md">
        <h2 className="text-2xl text-orange-600 font-bold mb-6 text-center">Edit Profile</h2>

        {/* Show info box about restricted fields */}
        {isEditing && (
          <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
            <p className="text-sm text-yellow-300">
              ℹ️ <strong>Note:</strong> Username and Date of Birth cannot be changed. 
              If you need to update these fields, please contact support.
            </p>
          </div>
        )}

        <UserForm
          formData={profileData}
          setFormData={setProfileData}
          handleSubmit={handleProfileSubmit}
          isEditing={isEditing}
          submitLabel="Save Changes"
          cancelAction={() => setIsEditing(false)}
          restrictedFields={['username', 'dob']} // Pass restricted fields to form
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

        {/* Password change form */}
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
                {/* ✅ NEW: Password Input with Strength Meter */}
                <div className="mb-4">
                  <PasswordInput
                    value={passwordData.newPassword}
                    onChange={(e) => {
                        handlePasswordChange({
                          target: {
                            name: 'newPassword',
                            value: e.target.value
                          }
                        });
                    }}
                    label="New Password"
                    placeholder="Create a strong password"
                    showStrength={true}
                    showRequirements={true}
                    onValidationChange={setIsPasswordValid}
                    disabled={false}
                  />
                </div>

                {/* ✅ NEW: Confirm Password with Match Indicator */}
                <div className="mb-4">
                  <ConfirmPasswordInput
                    value={passwordData.confirmNewPassword}
                    onChange={(e) => {
                      handlePasswordChange({
                          target: {
                            name: 'confirmNewPassword',
                            value: e.target.value
                          }
                        });
                    }}
                    originalPassword={passwordData.newPassword}
                    label="Confirm New Password"
                    placeholder="Re-enter password"
                    disabled={false}
                  />
                </div>
                <div className="text-center">
                  <button
                      type="submit"
                      disabled={!isPasswordValid || passwordData.newPassword !== passwordData.confirmNewPassword}
                      className="py-2 px-4 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

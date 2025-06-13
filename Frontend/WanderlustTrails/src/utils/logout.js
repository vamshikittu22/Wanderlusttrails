// path: Frontend/WanderlustTrails/src/utils/logout.js

import $ from 'jquery';
import { toast } from 'react-toastify';

// Function to handle user logout via AJAX
const logoutUser = (callback) => {
    console.log('[logout] Sending logout request');

    // Make AJAX request to logout endpoint
    $.ajax({
        url: 'http://localhost/WanderlustTrails/backend/config/auth/logout.php', // Backend logout endpoint
        type: 'GET', // Using GET method to trigger logout
        dataType: 'json',
        
        // Handle successful logout response
        success: function (response) {
            console.log('[logout] Success response:', response);
            if (response.success) {
                toast.success(response.message || 'Logged out successfully!'); // Show success toast
            } else {
                toast.error(response.message || 'Failed to log out on the server.'); // Show error toast
            }
        },

        // Handle error during logout
        error: function (xhr) {
            console.error('[logout] Error:', xhr);
            let errorMessage = 'Error during logout. Please try again.';
            try {
                const errorResponse = JSON.parse(xhr.responseText);
                errorMessage = errorResponse.message || 'Server error';
            } catch (e) {
                errorMessage = xhr.statusText || 'Server error';
            }
            toast.error(errorMessage); // Show error message in toast
        },

        // Callback invoked after AJAX call is complete (success or failure)
        complete: function () {
            console.log('[logout] Complete, calling callback');
            if (callback && typeof callback === 'function') {
                callback(); // Execute the provided callback function
            }
        },
    });
};

export default logoutUser;

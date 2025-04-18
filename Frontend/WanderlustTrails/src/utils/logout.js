// path: Frontend/WanderlustTrails/src/utils/logout.js
import $ from 'jquery';
import { toast } from 'react-toastify';

const logoutUser = (callback) => {
    console.log('[logout] Sending logout request');
    $.ajax({
        url: 'http://localhost/WanderlustTrails/backend/config/auth/logout.php',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            console.log('[logout] Success response:', response);
            if (response.success) {
                toast.success(response.message || 'Logged out successfully!');
            } else {
                toast.error(response.message || 'Failed to log out on the server.');
            }
        },
        error: function (xhr) {
            console.error('[logout] Error:', xhr);
            let errorMessage = 'Error during logout. Please try again.';
            try {
                const errorResponse = JSON.parse(xhr.responseText);
                errorMessage = errorResponse.message || 'Server error';
            } catch (e) {
                errorMessage = xhr.statusText || 'Server error';
            }
            toast.error(errorMessage);
        },
        complete: function () {
            console.log('[logout] Complete, calling callback');
            if (callback && typeof callback === 'function') {
                callback();
            }
        },
    });
};

export default logoutUser;
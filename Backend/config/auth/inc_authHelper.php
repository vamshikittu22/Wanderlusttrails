<?php
// path: Backend/config/auth/inc_authHelper.php
// Shared helper functions for all auth operations

require_once __DIR__ . "/../inc_databaseClass.php";
require_once __DIR__ . "/../inc_logger.php";

/**
 * AuthHelper class - Reusable helper functions for authentication
 * Extracted from inc_userModel.php to reduce duplication
 */
class AuthHelper {
    private $db; // DatabaseClass instance

    public function __construct() {
        $this->db = new DatabaseClass(); // Initialize database connection
    }

    /**
     * Get user's email based on identifier (email, phone, or username)
     * @param string $identifier - Can be email, phone, or username
     * @return string|null - Email address or null if not found
     */
    public function getUserEmail($identifier) {
        // If already an email, return it
        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            return $identifier;
        }

        // Check if phone or username
        $isPhone = preg_match('/^[0-9]{10}$/', $identifier);
        $field = $isPhone ? "phone" : "username";
        
        // Fetch email from database
        $query = "SELECT email FROM users WHERE $field = ?";
        $result = $this->db->fetchQuery($query, "s", $identifier);

        if (empty($result) || !filter_var($result[0]['email'], FILTER_VALIDATE_EMAIL)) {
            return null;
        }

        return $result[0]['email'];
    }

    /**
     * Get full user details by identifier
     * @param string $identifier - Email, phone, or username
     * @return array|null - User data or null if not found
     */
    public function getUserByIdentifier($identifier) {
        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
        $isPhone = preg_match('/^[0-9]{10}$/', $identifier);
        $field = $isEmail ? "email" : ($isPhone ? "phone" : "username");
        
        $query = "SELECT * FROM users WHERE $field = ?";
        $result = $this->db->fetchQuery($query, "s", $identifier);
        
        return empty($result) ? null : $result[0];
    }

    /**
     * Check if email is already registered
     * @param string $email
     * @return bool
     */
    public function isEmailTaken($email) {
        $sql = "SELECT COUNT(*) as count FROM users WHERE email = ?";
        $connection = $this->db->connect();
        $stmt = $connection->prepare($sql);
        
        if (!$stmt) return true;
        
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        
        return $row['count'] > 0;
    }

    /**
     * Validate identifier format (email, phone, or username)
     */
    public function isValidIdentifier($identifier) {
        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) return true;
        if (preg_match('/^[0-9]{10}$/', $identifier)) return true;
        if (strlen($identifier) >= 3) return true;
        return false;
    }

    /**
     * Validate OTP format (6 digits)
     */
    public function isValidOtp($otp) {
        return strlen($otp) === 6 && ctype_digit($otp);
    }
}
?>

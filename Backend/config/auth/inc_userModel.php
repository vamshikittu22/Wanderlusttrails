<?php
//path: Wanderlusttrails/Backend/config/auth/inc_userModel.php
// This file contains the UserModel class which handles user registration, email validation, OTP sending, password verification, and reset.

include("../inc_databaseClass.php"); // Include the database connection class
require_once __DIR__ . "/../inc_logger.php"; // Include the logger class for logging
require_once __DIR__ . "/../../vendor/autoload.php"; // Autoload for external libraries, e.g., PHPMailer

// Load PHPMailer classes using namespaces
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// UserModel class to handle all user-related operations
class UserModel {
    private $db; // Database connection object

    // Constructor to initialize the database connection
    public function __construct() {
        $this->db = new DatabaseClass(); // Instantiate the DatabaseClass for DB operations
        Logger::log("UserModel instantiated"); // Log the instantiation
    }

    // Method to register a new user
    public function registerUser($firstName, $lastName, $userName, $email, $password, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip) {
        Logger::log("registerUser started for email: $email");

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Logger::log("Invalid email format: $email");
            return ["success" => false, "message" => "Invalid email format. use the correct email again"];
        }

        // Removed email uniqueness check to allow multiple accounts with same email
        // Check if email is already taken
        // if ($this->isEmailTaken($email)) {
        //     Logger::log("Email already in use: $email");
        //     return ["success" => false, "message" => "Email is already in use. try with a new email"];
        // }

        // Hash the password securely
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        // Prepare the SQL query to insert the new user
        $query = "INSERT INTO users (firstName, lastName, userName, email, password, dob, gender, nationality, phone, street, city, state, zip) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $types = "sssssssssssss"; // String types for all parameters

        // Execute the query with all user data parameters
        $result = $this->db->executeQuery($query, $types, $firstName, $lastName, $userName, $email, $hashedPassword, 
                                         $dob, $gender, $nationality, $phone, $street, $city, $state, $zip);
        Logger::log("registerUser result for email: $email - " . ($result['success'] ? "Success" : "Failed: {$result['message']}"));

        return $result; // Return success/failure of registration
    }

    // Private method to check if an email is already registered
    private function isEmailTaken($email) {
        Logger::log("Checking if email is taken: $email");

        // SQL to count users with the same email
        $sql = "SELECT COUNT(*) FROM users WHERE email = ?";
        $connection = $this->db->connect(); // Get DB connection
        $stmt = $connection->prepare($sql); // Prepare SQL statement

        if ($stmt === false) {
            Logger::log("Failed to prepare statement for email: $email - Error: {$connection->error}");
            return true; // Assume taken if query fails
        }

        $stmt->bind_param("s", $email); // Bind email parameter
        $stmt->execute(); // Execute query
        $stmt->bind_result($count); // Bind result to $count
        $stmt->fetch(); // Fetch result
        $stmt->close(); // Close statement

        if ($count > 0) {
            Logger::log("Email is taken: $email");
            return true; // Email exists
        }

        Logger::log("Email is available: $email");
        return false; // Email does not exist
    }

    // Method to verify the user's current password using username or email
    public function verifyPassword($identifier, $currentPassword) {
        Logger::log("verifyPassword started for identifier: $identifier");

        // Validate identifier is not empty
        if (empty(trim($identifier))) {
            Logger::log("Empty identifier provided");
            return ["success" => false, "message" => "Username or email is required"];
        }

        // Check if identifier is an email
        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
        $field = $isEmail ? "email" : "userName";

        // Prepare SQL to get user by username or email
        $query = "SELECT id, password FROM users WHERE $field = ?";
        $user = $this->db->fetchQuery($query, "s", $identifier);

        if (empty($user)) {
            Logger::log("User not found for identifier: $identifier");
            return ["success" => false, "message" => "User not found"];
        }

        // Verify provided password with stored hashed password
        if (password_verify($currentPassword, $user[0]['password'])) {
            Logger::log("Password verified for identifier: $identifier");
            return ["success" => true, "message" => "Password verified"];
        } else {
            Logger::log("Incorrect password for identifier: $identifier");
            return ["success" => false, "message" => "Incorrect current password"];
        }
    }

    // Method to send OTP to user's email for password reset
    public function sendOtp($identifier) {
        Logger::log("sendOtp started for identifier: $identifier");

        // Check if identifier is email, phone, or username
        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
        $isPhone = preg_match('/^[0-9]{10}$/', $identifier);
        
        // If not email or phone, assume it's a username
        $field = $isEmail ? "email" : ($isPhone ? "phone" : "userName");

        // Fetch user details based on identifier type
        $query = "SELECT id, email FROM users WHERE $field = ?";
        $result = $this->db->fetchQuery($query, "s", $identifier);

        if (empty($result)) {
            Logger::log("User not found for identifier: $identifier");
            return ["success" => false, "message" => "User not found"];
        }

        // Determine the email to send OTP to
        $userEmail = $isEmail ? $identifier : $result[0]['email'];
        if (!filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
            Logger::log("No valid email for identifier: $identifier");
            return ["success" => false, "message" => "No email associated with this account"];
        }

        // Generate 6-digit OTP padded with leading zeros if necessary
        $otp = str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);

        // Log OTP to file for debugging or auditing
        $otpMessage = "OTP for $identifier: $otp (valid for 10 minutes)\n";
        file_put_contents(__DIR__ . "/../logs/otp.log", $otpMessage, FILE_APPEND);
        Logger::log("OTP generated for identifier: $identifier - OTP: $otp");

        // Delete any existing OTPs for this identifier to avoid conflicts
        $deleteQuery = "DELETE FROM otps WHERE identifier = ?";
        $this->db->executeQuery($deleteQuery, "s", $identifier);

        // Set timestamps for OTP creation and expiry (10 minutes validity)
        $createdAt = date('Y-m-d H:i:s');
        $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

        // Insert new OTP record into the database
        $insertQuery = "INSERT INTO otps (identifier, otp, created_at, expires_at) VALUES (?, ?, ?, ?)";
        $insertTypes = "ssss";
        $insertResult = $this->db->executeQuery($insertQuery, $insertTypes, $identifier, $otp, $createdAt, $expiresAt);

        if (!$insertResult['success']) {
            Logger::log("Failed to store OTP for identifier: $identifier - Error: {$insertResult['message']}");
            return ["success" => false, "message" => "Failed to store OTP"];
        }

        // Setup PHPMailer to send the OTP via email
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'wanderlusttrailsproject@gmail.com'; // Your email address
            $mail->Password = 'rlpw frou gnni ftmv'; // Use an app password (this should be stored securely)
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;
            $mail->setFrom('your-email@gmail.com', 'Wanderlust Trails'); // Sender info
            $mail->addAddress($userEmail); // Recipient
            $mail->isHTML(true);
            $mail->Subject = 'Your OTP for Password Reset';
            $mail->Body = "Your OTP is: <b>$otp</b>. It expires in 10 minutes.";
            $mail->AltBody = "Your OTP is: $otp. It expires in 10 minutes.";
            $mail->send();
            Logger::log("OTP email sent to $userEmail for identifier: $identifier");
        } catch (Exception $e) {
            Logger::log("Failed to send OTP email to $userEmail: {$mail->ErrorInfo}");
            return ["success" => false, "message" => "Failed to send OTP: {$mail->ErrorInfo}"];
        }

        Logger::log("sendOtp completed successfully for identifier: $identifier");
        return ["success" => true, "message" => "OTP sent successfully"];
    }

    // Method to verify the OTP and reset the password
    public function verifyOtpAndResetPassword($identifier, $otp, $newPassword) {
        Logger::log("verifyOtpAndResetPassword started for identifier: $identifier");

        // Validate identifier format
        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
        $isPhone = preg_match('/^[0-9]{10}$/', $identifier);

        if (!$isEmail && !$isPhone) {
            Logger::log("Invalid identifier format: $identifier");
            return ["success" => false, "message" => "Invalid email or phone format"];
        }

        // Validate OTP format (6 digits numeric)
        if (strlen($otp) !== 6 || !ctype_digit($otp)) {
            Logger::log("Invalid OTP format: $otp");
            return ["success" => false, "message" => "Invalid OTP"];
        }

        // Validate new password length (minimum 8 characters)
        if (strlen($newPassword) < 8) {
            Logger::log("Password too short for identifier: $identifier");
            return ["success" => false, "message" => "Password must be at least 8 characters"];
        }

        // Fetch OTP and expiry from database to verify
        $query = "SELECT otp, expires_at FROM otps WHERE identifier = ? AND otp = ?";
        $result = $this->db->fetchQuery($query, "ss", $identifier, $otp);

        if (empty($result)) {
            Logger::log("Invalid OTP for identifier: $identifier");
            return ["success" => false, "message" => "Invalid or expired OTP"];
        }

        // Check if OTP is expired by comparing current time and expiry time
        $expiresAt = strtotime($result[0]['expires_at']);
        $currentTime = time();
        if ($currentTime > $expiresAt) {
            Logger::log("OTP expired for identifier: $identifier");

            // Delete expired OTP
            $deleteQuery = "DELETE FROM otps WHERE identifier = ?";
            $this->db->executeQuery($deleteQuery, "s", $identifier);

            return ["success" => false, "message" => "Invalid or expired OTP"];
        }

        // Hash the new password before storing
        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

        // Update the user's password in the database based on identifier type
        $query = "UPDATE users SET password = ? WHERE " . ($isEmail ? "email = ?" : "phone = ?");
        $types = "ss";
        $result = $this->db->executeQuery($query, $types, $hashedPassword, $identifier);

        if (!$result['success']) {
            Logger::log("Failed to reset password for identifier: $identifier - Error: {$result['message']}");
            return ["success" => false, "message" => "Failed to reset password"];
        }

        Logger::log("Password reset successfully for identifier: $identifier");
        return ["success" => true, "message" => "Password reset successfully"];
    }
}
?>

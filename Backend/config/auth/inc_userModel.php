<?php
//path: Wanderlusttrails/Backend/config/auth/inc_userModel.php
// This file contains the UserModel class which handles user registration, email validation, OTP sending, password verification, and reset.

include("../inc_databaseClass.php");
require_once __DIR__ . "/../inc_logger.php";
require_once __DIR__ . "/../../vendor/autoload.php";

// Load PHPMailer classes
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
//usermodel class
class UserModel {
    private $db; // Database connection object
// Constructor to initialize the database connection
    public function __construct() {
        $this->db = new DatabaseClass(); // Create a new instance of the DatabaseClass
        Logger::log("UserModel instantiated");
    }

    // Method to register a new user
    public function registerUser($firstName, $lastName, $email, $password, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip) {
        Logger::log("registerUser started for email: $email");
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Logger::log("Invalid email format: $email");
            return ["success" => false, "message" => "Invalid email format. use the correct email again"];  // Validate email format
        }
        if ($this->isEmailTaken($email)) {
            Logger::log("Email already in use: $email");
            return ["success" => false, "message" => "Email is already in use. try with a new email"]; // Check if email is already taken
        }
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT); // Hash the password for security
        //prepare the SQL query to insert user data into the database
        $query = "INSERT INTO users (firstName, lastName, email, password, dob, gender, nationality, phone, street, city, state, zip) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"; // SQL query to insert user data into the database
        $types = "ssssssssssss"; // Define the types for the prepared statement
        $result = $this->db->executeQuery($query, $types, $firstName, $lastName, $email, $hashedPassword, 
                        $dob, $gender, $nationality, $phone, $street, $city, $state, $zip); // Execute the query with the provided parameters
        Logger::log("registerUser result for email: $email - " . ($result['success'] ? "Success" : "Failed: {$result['message']}"));
        return $result;     // Return the result of the query execution
    }
// Method to validate the email format
    private function isEmailTaken($email) {
        Logger::log("Checking if email is taken: $email");

        //prepare the SQL query to check if the email is already in use
        $sql = "SELECT COUNT(*) FROM users WHERE email = ?"; // SQL query to check if the email is already in use
        $connection = $this->db->connect(); // Get the database connection
        $stmt = $connection->prepare($sql); // Prepare the SQL statement
        if ($stmt === false) {
            Logger::log("Failed to prepare statement for email: $email - Error: {$connection->error}");
            return true;
        }
        // Bind the email parameter to the prepared statement
        $stmt->bind_param("s", $email); 
        $stmt->execute(); // Execute the statement
        $stmt->bind_result($count); // Bind the result to a variable
        $stmt->fetch(); // Fetch the result
        $stmt->close(); // Close the statement
        if ($count > 0) {
            Logger::log("Email is taken: $email");
            return true; // Email is already in use
        }
        Logger::log("Email is available: $email");
        return false; // Email is available
    }
//verify password method
    public function verifyPassword($identifier, $currentPassword) {
        Logger::log("verifyPassword started for identifier: $identifier");
// Check if the identifier is a valid email or phone number
        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
        $isPhone = preg_match('/^[0-9]{10}$/', $identifier);

        if (!$isEmail && !$isPhone) {
            Logger::log("Invalid identifier format: $identifier");
            return ["success" => false, "message" => "Invalid email or phone format"];
        }
// Prepare the SQL query to fetch the password based on the identifier type
        $query = "SELECT password FROM users WHERE " . ($isEmail ? "email = ?" : "phone = ?"); //sql query to fetch the password
        $user = $this->db->fetchQuery($query, "s", $identifier); // Execute the query with the identifier

        if (empty($user)) {
            Logger::log("User not found for identifier: $identifier");
            return ["success" => false, "message" => "User not found"]; // Check if the user exists
        }

        if (password_verify($currentPassword, $user[0]['password'])) {
            Logger::log("Password verified for identifier: $identifier");
            return ["success" => true, "message" => "Password verified"]; // Verify the password using password_verify
        } else {
            Logger::log("Incorrect current password for identifier: $identifier");
            return ["success" => false, "message" => "Incorrect current password"]; // Check if the password matches
        }
    }
    // Method to send OTP to the user's email
    public function sendOtp($identifier) {
        Logger::log("sendOtp started for identifier: $identifier");
// Check if the identifier is a valid email or phone number
        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL); // Validate email format
        $isPhone = preg_match('/^[0-9]{10}$/', $identifier); // Validate phone number format

        if (!$isEmail && !$isPhone) {
            Logger::log("Invalid identifier format: $identifier");
            return ["success" => false, "message" => "Invalid email or phone format"];
        }
//query to fetch the user based on the identifier type
        $query = "SELECT id, email FROM users WHERE " . ($isEmail ? "email = ?" : "phone = ?"); //sql query to fetch the user
        $result = $this->db->fetchQuery($query, "s", $identifier); // Execute the query with the identifier

        if (empty($result)) {
            Logger::log("User not found for identifier: $identifier");
            return ["success" => false, "message" => "User not found"];
        }

        // Check if the user has a valid email address
        $userEmail = $isEmail ? $identifier : $result[0]['email'];
        if (!filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
            Logger::log("No valid email for identifier: $identifier");
            return ["success" => false, "message" => "No email associated with this account"]; 
        }
// Generate a 6-digit OTP
        $otp = str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $otpMessage = "OTP for $identifier: $otp (valid for 10 minutes)\n";
        file_put_contents(__DIR__ . "/../logs/otp.log", $otpMessage, FILE_APPEND);
        Logger::log("OTP generated for identifier: $identifier - OTP: $otp");

        // Store the OTP in the database
        // First, delete any existing OTPs for this identifier
        $deleteQuery = "DELETE FROM otps WHERE identifier = ?";
        $this->db->executeQuery($deleteQuery, "s", $identifier);

        // Calculate expiration time (10 minutes from now)
        $createdAt = date('Y-m-d H:i:s');
        $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

        // Insert the new OTP
        // Prepare the SQL query to insert the OTP into the database
        $insertQuery = "INSERT INTO otps (identifier, otp, created_at, expires_at) VALUES (?, ?, ?, ?)"; // SQL query to insert the OTP into the database
        $insertTypes = "ssss"; // Define the types for the prepared statement
        $insertResult = $this->db->executeQuery($insertQuery, $insertTypes, $identifier, $otp, $createdAt, $expiresAt); // Execute the query with the provided parameters
        if (!$insertResult['success']) {
            Logger::log("Failed to store OTP for identifier: $identifier - Error: {$insertResult['message']}");
            return ["success" => false, "message" => "Failed to store OTP"];
        }

        // Send the OTP to the user's email using PHPMailer
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'wanderlusttrailsproject@gmail.com'; // Your email address
            $mail->Password = 'rlpw frou gnni ftmv'; // Use an app password
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;
            $mail->setFrom('your-email@gmail.com', 'Wanderlust Trails');
            $mail->addAddress($userEmail);
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
// Check if the identifier is a valid email or phone number
        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);     // Validate email format
        $isPhone = preg_match('/^[0-9]{10}$/', $identifier);     // Validate phone number format
//validate 
        if (!$isEmail && !$isPhone) {   // Check if the identifier is valid
            Logger::log("Invalid identifier format: $identifier");
            return ["success" => false, "message" => "Invalid email or phone format"];
        }

        if (strlen($otp) !== 6 || !ctype_digit($otp)) { // Validate OTP format
            Logger::log("Invalid OTP format: $otp");
            return ["success" => false, "message" => "Invalid OTP"];
        }

        if (strlen($newPassword) < 8) { // Validate password length
            Logger::log("Password too short for identifier: $identifier");
            return ["success" => false, "message" => "Password must be at least 8 characters"];
        }

        // Query the database to verify the OTP
        $query = "SELECT otp, expires_at FROM otps WHERE identifier = ? AND otp = ?"; //sql query to verify the OTP
        $result = $this->db->fetchQuery($query, "ss", $identifier, $otp); // Execute the query with the identifier and OTP

        if (empty($result)) {
            Logger::log("Invalid OTP for identifier: $identifier");
            return ["success" => false, "message" => "Invalid or expired OTP"];
        }

        // Check if the OTP has expired
        $expiresAt = strtotime($result[0]['expires_at']);
        $currentTime = time();
        if ($currentTime > $expiresAt) {
            Logger::log("OTP expired for identifier: $identifier");
            // Delete the expired OTP
            $deleteQuery = "DELETE FROM otps WHERE identifier = ?"; //sql query to delete the expired OTP
            $this->db->executeQuery($deleteQuery, "s", $identifier); // Execute the query to delete the expired OTP
            return ["success" => false, "message" => "Invalid or expired OTP"];
        }
        

        // Hash the new password and update it in the database
        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
        // Prepare the SQL query to update the password based on the identifier type
        $query = "UPDATE users SET password = ? WHERE " . ($isEmail ? "email = ?" : "phone = ?"); //sql query to update the password
        $types = "ss"; // Define the types for the prepared statement
        $result = $this->db->executeQuery($query, $types, $hashedPassword, $identifier); // Execute the query with the hashed password and identifier

        if (!$result['success']) {
            Logger::log("Failed to reset password for identifier: $identifier - Error: {$result['message']}");
            return ["success" => false, "message" => "Failed to reset password"]; // Check if the password reset was successful
        }

        Logger::log("Password reset successfully for identifier: $identifier");
        return ["success" => true, "message" => "Password reset successfully"]; // Return success message
    }
}
?>
<?php
//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx
// This file contains the UserModel class which handles user registration, email validation, OTP sending, password verification, and reset.

include("../inc_databaseClass.php");
require_once __DIR__ . "/../inc_logger.php";
require_once __DIR__ . "/../../vendor/autoload.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class UserModel {
    private $db;

    public function __construct() {
        $this->db = new DatabaseClass();
        Logger::log("UserModel instantiated");
    }

    public function registerUser($firstName, $lastName, $email, $password, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip) {
        Logger::log("registerUser started for email: $email");
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Logger::log("Invalid email format: $email");
            return ["success" => false, "message" => "Invalid email format. use the correct email again"];
        }
        if ($this->isEmailTaken($email)) {
            Logger::log("Email already in use: $email");
            return ["success" => false, "message" => "Email is already in use. try with a new email"];
        }
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $query = "INSERT INTO users (firstName, lastName, email, password, dob, gender, nationality, phone, street, city, state, zip) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $types = "ssssssssssss";
        $result = $this->db->executeQuery($query, $types, $firstName, $lastName, $email, $hashedPassword, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip);
        Logger::log("registerUser result for email: $email - " . ($result['success'] ? "Success" : "Failed: {$result['message']}"));
        return $result;
    }

    private function isEmailTaken($email) {
        Logger::log("Checking if email is taken: $email");
        $sql = "SELECT COUNT(*) FROM users WHERE email = ?";
        $connection = $this->db->connect();
        $stmt = $connection->prepare($sql);
        if ($stmt === false) {
            Logger::log("Failed to prepare statement for email: $email - Error: {$connection->error}");
            return true;
        }
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        if ($count > 0) {
            Logger::log("Email is taken: $email");
            return true;
        }
        Logger::log("Email is available: $email");
        return false;
    }

    public function verifyPassword($identifier, $currentPassword) {
        Logger::log("verifyPassword started for identifier: $identifier");

        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
        $isPhone = preg_match('/^[0-9]{10}$/', $identifier);

        if (!$isEmail && !$isPhone) {
            Logger::log("Invalid identifier format: $identifier");
            return ["success" => false, "message" => "Invalid email or phone format"];
        }

        $query = "SELECT password FROM users WHERE " . ($isEmail ? "email = ?" : "phone = ?");
        $user = $this->db->fetchQuery($query, "s", $identifier);

        if (empty($user)) {
            Logger::log("User not found for identifier: $identifier");
            return ["success" => false, "message" => "User not found"];
        }

        if (password_verify($currentPassword, $user[0]['password'])) {
            Logger::log("Password verified for identifier: $identifier");
            return ["success" => true, "message" => "Password verified"];
        } else {
            Logger::log("Incorrect current password for identifier: $identifier");
            return ["success" => false, "message" => "Incorrect current password"];
        }
    }

    public function sendOtp($identifier) {
        Logger::log("sendOtp started for identifier: $identifier");

        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
        $isPhone = preg_match('/^[0-9]{10}$/', $identifier);

        if (!$isEmail && !$isPhone) {
            Logger::log("Invalid identifier format: $identifier");
            return ["success" => false, "message" => "Invalid email or phone format"];
        }

        $query = "SELECT id, email FROM users WHERE " . ($isEmail ? "email = ?" : "phone = ?");
        $result = $this->db->fetchQuery($query, "s", $identifier);

        if (empty($result)) {
            Logger::log("User not found for identifier: $identifier");
            return ["success" => false, "message" => "User not found"];
        }

        $userEmail = $isEmail ? $identifier : $result[0]['email'];
        if (!filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
            Logger::log("No valid email for identifier: $identifier");
            return ["success" => false, "message" => "No email associated with this account"];
        }

        $otp = str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $otpMessage = "OTP for $identifier: $otp (valid for 10 minutes)\n";
        file_put_contents(__DIR__ . "/../logs/otp.log", $otpMessage, FILE_APPEND);
        Logger::log("OTP generated for identifier: $identifier - OTP: $otp");

        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'wanderlusttrailsproject@gmail.com';
            $mail->Password = 'rlpw frou gnni ftmv'; // Your REAL App Password here
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

    public function verifyOtpAndResetPassword($identifier, $otp, $newPassword) {
        Logger::log("verifyOtpAndResetPassword started for identifier: $identifier");

        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
        $isPhone = preg_match('/^[0-9]{10}$/', $identifier);

        if (!$isEmail && !$isPhone) {
            Logger::log("Invalid identifier format: $identifier");
            return ["success" => false, "message" => "Invalid email or phone format"];
        }

        if (strlen($otp) !== 6 || !ctype_digit($otp)) {
            Logger::log("Invalid OTP format: $otp");
            return ["success" => false, "message" => "Invalid OTP"];
        }

        if (strlen($newPassword) < 8) {
            Logger::log("Password too short for identifier: $identifier");
            return ["success" => false, "message" => "Password must be at least 8 characters"];
        }

        $otpFile = __DIR__ . "/../logs/otp.log";
        $otpValid = false;
        if (file_exists($otpFile)) {
            $otpLines = file($otpFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($otpLines as $line) {
                if (strpos($line, "OTP for $identifier: $otp") !== false) {
                    $otpValid = true;
                    break;
                }
            }
        }

        if (!$otpValid) {
            Logger::log("Invalid OTP for identifier: $identifier");
            return ["success" => false, "message" => "Invalid or expired OTP"];
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
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




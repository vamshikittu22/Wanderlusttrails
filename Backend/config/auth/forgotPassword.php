<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_databaseClass.php";
require_once __DIR__ . "/./../../vendor/autoload.php";
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data || !isset($data['identifier']) || empty($data['identifier'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Email or phone is required"]);
        exit;
    }

    $identifier = $data['identifier'];
    $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
    $isPhone = preg_match('/^[0-9]{10}$/', $identifier);

    if (!$isEmail && !$isPhone) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid email or phone format"]);
        exit;
    }

    $db = new DatabaseClass();

    $query = "SELECT id, email, phone FROM users WHERE " . ($isEmail ? "email = ?" : "phone = ?");
    $user = $db->fetchQuery($query, "s", $identifier);
    if (empty($user)) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Email or phone not found"]);
        exit;
    }

    $email = $user[0]['email'];
    $phone = $user[0]['phone'];

    $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    $expires = date('Y-m-d H:i:s', strtotime('+15 minutes'));

    $query = "UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?";
    $result = $db->executeQuery($query, "ssi", $otp, $expires, $user[0]['id']);

    if (!$result['success']) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to generate OTP"]);
        exit;
    }

    $timestamp = date('Y-m-d H:i:s');
    if ($isEmail || !$phone) {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'wanderlusttrailsproject@gmail.com';
            $mail->Password = 'rlpw frou gnni ftmv'; // Your REAL App Password here
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            $mail->setFrom('wanderlusttrailsproject@gmail.com', 'Wanderlust Trails');
            $mail->addAddress($email);
            $mail->isHTML(true);
            $mail->Subject = 'Password Reset OTP';
            $mail->Body = "Your OTP to reset your password is: <strong>$otp</strong>. It expires in 15 minutes.";
            $mail->AltBody = "Your OTP to reset your password is: $otp. It expires in 15 minutes.";

            $mail->send();
            echo json_encode(["success" => true, "message" => "OTP sent to your email"]);
        } catch (Exception $e) {
            file_put_contents(__DIR__ . "/../logs/debug.log", "[$timestamp] OTP for $email: $otp (Email failed: {$mail->ErrorInfo})\n", FILE_APPEND);
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to send OTP email: " . $mail->ErrorInfo]);
        }
    } else {
        file_put_contents(__DIR__ . "/../logs/debug.log", "[$timestamp] OTP for $phone: $otp (Phone not implemented)\n", FILE_APPEND);
        echo json_encode(["success" => true, "message" => "OTP generated; check debug.log (phone not implemented)"]);
    }
    http_response_code(200);
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>
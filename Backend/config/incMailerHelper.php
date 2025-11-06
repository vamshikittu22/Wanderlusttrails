<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
include_once __DIR__ . '/inc_logger.php';


// Path to Composer's autoloader
$autoloadPath = __DIR__ . '/../vendor/autoload.php';

// Verify autoloader exists
if (!file_exists($autoloadPath)) {
    error_log('[incMailerHelper.php] Composer autoloader not found at: ' . $autoloadPath);
    throw new Exception('Composer autoloader not found. Run: composer install');
}

require_once $autoloadPath;

/**
 * Send an email using PHPMailer.
 * @param string $to Recipient email address
 * @param string $name Recipient name (can be empty)
 * @param string $subject Email subject
 * @param string $body HTML email body
 * @param string $altBody Plain text body (optional)
 * @return array ["success" => bool, "message" => string]
 */


function sendMail($to, $name, $subject, $body, $altBody = '') {
    $mail = new PHPMailer(true);
    try {
        // SMTP server settings
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;

        //get mail & password from mail_config.php
        $mailConfig = require __DIR__ . '/mail_config.php';
        $mail->Username = $mailConfig['MAIL_USERNAME'];
        $mail->Password = $mailConfig['MAIL_PASSWORD'];

        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // Sender and recipient
        $mail->setFrom('wanderlusttrailsproject@gmail.com', 'WanderlustTrails');
        $mail->addAddress($to, $name ?: $to);

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->AltBody = $altBody ?: strip_tags($body);

        $mail->send();


        return [
            "success" => true, 
            "message" => "Email sent successfully."
        ];
        Logger::log("Email sent successfully to: $to");

    } catch (Exception $e) {
        $errorMessage = $mail->ErrorInfo ?? $e->getMessage();
        error_log('[incMailerHelper.php] ❌ Email failed: ' . $errorMessage);
        Logger::log('[incMailerHelper.php] ❌ Email failed to: ' . $to . ', Error: ' . $errorMessage);
        return [
            "success" => false, 
            "message" => "Email could not be sent. Mailer Error: {$errorMessage}"
        ];
    }
}

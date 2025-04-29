<?php
require_once __DIR__ . "/../inc_databaseClass.php";
require_once __DIR__ . "/../inc_logger.php";

class PaymentClass {
    private $db;

    public function __construct() {
        $this->db = new DatabaseClass();
    }

    public function createPayment($bookingId, $userId, $amount, $paymentMethod, $transactionId, $paymentDate = null) {
        // Validate inputs
        $validMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer'];
        if (!$bookingId || !$userId || !$amount || !$paymentMethod || !in_array($paymentMethod, $validMethods)) {
            Logger::log("Validation failed: Missing or invalid fields");
            throw new Exception("Missing or invalid fields", 400);
        }

        if (!is_numeric($amount) || $amount <= 0) {
            Logger::log("Validation failed: Amount must be a positive number");
            throw new Exception("Amount must be a positive number", 400);
        }

        if ($this->db->recordExists('payments', 'transaction_id', $transactionId, 's')) {
            Logger::log("Validation failed: Transaction ID already exists");
            throw new Exception("Transaction ID already exists", 400); // Use 400 for client-side validation error
        }

        if ($paymentDate) {
            $date = DateTime::createFromFormat('Y-m-d H:i:s', $paymentDate);
            if (!$date || $date->format('Y-m-d H:i:s') !== $paymentDate) {
                Logger::log("Validation failed: Invalid payment_date format");
                throw new Exception("Invalid payment_date format", 400);
            }
        }

        // Verify booking exists and user matches
        $bookingQuery = "SELECT user_id FROM bookings WHERE id = ?";
        $bookingData = $this->db->fetchQuery($bookingQuery, "i", $bookingId);
        if (empty($bookingData)) {
            Logger::log("Validation failed: Booking not found");
            throw new Exception("Booking not found", 400);
        }
        if ($bookingData[0]['user_id'] != $userId) {
            Logger::log("Validation failed: User ID does not match booking");
            throw new Exception("User ID does not match booking", 403);
        }

        // Insert payment
        $query = "INSERT INTO payments (booking_id, user_id, amount, payment_method, transaction_id, payment_status, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $status = 'completed';
        $types = "iidssss";
        $params = [$bookingId, $userId, $amount, $paymentMethod, $transactionId, $status, $paymentDate ?: date('Y-m-d H:i:s')];

        $this->db->beginTransaction();
        try {
            $result = $this->db->executeQuery($query, $types, ...$params);
            if ($result['success']) {
                $this->db->commit();
                Logger::log("Payment recorded, ID: " . $result['insert_id']);
                return [
                    "success" => true,
                    "message" => "Payment recorded successfully",
                    "payment_id" => $result['insert_id']
                ];
            } else {
                $this->db->rollback();
                Logger::log("Insert failed: " . json_encode($result));
                throw new Exception("Failed to record payment", 500);
            }
        } catch (Exception $e) {
            $this->db->rollback();
            Logger::log("Exception in createPayment: " . $e->getMessage());
            throw $e;
        }
    }

    public function updatePaymentStatus($transactionId, $paymentStatus) {
        $validStatuses = ['pending', 'completed', 'failed'];
        if (!$transactionId || !$paymentStatus || !in_array($paymentStatus, $validStatuses)) {
            Logger::log("Validation failed: Missing or invalid fields");
            throw new Exception("Missing or invalid fields", 400);
        }

        if (!$this->db->recordExists('payments', 'transaction_id', $transactionId, 's')) {
            Logger::log("Validation failed: Transaction ID not found");
            throw new Exception("Transaction ID not found", 404);
        }

        $currentStatusQuery = "SELECT payment_status FROM payments WHERE transaction_id = ?";
        $currentStatusData = $this->db->fetchQuery($currentStatusQuery, "s", $transactionId);
        if (!empty($currentStatusData) && $currentStatusData[0]['payment_status'] === $paymentStatus) {
            Logger::log("Status unchanged: $paymentStatus");
            return ["success" => true, "message" => "Status unchanged"];
        }

        $query = "UPDATE payments SET payment_status = ?, updated_at = NOW() WHERE transaction_id = ?";
        $types = "ss";
        $params = [$paymentStatus, $transactionId];

        $this->db->beginTransaction();
        try {
            $result = $this->db->executeQuery($query, $types, ...$params);
            if ($result['success']) {
                $this->db->commit();
                Logger::log("Payment status updated");
                return [
                    "success" => true,
                    "message" => "Payment status updated successfully"
                ];
            } else {
                $this->db->rollback();
                Logger::log("Update failed: " . json_encode($result));
                throw new Exception("Failed to update payment status", 500);
            }
        } catch (Exception $e) {
            $this->db->rollback();
            Logger::log("Exception in updatePaymentStatus: " . $e->getMessage());
            throw $e;
        }
    }

    public function getPaymentDetails($bookingId) {
        if (!$bookingId) {
            Logger::log("Validation failed: Missing booking_id");
            throw new Exception("Missing booking_id", 400);
        }

        $query = "
            SELECT 
                payment_method, 
                payment_status, 
                transaction_id, 
                payment_date
            FROM payments 
            WHERE booking_id = ?
            ORDER BY payment_date DESC
        ";
        $types = "i";
        $data = $this->db->fetchQuery($query, $types, $bookingId);

        if (!empty($data)) {
            $payments = array_map(function($payment) {
                return [
                    "payment_method" => $payment['payment_method'] ?? 'N/A',
                    "payment_status" => $payment['payment_status'] ?? 'N/A',
                    "transaction_id" => $payment['transaction_id'] ?? null,
                    "payment_date" => $payment['payment_date'] ?? 'N/A'
                ];
            }, $data);
            Logger::log("Payments found for booking_id=$bookingId: " . json_encode($payments));
            return [
                "success" => true,
                "data" => $payments,
                "message" => "Payment details retrieved successfully"
            ];
        } else {
            Logger::log("No payment found for booking_id=$bookingId");
            return [
                "success" => true,
                "data" => [],
                "message" => "No payments found"
            ];
        }
    }
}
?>
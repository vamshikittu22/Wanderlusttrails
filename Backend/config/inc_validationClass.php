<?php
require_once __DIR__ . "/inc_databaseClass.php";
require_once __DIR__ . "/inc_logger.php";

class ValidationClass {
    private $db;

    public function __construct() {
        $this->db = new DatabaseClass(); // Initialize the database connection
    }
// Validate required fields in the request data
    public function validateRequiredFields($data, $requiredFields) {
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || $data[$field] === '' || $data[$field] === null) {
                return ["success" => false, "message" => "Missing required field: $field"];
            }
        }
        return ["success" => true];
    }
// Validate if a field is numeric and greater than zero
    public function validateNumeric($value, $fieldName) {
        if (!isset($value) || !is_numeric($value) || $value <= 0) {
            return ["success" => false, "message" => "$fieldName must be a positive number"];
        }
        return ["success" => true];
    }
// Validate if a field is a valid string
    public function validateBookingType($bookingType) {
        $validTypes = ['flight_hotel', 'package', 'itinerary'];
        if (!in_array($bookingType, $validTypes)) {
            return ["success" => false, "message" => "Invalid booking_type. Must be one of: " . implode(', ', $validTypes)];
        }
        return ["success" => true];
    }
// Validate if a field is a valid date format (Y-m-d) and check if the date is in the past or not
    public function validateDateRange($startDate, $endDate, $bookingType) {
        $start = DateTime::createFromFormat('Y-m-d', $startDate);
        if (!$start || $start->format('Y-m-d') !== $startDate) {
            return ["success" => false, "message" => "Invalid start_date format. Use Y-m-d"];
        }

        if ($start < new DateTime('today')) {
            return ["success" => false, "message" => "start_date cannot be in the past"];
        }

        if ($endDate !== null) {
            $end = DateTime::createFromFormat('Y-m-d', $endDate);
            if (!$end || $end->format('Y-m-d') !== $endDate) {
                return ["success" => false, "message" => "Invalid end_date format. Use Y-m-d"];
            }

            if ($end < $start) {
                return ["success" => false, "message" => "end_date cannot be before start_date"];
            }
        } elseif ($bookingType !== 'flight_hotel') {
            return ["success" => false, "message" => "end_date is required for $bookingType bookings"];
        }

        return ["success" => true];
    }
// Validate if a field is a valid email format
    public function validateUserExists($userId) {
        if (!$this->db->recordExists('users', 'id', $userId, 'i')) {
            return ["success" => false, "message" => "User not found"];
        }
        return ["success" => true];
    }
    //validate package id and get package details
    public function validatePackage($packageId) {
        $query = "SELECT name, price FROM packages WHERE id = ?";
        $types = "i";
        $result = $this->db->fetchQuery($query, $types, $packageId);
        if (empty($result)) {
            return ["success" => false, "message" => "Package not found"];
        }
        return ["success" => true, "data" => $result[0]];
    }
    //validate status of booking
    public function validateStatus($status) {
        $validStatuses = ['pending', 'confirmed', 'canceled'];
        if (!in_array($status, $validStatuses)) {
            return ["success" => false, "message" => "Invalid status. Must be one of: " . implode(', ', $validStatuses)];
        }
        return ["success" => true];
    }
//validate if booking exists and belongs to user
    public function validateBookingExists($bookingId, $userId) {
        $query = "SELECT 1 FROM bookings WHERE id = ? AND user_id = ?";
        $types = "ii";
        $result = $this->db->fetchQuery($query, $types, $bookingId, $userId);
        if (empty($result)) {
            return ["success" => false, "message" => "Booking not found or does not belong to user"];
        }
        return ["success" => true];
    }
}
?>
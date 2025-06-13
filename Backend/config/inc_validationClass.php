<?php
// Path: Wanderlusttrails/Backend/config/inc_validationClass.php
require_once __DIR__ . "/inc_databaseClass.php";
require_once __DIR__ . "/inc_logger.php";

// ValidationClass for handling input validations
class ValidationClass {
    private $db; // Database connection

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

    // Validate whether the booking date is valid and in the future
    public function validateFutureBookingDate($date) {
        $bookingDate = DateTime::createFromFormat('Y-m-d', $date);
        if (!$bookingDate || $bookingDate->format('Y-m-d') !== $date || $bookingDate < new DateTime('today')) {
            return ["success" => false, "message" => "Booking date must be a valid future date"];
        }
        return ["success" => true];
    }

    // Validate Date of Birth (DOB)
    public function validateDateOfBirth($dob) {
        $dobDate = DateTime::createFromFormat('Y-m-d', $dob);
        if (!$dobDate || $dobDate->format('Y-m-d') !== $dob) {
            return ["success" => false, "message" => "Invalid date of birth format. Use Y-m-d"];
        }

        $age = (new DateTime())->diff($dobDate)->y;
        if ($age < 18) {
            return ["success" => false, "message" => "User must be at least 18 years old"];
        }

        return ["success" => true];
    }

    // Validate if a field is a valid email format
    public function validateEmail($email) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ["success" => false, "message" => "Invalid email format"];
        }
        return ["success" => true];
    }

    // Validate phone number format
    public function validatePhone($phone) {
        if (!preg_match('/^[0-9]{10}$/', $phone)) {
            return ["success" => false, "message" => "Invalid phone number format"];
        }
        return ["success" => true];
    }

    // Validate if a user exists
    public function validateUserExists($userId) {
        if (!$this->db->recordExists('users', 'id', $userId, 'i')) {
            return ["success" => false, "message" => "User not found"];
        }
        return ["success" => true];
    }

    // Validate package id and get package details
    public function validatePackage($packageId) {
        $query = "SELECT name, price FROM packages WHERE id = ?";
        $types = "i";
        $result = $this->db->fetchQuery($query, $types, $packageId);
        if (empty($result)) {
            return ["success" => false, "message" => "Package not found"];
        }
        return ["success" => true, "data" => $result[0]];
    }

    // Validate status of booking
    public function validateStatus($status) {
        $validStatuses = ['pending', 'confirmed', 'canceled'];
        if (!in_array($status, $validStatuses)) {
            return ["success" => false, "message" => "Invalid status. Must be one of: " . implode(', ', $validStatuses)];
        }
        return ["success" => true];
    }

    // Validate if booking exists and belongs to user
    public function validateBookingExists($bookingId, $userId) {
        $query = "SELECT id FROM bookings WHERE id = ? AND user_id = ? AND status = 'confirmed'"; // Check for confirmed bookings only
        $result = $this->db->fetchQuery($query, "ii", $bookingId, $userId);
        if (empty($result)) {
            return ["success" => false, "message" => "Booking not found or not confirmed"];
        }
        return ["success" => true];
    }

    // Generic validation for integer fields greater than or equal to a minimum value
    public function validateMinValue($value, $fieldName, $minValue) {
        if (!isset($value) || !is_numeric($value) || $value < $minValue) {
            return ["success" => false, "message" => "$fieldName must be greater than or equal to $minValue"];
        }
        return ["success" => true];
    }

    // Validate rating is between 1 and 5
    public function validateRating($rating) {
        if (!is_numeric($rating) || $rating < 1 || $rating > 5) {
            return ["success" => false, "message" => "Rating must be between 1 and 5"];
        }
        return ["success" => true];
    }

    // Validate if review exists and belongs to user
    public function validateReviewExists($reviewId, $userId) {
        $query = "SELECT id FROM reviews WHERE id = ? AND userId = ?"; // Query to check existing reviews
        $result = $this->db->fetchQuery($query, "ii", $reviewId, $userId);
        if (empty($result)) {
            return ["success" => false, "message" => "Review not found or you do not have permission to edit it"];
        }
        return ["success" => true];
    }

    // Validate if review does not already exist for a booking
    public function validateReviewNotExists($bookingId, $userId) {
        $query = "SELECT id FROM reviews WHERE bookingId = ? AND userId = ?"; // Query to check existing reviews
        $result = $this->db->fetchQuery($query, "ii", $bookingId, $userId);
        if (!empty($result)) {
            return ["success" => false, "message" => "Review already exists for this booking"];
        }
        return ["success" => true];
    }

    // Validate if review exists
    public function validateReviewId($reviewId) {
        $query = "SELECT id FROM reviews WHERE id = ?"; // Query to check existing reviews
        $result = $this->db->fetchQuery($query, "i", $reviewId);
        if (empty($result)) {
            return ["success" => false, "message" => "Review not found"];
        }
        return ["success" => true];
    }

    // Validate if user is not an admin
    // public function validateAdminRole($userId) {
    //     $query = "SELECT role FROM users WHERE id = ?"; // Query to check user role
    //     $result = $this->db->fetchQuery($query, "i", $userId);
    //     if (!empty($result) && $result[0]['role'] === 'admin') {
    //         return ["success" => false, "message" => "Admins are not allowed to comment on reviews"];
    //     }
    //     return ["success" => true];
    // }

    // Validate if parent comment exists
    public function validateParentComment($parentId, $reviewId) {
        if ($parentId === null) {
            return ["success" => true];
        }
        $query = "SELECT id FROM comments WHERE id = ? AND review_id = ?"; // Query to check existing comments
        $result = $this->db->fetchQuery($query, "ii", $parentId, $reviewId);
        if (empty($result)) {
            return ["success" => false, "message" => "Parent comment not found"];
        }
        return ["success" => true];
    }
}
?>
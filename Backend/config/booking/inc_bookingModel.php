<?php
// backend/booking/inc_bookingModel.php

/*******
 * PHP Booking Model Class for WanderlustTrails Database
 *******/

require_once __DIR__ . "/../inc_databaseClass.php";

class BookingModel {
    private $db;

    public function __construct() {
        $this->db = new DatabaseClass();
    }

    public function createBooking($data) {
        // Basic validation
        $requiredFields = ['user_id', 'booking_type', 'start_date', 'end_date', 'persons', 'total_price'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return ["success" => false, "message" => "Missing required field: $field"];
            }
        }

        if (!in_array($data['booking_type'], ['package', 'flight_hotel'])) {
            return ["success" => false, "message" => "Invalid booking type"];
        }
        if ($data['persons'] < 1) {
            return ["success" => false, "message" => "Persons must be at least 1"];
        }

        $query = "INSERT INTO bookings (user_id, booking_type, package_id, flight_details, hotel_details, start_date, end_date, persons, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $types = "isissssdi";
        $params = [
            $data['user_id'],
            $data['booking_type'],
            $data['package_id'] ?? null,
            isset($data['flight_details']) ? json_encode($data['flight_details']) : null,
            isset($data['hotel_details']) ? json_encode($data['hotel_details']) : null,
            $data['start_date'],
            $data['end_date'],
            $data['persons'],
            $data['total_price']
        ];

        $result = $this->db->executeQuery($query, $types, ...$params);
        file_put_contents(__DIR__ . "/../logs/debug.log", "BookingModel::createBooking Result: " . print_r($result, true) . "\n", FILE_APPEND);
        return $result;
    }

    public function getUserBookings($userId) {
        if (empty($userId)) {
            return ["success" => false, "message" => "User ID is required"];
        }

        $query = "SELECT id, booking_type, package_id, flight_details, hotel_details, start_date, end_date, persons, total_price, status, created_at FROM bookings WHERE user_id = ?";
        $types = "i";
        $bookings = $this->db->fetchQuery($query, $types, $userId);

        foreach ($bookings as &$booking) {
            if ($booking['flight_details']) {
                $booking['flight_details'] = json_decode($booking['flight_details'], true);
            }
            if ($booking['hotel_details']) {
                $booking['hotel_details'] = json_decode($booking['hotel_details'], true);
            }
        }

        file_put_contents(__DIR__ . "/../logs/debug.log", "BookingModel::getUserBookings: " . print_r($bookings, true) . "\n", FILE_APPEND);
        return ["success" => true, "data" => $bookings];
    }


    public function getAllBookings() {
        $query = "SELECT b.id, b.user_id, u.firstName, u.lastName, b.booking_type, b.package_id, b.flight_details, b.hotel_details, b.start_date, b.end_date, b.persons, b.total_price, b.status, b.created_at 
                  FROM bookings b 
                  JOIN users u ON b.user_id = u.id";
        $bookings = $this->db->fetchQuery($query, ""); // No params needed

        foreach ($bookings as &$booking) {
            if ($booking['flight_details']) {
                $booking['flight_details'] = json_decode($booking['flight_details'], true);
            }
            if ($booking['hotel_details']) {
                $booking['hotel_details'] = json_decode($booking['hotel_details'], true);
            }
        }

        file_put_contents(__DIR__ . "/../logs/debug.log", "BookingModel::getAllBookings: " . print_r($bookings, true) . "\n", FILE_APPEND);
        return ["success" => true, "data" => $bookings];
    }
    
    // public function approveBooking($bookingId) {
    //     $query = "UPDATE bookings SET status = 'confirmed' WHERE id = ? AND status = 'pending'";
    //     $types = "i";
    //     $result = $this->db->executeQuery($query, $types, $bookingId);

    //     file_put_contents(__DIR__ . "/../logs/debug.log", "BookingModel::approveBooking Result for booking_id $bookingId: " . print_r($result, true) . "\n", FILE_APPEND);

    //     if ($result['success'] && $result['affected_rows'] > 0) {
    //         return ["success" => true, "message" => "Booking approved successfully"];
    //     } else {
    //         return ["success" => false, "message" => "Booking not found or already approved"];
    //     }
    // }

    public function updateBookingStatus($bookingId, $status) {
        $query = "UPDATE bookings SET status = ? WHERE id = ?";
        $types = "si"; // String for status, Integer for id
        $result = $this->db->executeQuery($query, $types, $status, $bookingId);

        file_put_contents(__DIR__ . "/../logs/debug.log", "BookingModel::updateBookingStatus Result for booking_id $bookingId to $status: " . print_r($result, true) . "\n", FILE_APPEND);

        if (isset($result['success']) && $result['success'] && $result['affected_rows'] > 0) {
            return ["success" => true, "message" => "Booking status updated successfully"];
        } else {
            return ["success" => false, "message" => "Booking not found or status unchanged"];
        }
    }
}
?>
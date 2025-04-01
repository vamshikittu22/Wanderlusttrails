<?php
require_once __DIR__ . "/../inc_databaseClass.php";

class BookingModel {
    private $db;

    public function __construct() {
        $this->db = new DatabaseClass();
    }

    // private function calculateNights($start_date, $end_date) {
    //     $start = new DateTime($start_date);
    //     $end = new DateTime($end_date);
    //     return $end->diff($start)->days;
    // }

    // private function calculatePrice($booking_type, $persons, $start_date, $end_date, $current_price = null, $package_id = null) {
    //     if ($booking_type === 'flight_hotel') {
    //         $nights = $this->calculateNights($start_date, $end_date);
    //         $base_per_night = 100;
    //         $flight_cost = 50;
    //         $hotel_per_night = 30;
    //         return ($persons * $nights * $base_per_night) + ($persons * $flight_cost) + ($persons * $nights * $hotel_per_night);
    //     } elseif ($booking_type === 'package') {
    //         $base_price_per_person = 150; // Placeholder; adjust to your actual package price
    //         return $persons * $base_price_per_person;
    //     }
    //     return $current_price;
    // }

    private function calculateNights($start_date, $end_date) {
        $start = new DateTime($start_date);
        $end = new DateTime($end_date);
        return $end->diff($start)->days;
    }

    private function calculatePrice($booking_type, $persons, $start_date, $end_date, $package_id = null) {
        if ($booking_type === 'flight_hotel') {
            $nights = $this->calculateNights($start_date, $end_date);
            $base_per_night = 100;
            $flight_cost = 50;
            $hotel_per_night = 30;
            return ($persons * $nights * $base_per_night) + ($persons * $flight_cost) + ($persons * $nights * $hotel_per_night);
        } elseif ($booking_type === 'package') {
            if (!$package_id) {
                return 0; // Fallback if no package_id
            }
            $query = "SELECT price FROM packages WHERE id = ?";
            $result = $this->db->fetchQuery($query, "i", $package_id);
            $base_price_per_person = $result[0]['price'] ?? 0; // Price per person from packages table
            // $nights = $this->calculateNights($start_date, $end_date);
            return $persons * $base_price_per_person ; // Adjust as per your pricing logic
        }
        return 0; // Default to 0 if booking type is not recognized
    }

    public function createBooking($data) {
        $requiredFields = ['user_id', 'booking_type', 'start_date', 'end_date', 'persons', 'total_price'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return ["success" => false, "message" => "Missing required field: $field"];
            }
        }

        if ($data['booking_type'] === 'package' && (!isset($data['package_id']) || empty($data['package_id']))) {
            return ["success" => false, "message" => "Missing required field: package_id for package booking"];
        }
        if ($data['booking_type'] === 'flight_hotel' && (!isset($data['flight_details']) || !isset($data['hotel_details']))) {
            return ["success" => false, "message" => "Missing required field: flight_details or hotel_details for flight_hotel booking"];
        }
        if (!is_numeric($data['user_id']) || !is_numeric($data['persons']) || !is_numeric($data['total_price'])) {
            return ["success" => false, "message" => "user_id, persons, and total_price must be numeric"];
        }
        if (!DateTime::createFromFormat('Y-m-d', $data['start_date']) || !DateTime::createFromFormat('Y-m-d', $data['end_date'])) {
            return ["success" => false, "message" => "Invalid date format. Use YYYY-MM-DD"];
        }
        if (new DateTime($data['start_date']) >= new DateTime($data['end_date'])) {
            return ["success" => false, "message" => "Start date must be before end date"];
        }
        if ($data['total_price'] <= 0) {
            return ["success" => false, "message" => "Total price must be greater than 0"];
        }
        if (!in_array($data['booking_type'], ['package', 'flight_hotel'])) {
            return ["success" => false, "message" => "Invalid booking type"];
        }
        if ($data['persons'] < 1) {
            return ["success" => false, "message" => "Persons must be at least 1"];
        }


        // Fixed: Removed ? for status, hardcoded 'pending'
        $query = "INSERT INTO bookings (user_id, booking_type, package_id, flight_details, hotel_details, start_date, end_date, persons, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
        $types = "isissssdi"; // 9 types for 9 params
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

        $query = "SELECT id, booking_type, package_id, flight_details, hotel_details, start_date, end_date, persons, total_price, status, created_at, pending_changes FROM bookings WHERE user_id = ?";
        $types = "i";
        $bookings = $this->db->fetchQuery($query, $types, $userId);

        foreach ($bookings as &$booking) {
            if ($booking['flight_details']) {
                $booking['flight_details'] = json_decode($booking['flight_details'], true);
            }
            if ($booking['hotel_details']) {
                $booking['hotel_details'] = json_decode($booking['hotel_details'], true);
            }
            if ($booking['pending_changes']) {
                $booking['pending_changes'] = json_decode($booking['pending_changes'], true);
            }
        }

        file_put_contents(__DIR__ . "/../logs/debug.log", "BookingModel::getUserBookings: " . print_r($bookings, true) . "\n", FILE_APPEND);
        return ["success" => true, "data" => $bookings];
    }

    public function getAllBookings() {
        $query = "SELECT b.id, b.user_id, u.firstName, u.lastName, b.booking_type, b.package_id, b.flight_details, b.hotel_details, b.start_date, b.end_date, b.persons, b.total_price, b.status, b.created_at, b.pending_changes 
                  FROM bookings b 
                  JOIN users u ON b.user_id = u.id";
        $bookings = $this->db->fetchQuery($query, "");

        foreach ($bookings as &$booking) {
            if ($booking['flight_details']) {
                $booking['flight_details'] = json_decode($booking['flight_details'], true);
            }
            if ($booking['hotel_details']) {
                $booking['hotel_details'] = json_decode($booking['hotel_details'], true);
            }
            if ($booking['pending_changes']) {
                $booking['pending_changes'] = json_decode($booking['pending_changes'], true);
            }
        }

        file_put_contents(__DIR__ . "/../logs/debug.log", "BookingModel::getAllBookings: " . print_r($bookings, true) . "\n", FILE_APPEND);
        return ["success" => true, "data" => $bookings];
    }

    public function editBooking($bookingId, $userId, $changes) {
        $query = "UPDATE bookings SET pending_changes = ?, status = 'pending' 
                  WHERE id = ? AND user_id = ? AND status != 'canceled'";
        $types = "sii";
        $changesJson = json_encode($changes);
        $result = $this->db->executeQuery($query, $types, $changesJson, $bookingId, $userId);
        file_put_contents(__DIR__ . "/../logs/debug.log", "BookingModel::editBooking Result for booking_id $bookingId: " . print_r($result, true) . "\n", FILE_APPEND);
        return $result['success'] && $result['affected_rows'] > 0 
            ? ["success" => true, "message" => "Edit request submitted and awaiting admin confirmation"]
            : ["success" => false, "message" => "Booking not found or cannot be edited"];
    }

    public function cancelBooking($bookingId, $userId) {
        $query = "UPDATE bookings SET status = 'canceled' WHERE id = ? AND user_id = ? AND status != 'canceled'";
        $types = "ii";
        $result = $this->db->executeQuery($query, $types, $bookingId, $userId);
        file_put_contents(__DIR__ . "/../logs/debug.log", "BookingModel::cancelBooking Result for booking_id $bookingId: " . print_r($result, true) . "\n", FILE_APPEND);
        return $result['success'] && $result['affected_rows'] > 0 
            ? ["success" => true, "message" => "Booking canceled successfully"] 
            : ["success" => false, "message" => "Booking not found or already canceled"];
    }

    public function updateBookingStatus($bookingId, $status) {
        if ($status === 'confirmed') {
            $query = "SELECT booking_type, persons, start_date, end_date, total_price, pending_changes, flight_details, hotel_details, package_id FROM bookings WHERE id = ?";
            $types = "i";
            $result = $this->db->fetchQuery($query, $types, $bookingId);
            if (!empty($result) && !empty($result[0]['pending_changes'])) {
                $booking = $result[0];
                $pendingChanges = json_decode($booking['pending_changes'], true);
                $currentFlightDetails = $booking['flight_details'] ? json_decode($booking['flight_details'], true) : [];
                $currentHotelDetails = $booking['hotel_details'] ? json_decode($booking['hotel_details'], true) : [];

                $newPersons = $pendingChanges['persons'] ?? $booking['persons'];
                $newStartDate = $pendingChanges['start_date'] ?? $booking['start_date'];
                $newEndDate = $pendingChanges['end_date'] ?? $booking['end_date'];
                if (isset($pendingChanges['from'])) $currentFlightDetails['from'] = $pendingChanges['from'];
                if (isset($pendingChanges['to'])) $currentFlightDetails['to'] = $pendingChanges['to'];
                if (isset($pendingChanges['hotel'])) $currentHotelDetails['hotel'] = $pendingChanges['hotel'];

                $newPrice = $this->calculatePrice(
                    $booking['booking_type'],
                    $newPersons,
                    $newStartDate,
                    $newEndDate,
                    $booking['total_price'],
                    $booking['package_id']
                );

                $updateFields = [];
                $types = "";
                $params = [];
                if (isset($pendingChanges['start_date'])) {
                    $updateFields[] = "start_date = ?";
                    $types .= "s";
                    $params[] = $pendingChanges['start_date'];
                }
                if (isset($pendingChanges['end_date'])) {
                    $updateFields[] = "end_date = ?";
                    $types .= "s";
                    $params[] = $pendingChanges['end_date'];
                }
                if (isset($pendingChanges['persons'])) {
                    $updateFields[] = "persons = ?";
                    $types .= "i";
                    $params[] = $pendingChanges['persons'];
                }
                $updateFields[] = "flight_details = ?";
                $types .= "s";
                $params[] = json_encode($currentFlightDetails);
                $updateFields[] = "hotel_details = ?";
                $types .= "s";
                $params[] = json_encode($currentHotelDetails);
                $updateFields[] = "total_price = ?";
                $types .= "d";
                $params[] = $newPrice;
                $updateFields[] = "status = ?";
                $types .= "s";
                $params[] = $status;
                $updateFields[] = "pending_changes = NULL";

                $query = "UPDATE bookings SET " . implode(", ", $updateFields) . " WHERE id = ?";
                $types .= "i";
                $params[] = $bookingId;

                $result = $this->db->executeQuery($query, $types, ...$params);
            } else {
                $query = "UPDATE bookings SET status = ? WHERE id = ?";
                $types = "si";
                $result = $this->db->executeQuery($query, $types, $status, $bookingId);
            }
        } else {
            $query = "UPDATE bookings SET status = ? WHERE id = ?";
            $types = "si";
            $result = $this->db->executeQuery($query, $types, $status, $bookingId);
        }

        file_put_contents(__DIR__ . "/../logs/debug.log", "BookingModel::updateBookingStatus Result for booking_id $bookingId to $status: " . print_r($result, true) . "\n", FILE_APPEND);

        if (isset($result['success']) && $result['success'] && $result['affected_rows'] > 0) {
            return ["success" => true, "message" => "Booking status updated successfully"];
        } else {
            return ["success" => false, "message" => "Booking not found or status unchanged"];
        }
    }
}
?>
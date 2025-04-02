<?php
require_once __DIR__ . "/../inc_databaseClass.php";

class BookingModel {
    private $db;

    public function __construct() {
        $this->db = new DatabaseClass();
    }

    private function calculateNights($start_date, $end_date) {
        $start = new DateTime($start_date);
        $end = new DateTime($end_date);
        $nights = $end->diff($start)->days + 1; // Include start and end day
        return max(1, $nights); // Minimum 1 day
    }

    private function getPackageDetails($package_id) {
        if (!$package_id) {
            file_put_contents(__DIR__ . "/../logs/debug.log", "getPackageDetails: No package_id provided\n", FILE_APPEND);
            return ['price' => 0, 'name' => null];
        }
        $query = "SELECT price, name FROM packages WHERE id = ?";
        $result = $this->db->fetchQuery($query, "i", $package_id);
        if (empty($result) || !isset($result[0])) {
            file_put_contents(__DIR__ . "/../logs/debug.log", "getPackageDetails: No package found for package_id $package_id\n", FILE_APPEND);
            return ['price' => 0, 'name' => null];
        }
        $price = floatval($result[0]['price'] ?? 0);
        file_put_contents(__DIR__ . "/../logs/debug.log", "getPackageDetails: package_id=$package_id, price=$price, name=" . ($result[0]['name'] ?? 'null') . "\n", FILE_APPEND);
        return [
            'price' => $price,
            'name' => $result[0]['name'] ?? null
        ];
    }

    private function calculatePrice($booking_type, $persons, $start_date, $end_date, $package_id = null) {
        $nights = $this->calculateNights($start_date, $end_date);
        if ($booking_type === 'flight_hotel') {
            $base_per_night = 100;
            $flight_cost = 50;
            $hotel_per_night = 30;
            return ($persons * $nights * $base_per_night) + ($persons * $flight_cost) + ($persons * $nights * $hotel_per_night);
        } elseif ($booking_type === 'package') {
            if (!$package_id) {
                file_put_contents(__DIR__ . "/../logs/debug.log", "calculatePrice: No package_id for package booking\n", FILE_APPEND);
                return 0;
            }
            $package = $this->getPackageDetails($package_id);
            if ($package['price'] <= 0) {
                file_put_contents(__DIR__ . "/../logs/debug.log", "calculatePrice: Invalid price for package_id $package_id\n", FILE_APPEND);
                return 0;
            }
            return $package['price'] * $persons * $nights; // Price per person per day
        }
        return 0;
    }

    // Create a new booking
    // Removed total_price from required fields, as it will be calculated in the backend
    // Added validation for booking_type, persons, start_date, end_date, and package_id (if applicable)
    // Added validation for flight_details and hotel_details for flight_hotel booking type
    // Added validation for numeric user_id and persons
    // Added validation for date format (YYYY-MM-DD) and date range (start_date < end_date)
    // Added validation for booking_type (must be either 'package' or 'flight_hotel')
    // Added validation for persons (must be at least 1)
    
    public function createBooking($data) {
        $requiredFields = ['user_id', 'booking_type', 'start_date', 'end_date', 'persons']; // Removed total_price
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
        if (!is_numeric($data['user_id']) || !is_numeric($data['persons'])) {
            return ["success" => false, "message" => "user_id and persons must be numeric"];
        }
        if (!DateTime::createFromFormat('Y-m-d', $data['start_date']) || !DateTime::createFromFormat('Y-m-d', $data['end_date'])) {
            return ["success" => false, "message" => "Invalid date format. Use YYYY-MM-DD"];
        }
        if (new DateTime($data['start_date']) >= new DateTime($data['end_date'])) {
            return ["success" => false, "message" => "Start date must be before end date"];
        }
        if (!in_array($data['booking_type'], ['package', 'flight_hotel'])) {
            return ["success" => false, "message" => "Invalid booking type"];
        }
        if ($data['persons'] < 1) {
            return ["success" => false, "message" => "Persons must be at least 1"];
        }


      // Calculate total_price and fetch package_name
      $package_name = null;
      if ($data['booking_type'] === 'package') {
          $package = $this->getPackageDetails($data['package_id']);
          $total_price = $package['price'] * $data['persons'] * $this->calculateNights($data['start_date'], $data['end_date']);
          $package_name = $package['name'];
          if ($total_price <= 0) {
              return ["success" => false, "message" => "Invalid total price calculated for package"];
          }
      } else {
          $total_price = $this->calculatePrice(
              $data['booking_type'],
              $data['persons'],
              $data['start_date'],
              $data['end_date']
          );
          if ($total_price <= 0) {
              return ["success" => false, "message" => "Invalid total price calculated for flight_hotel"];
          }
      }
        file_put_contents(__DIR__ . "/../logs/debug.log", "createBooking: Calculated total_price=$total_price for booking_type={$data['booking_type']}, persons={$data['persons']}, package_id=" . ($data['package_id'] ?? 'null') . "\n", FILE_APPEND);

        if ($total_price <= 0) {
            return ["success" => false, "message" => "Invalid total price calculated"];
        }

        $query = "INSERT INTO bookings (user_id, booking_type, package_id, package_name, flight_details, hotel_details, start_date, end_date, persons, total_price, status) VALUES (?, ?, ?,?, ?, ?, ?, ?, ?, ?, 'pending')";
        $types = "isisssssdi"; // 9 types for 9 params
        $params = [
            $data['user_id'],
            $data['booking_type'],
            isset($data['package_id']) ? $data['package_id'] : null,
            $package_name,
            isset($data['flight_details']) ? json_encode($data['flight_details']) : null,
            isset($data['hotel_details']) ? json_encode($data['hotel_details']) : null,
            $data['start_date'],
            $data['end_date'],
            $data['persons'],
            $total_price
        ];

        $result = $this->db->executeQuery($query, $types, ...$params);
        file_put_contents(__DIR__ . "/../logs/debug.log", "BookingModel::createBooking Result: " . print_r($result, true) . "\n", FILE_APPEND);
        return $result;
    }

    // Update booking status to confirmed or canceled
    // If confirmed, apply any pending changes and recalculate the total price
    public function updateBookingStatus($bookingId, $status) {
        if ($status === 'confirmed') {
            $query = "SELECT booking_type, persons, start_date, end_date, total_price, pending_changes, flight_details, hotel_details, package_id, package_name FROM bookings WHERE id = ?";
            $types = "i";
            $result = $this->db->fetchQuery($query, $types, $bookingId);
            if (!empty($result)) {
                $booking = $result[0];
                $pendingChanges = $booking['pending_changes'] ? json_decode($booking['pending_changes'], true) : [];
    
                $newPersons = $pendingChanges['persons'] ?? $booking['persons'];
                $newStartDate = $pendingChanges['start_date'] ?? $booking['start_date'];
                $newEndDate = $pendingChanges['end_date'] ?? $booking['end_date'];
                $newFlightDetails = $booking['flight_details'] ? json_decode($booking['flight_details'], true) : [];
                $newHotelDetails = $booking['hotel_details'] ? json_decode($booking['hotel_details'], true) : [];
                $newPackageId = $pendingChanges['package_id'] ?? $booking['package_id'];
                $newPackageName = $pendingChanges['package_name'] ?? $booking['package_name'];
    
                if (isset($pendingChanges['from'])) $newFlightDetails['from'] = $pendingChanges['from'];
                if (isset($pendingChanges['to'])) $newFlightDetails['to'] = $pendingChanges['to'];
                if (isset($pendingChanges['hotel'])) $newHotelDetails['hotel'] = $pendingChanges['hotel'];
    
                $newPrice = $this->calculatePrice(
                    $booking['booking_type'],
                    $newPersons,
                    $newStartDate,
                    $newEndDate,
                    $newPackageId
                );
    
                if ($newPrice <= 0) {
                    file_put_contents(__DIR__ . "/../logs/debug.log", "updateBookingStatus: Invalid total price calculated for booking_id $bookingId\n", FILE_APPEND);
                    return ["success" => false, "message" => "Invalid total price calculated for updated booking"];
                }
    
                $updateFields = [];
                $types = "";
                $params = [];
                if (isset($pendingChanges['start_date'])) {
                    $updateFields[] = "start_date = ?";
                    $types .= "s";
                    $params[] = $newStartDate;
                }
                if (isset($pendingChanges['end_date'])) {
                    $updateFields[] = "end_date = ?";
                    $types .= "s";
                    $params[] = $newEndDate;
                }
                if (isset($pendingChanges['persons'])) {
                    $updateFields[] = "persons = ?";
                    $types .= "i";
                    $params[] = $newPersons;
                }
                if (isset($pendingChanges['package_id'])) {
                    $updateFields[] = "package_id = ?";
                    $types .= "i";
                    $params[] = $newPackageId;
                    $updateFields[] = "package_name = ?";
                    $types .= "s";
                    $params[] = $newPackageName;
                }

                $updateFields[] = "flight_details = ?";
                $types .= "s";
                $params[] = json_encode($newFlightDetails);
                $updateFields[] = "hotel_details = ?";
                $types .= "s";
                $params[] = json_encode($newHotelDetails);
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

    // Get all bookings for a user
    public function getUserBookings($userId) {
        if (empty($userId)) {
            return ["success" => false, "message" => "User ID is required"];
        }

        $query = "SELECT id, booking_type, package_id, package_name, flight_details, hotel_details, start_date, end_date, persons, total_price, status, created_at, pending_changes FROM bookings WHERE user_id = ?";
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

    // Get all bookings for admin view
    public function getAllBookings() {
        $query = "SELECT b.id, b.user_id, u.firstName, u.lastName, b.booking_type, b.package_id, b.package_name, b.flight_details, b.hotel_details, b.start_date, b.end_date, b.persons, b.total_price, b.status, b.created_at, b.pending_changes 
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

    // Get booking details by booking ID
    public function editBooking($bookingId, $userId, $changes) {

        // Validate package_id if provided
        if (isset($changes['package_id'])) {
            $package = $this->getPackageDetails($changes['package_id']);
            if ($package['price'] <= 0) {
                return ["success" => false, "message" => "Invalid package_id provided"];
            }
            // Include package_name in pending changes
            $changes['package_name'] = $package['name'];
        }

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

    // Cancel booking
    public function cancelBooking($bookingId, $userId) {
        $query = "UPDATE bookings SET status = 'canceled' WHERE id = ? AND user_id = ? AND status != 'canceled'";
        $types = "ii";
        $result = $this->db->executeQuery($query, $types, $bookingId, $userId);
        file_put_contents(__DIR__ . "/../logs/debug.log", "BookingModel::cancelBooking Result for booking_id $bookingId: " . print_r($result, true) . "\n", FILE_APPEND);
        return $result['success'] && $result['affected_rows'] > 0 
            ? ["success" => true, "message" => "Booking canceled successfully"] 
            : ["success" => false, "message" => "Booking not found or already canceled"];
    }
}
?>
<?php
require_once __DIR__ . "/../inc_databaseClass.php";
require_once __DIR__ . "/../inc_logger.php";
require_once __DIR__ . "/../inc_validationClass.php";

class BookingModel {
    private $db;
    private $input;
    private $validator;

    public function __construct() {
        $this->db = new DatabaseClass();
        $this->validator = new ValidationClass();
        $this->input = [];
    }

    public function setInput($input) {
        $this->input = $input;
    }

    private function calculateNights($start_date, $end_date) {
        $start = new DateTime($start_date);
        $end = new DateTime($end_date);
        $nights = $end->diff($start)->days + 1; // Include start and end day
        return max(1, $nights); // Minimum 1 day
    }

    private function calculatePrice($booking_type, $persons, $start_date, $end_date, $package_id = null, $itinerary_details = null) {
        $nights = $this->calculateNights($start_date, $end_date);
        if ($booking_type === 'flight_hotel') {
            $base_per_night = 100;
            $flight_cost = 50;
            $hotel_per_night = 30;
            return ($persons * $nights * $base_per_night) + ($persons * $flight_cost) + ($persons * $nights * $hotel_per_night);
        } elseif ($booking_type === 'package') {
            if (!$package_id) {
                Logger::log("calculatePrice: No package_id for package booking");
                return 0;
            }
            $packageResult = $this->validator->validatePackage($package_id);
            if (!$packageResult['success']) {
                Logger::log("calculatePrice: " . $packageResult['message']);
                return 0;
            }
            $package = $packageResult['data'];
            return $package['price'] * $persons * $nights; // Price per person per day
        } elseif ($booking_type === 'itinerary') {
            if (!$package_id || !$itinerary_details) {
                Logger::log("calculatePrice: Missing package_id or itinerary_details for itinerary booking");
                return 0;
            }
            $packageResult = $this->validator->validatePackage($package_id);
            if (!$packageResult['success']) {
                Logger::log("calculatePrice: " . $packageResult['message']);
                return 0;
            }
            $package = $packageResult['data'];
            $activities = json_decode($itinerary_details, true);
            $activity_cost = 0;
            if (is_array($activities)) {
                foreach ($activities as $activity) {
                    if (isset($activity['price'])) {
                        $activity_cost += $activity['price'] * $persons;
                    }
                }
            }
            $package_cost = $package['price'] * $persons * $nights;
            return $package_cost + $activity_cost;
        }
        return 0;
    }

    public function createBooking($data) {
        Logger::log("createBooking started: " . json_encode($data));

        // Validate required fields
        $requiredFields = ['user_id', 'booking_type', 'start_date', 'persons'];
        $result = $this->validator->validateRequiredFields($data, $requiredFields);
        if (!$result['success']) return $result;

        // Validate user_id
        $result = $this->validator->validateUserExists($data['user_id']);
        if (!$result['success']) return $result;

        // Validate persons
        $result = $this->validator->validateNumeric($data['persons'], 'persons');
        if (!$result['success']) return $result;

        // Validate booking_type
        $result = $this->validator->validateBookingType($data['booking_type']);
        if (!$result['success']) return $result;

        // Validate date range
        $endDateProvided = isset($data['end_date']) && $data['end_date'] !== null;
        $result = $this->validator->validateDateRange($data['start_date'], $data['end_date'] ?? null, $data['booking_type']);
        if (!$result['success']) return $result;

        // Validate package_id and itinerary_details for itinerary bookings
        $isFlightHotel = $data['booking_type'] === 'flight_hotel';
        $isItinerary = $data['booking_type'] === 'itinerary';
        $package_name = null;
        $total_price = 0;

        if ($data['booking_type'] === 'package') {
            if (!isset($data['package_id'])) {
                Logger::log("Missing required field: package_id for package booking");
                return ["success" => false, "message" => "Missing required field: package_id for package booking"];
            }
            $result = $this->validator->validateNumeric($data['package_id'], 'package_id');
            if (!$result['success']) return $result;

            $result = $this->validator->validatePackage($data['package_id']);
            if (!$result['success']) return $result;

            $package = $result['data'];
            $total_price = $package['price'] * $data['persons'] * $this->calculateNights($data['start_date'], $data['end_date']);
            $package_name = $package['name'];
        } elseif ($isItinerary) {
            if (!isset($data['package_id']) || !isset($data['itinerary_details'])) {
                Logger::log("Missing required field: package_id or itinerary_details for itinerary booking");
                return ["success" => false, "message" => "Missing required field: package_id or itinerary_details for itinerary booking"];
            }
            $result = $this->validator->validateNumeric($data['package_id'], 'package_id');
            if (!$result['success']) return $result;

            $result = $this->validator->validatePackage($data['package_id']);
            if (!$result['success']) return $result;

            $package = $result['data'];
            $total_price = isset($data['total_price']) ? (float)$data['total_price'] : $this->calculatePrice(
                $data['booking_type'],
                $data['persons'],
                $data['start_date'],
                $endDateProvided ? $data['end_date'] : $data['start_date'],
                $data['package_id'],
                $data['itinerary_details']
            );
            $package_name = $package['name'];
        } else {
            $total_price = isset($data['total_price']) ? (float)$data['total_price'] : $this->calculatePrice(
                $data['booking_type'],
                $data['persons'],
                $data['start_date'],
                $endDateProvided ? $data['end_date'] : $data['start_date']
            );
            if ($total_price <= 0) {
                Logger::log("Invalid total price calculated for flight_hotel");
                return ["success" => false, "message" => "Invalid total price calculated for flight_hotel"];
            }
        }

        // Validate flight_hotel details
        if ($isFlightHotel && (!isset($data['flight_details']) || !isset($data['hotel_details']))) {
            Logger::log("Missing required field: flight_details or hotel_details for flight_hotel booking");
            return ["success" => false, "message" => "Missing required field: flight_details or hotel_details for flight_hotel booking"];
        }

        if ($total_price <= 0) {
            Logger::log("Invalid total price calculated");
            return ["success" => false, "message" => "Invalid total price calculated"];
        }

        $query = "INSERT INTO bookings (user_id, booking_type, package_id, package_name, flight_details, hotel_details, itinerary_details, start_date, end_date, persons, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $types = "isissssssdis";
        $params = [
            $data['user_id'],
            $data['booking_type'],
            isset($data['package_id']) ? $data['package_id'] : null,
            $package_name,
            isset($data['flight_details']) ? json_encode($data['flight_details']) : null,
            isset($data['hotel_details']) ? json_encode($data['hotel_details']) : null,
            isset($data['itinerary_details']) ? $data['itinerary_details'] : null,
            $data['start_date'],
            $endDateProvided ? $data['end_date'] : null,
            $data['persons'],
            $total_price,
            'pending'
        ];

        $result = $this->db->executeQuery($query, $types, ...$params);
        Logger::log("BookingModel::createBooking Result: " . json_encode($result));

        if ($result['success'] && $result['affected_rows'] > 0) {
            Logger::log("Booking created successfully for user_id: {$data['user_id']}");
            return [
                "success" => true,
                "message" => "Booking created successfully",
                "booking_id" => $result['insert_id']
            ];
        } else {
            Logger::log("Failed to create booking for user_id: {$data['user_id']}");
            return ["success" => false, "message" => "Failed to create booking"];
        }
    }

    public function updateBookingStatus($bookingId, $status) {
        $status = (string)$status;
        Logger::log("updateBookingStatus started for booking_id: $bookingId, status: '$status' (type: " . gettype($status) . "), raw input: " . json_encode($this->input));

        $result = $this->validator->validateNumeric($bookingId, 'booking_id');
        if (!$result['success']) return $result;

        if (!isset($this->input['user_id'])) {
            Logger::log("Missing user_id in input for booking_id: $bookingId");
            return ["success" => false, "message" => "Missing user_id in input"];
        }
        $userId = (int)$this->input['user_id'];
        $result = $this->validator->validateUserExists($userId);
        if (!$result['success']) return $result;

        $result = $this->validator->validateStatus($status);
        if (!$result['success']) return $result;

        $this->db->beginTransaction();

        try {
            $checkQuery = "SELECT status FROM bookings WHERE id = ? FOR UPDATE";
            $checkResult = $this->db->fetchQuery($checkQuery, "i", $bookingId);
            Logger::log("Current status check for booking_id $bookingId: " . json_encode($checkResult));
            if (empty($checkResult) || !isset($checkResult[0])) {
                Logger::log("Booking not found for booking_id: $bookingId");
                $this->db->rollback();
                return ["success" => false, "message" => "Booking not found"];
            }
            $currentStatus = $checkResult[0]['status'];
            if ($currentStatus === $status) {
                Logger::log("Status unchanged for booking_id: $bookingId, already $status");
                $this->db->commit();
                return ["success" => true, "message" => "Status unchanged"];
            }

            Logger::log("Checking if status is 'confirmed': strtolower($status) = " . strtolower($status));
            
            if (strtolower($status) === 'confirmed') {
                Logger::log("Confirmed status detected, proceeding with pending changes for booking_id: $bookingId");
                $query = "SELECT booking_type, persons, start_date, end_date, total_price, pending_changes, flight_details, hotel_details, itinerary_details, package_id, package_name FROM bookings WHERE id = ? FOR UPDATE";
                $types = "i";
                $result = $this->db->fetchQuery($query, $types, $bookingId);
                Logger::log("Database query result for booking_id $bookingId: " . json_encode($result));
                if (empty($result) || !isset($result[0])) {
                    Logger::log("Booking not found or query failed for booking_id: $bookingId");
                    $this->db->rollback();
                    return ["success" => false, "message" => "Booking not found or query failed"];
                }
                $booking = $result[0];
                $dbPendingChanges = $booking['pending_changes'] ? json_decode($booking['pending_changes'], true) : [];
                $inputPendingChanges = isset($this->input['pending_changes']) ? $this->input['pending_changes'] : [];

                Logger::log("DB pending_changes: " . json_encode($dbPendingChanges));
                Logger::log("Input pending_changes: " . json_encode($inputPendingChanges));

                if (!empty($inputPendingChanges) || !empty($dbPendingChanges)) {
                    Logger::log("Processing pending changes for booking_id: $bookingId");
                    $mergedPendingChanges = array_merge($dbPendingChanges, $inputPendingChanges);

                    $newPersons = isset($mergedPendingChanges['persons']) ? $mergedPendingChanges['persons'] : $booking['persons'];
                    $newStartDate = isset($mergedPendingChanges['start_date']) ? $mergedPendingChanges['start_date'] : $booking['start_date'];
                    $newEndDate = isset($mergedPendingChanges['end_date']) ? $mergedPendingChanges['end_date'] : $booking['end_date'];
                    $newFlightDetails = $booking['flight_details'] ? json_decode($booking['flight_details'], true) : [];
                    $newHotelDetails = $booking['hotel_details'] ? json_decode($booking['hotel_details'], true) : [];
                    $newItineraryDetails = $booking['itinerary_details'] ? json_decode($booking['itinerary_details'], true) : [];
                    $newPackageId = isset($mergedPendingChanges['package_id']) ? $mergedPendingChanges['package_id'] : $booking['package_id'];
                    $newPackageName = isset($mergedPendingChanges['package_name']) ? $mergedPendingChanges['package_name'] : $booking['package_name'];

                    // Handle itinerary_details if present in pending changes
                    if (isset($mergedPendingChanges['itinerary_details'])) {
                        $newItineraryDetails = $mergedPendingChanges['itinerary_details'];
                        Logger::log("Updated itinerary_details from pending changes: " . json_encode($newItineraryDetails));
                    }

                    foreach ($mergedPendingChanges as $key => $value) {
                        if (strpos($key, 'flight_details.') === 0) {
                            $flightKey = substr($key, 14);
                            if (strpos($flightKey, '.') === 0) $flightKey = substr($flightKey, 1);
                            $newFlightDetails[$flightKey] = $value;
                            Logger::log("Updated flight_details: $flightKey = " . json_encode($value));
                        } elseif (strpos($key, 'hotel_details.') === 0) {
                            $hotelKey = substr($key, 14);
                            if (strpos($hotelKey, '.') === 0) $hotelKey = substr($hotelKey, 1);
                            if (strpos($hotelKey, 'amenities.') === 0) {
                                $amenityKey = substr($hotelKey, 10);
                                $newHotelDetails['amenities'][$amenityKey] = $value;
                            } else {
                                $newHotelDetails[$hotelKey] = $value;
                            }
                            Logger::log("Updated hotel_details: $hotelKey = " . json_encode($value));
                        }
                    }

                    $newPrice = isset($mergedPendingChanges['totalPrice']) ? (float)$mergedPendingChanges['totalPrice'] : $this->calculatePrice(
                        $booking['booking_type'],
                        $newPersons,
                        $newStartDate,
                        $newEndDate ?: $newStartDate,
                        $newPackageId,
                        json_encode($newItineraryDetails)
                    );

                    if ($newPrice <= 0) {
                        Logger::log("Invalid total price calculated for booking_id $bookingId: $newPrice");
                        $this->db->rollback();
                        return ["success" => false, "message" => "Invalid total price calculated for updated booking"];
                    }

                    $updateFields = [];
                    $types = "";
                    $params = [];
                    if (isset($mergedPendingChanges['start_date'])) {
                        $updateFields[] = "start_date = ?";
                        $types .= "s";
                        $params[] = $newStartDate;
                    }
                    if (isset($mergedPendingChanges['end_date'])) {
                        $updateFields[] = "end_date = ?";
                        $types .= "s";
                        $params[] = $newEndDate;
                    }
                    if (isset($mergedPendingChanges['persons'])) {
                        $updateFields[] = "persons = ?";
                        $types .= "i";
                        $params[] = $newPersons;
                    }
                    if (isset($mergedPendingChanges['package_id'])) {
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
                    $updateFields[] = "itinerary_details = ?";
                    $types .= "s";
                    $params[] = json_encode($newItineraryDetails);
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

                    Logger::log("Executing pending changes update query: $query with params: " . json_encode($params));
                    $result = $this->db->executeQuery($query, $types, ...$params);
                    Logger::log("Pending changes update result for booking_id $bookingId: " . json_encode($result));

                    $verifyQuery = "SELECT status, start_date, end_date, total_price, pending_changes, itinerary_details FROM bookings WHERE id = ?";
                    $verifyResult = $this->db->fetchQuery($verifyQuery, "i", $bookingId);
                    Logger::log("Post-update verification for booking_id $bookingId: " . json_encode($verifyResult));
                } else {
                    $query = "UPDATE bookings SET status = ? WHERE id = ?";
                    $types = "si";
                    $params = [$status, $bookingId];
                    Logger::log("Executing simple status update query: $query with params: " . json_encode($params));
                    $result = $this->db->executeQuery($query, $types, ...$params);
                    Logger::log("Simple status update result for booking_id $bookingId: " . json_encode($result));
                }
            } else {
                $query = "UPDATE bookings SET status = ? WHERE id = ?";
                $types = "si";
                $params = [$status, $bookingId];
                Logger::log("Executing simple status update query: $query with params: " . json_encode($params));
                $result = $this->db->executeQuery($query, $types, ...$params);
                Logger::log("Simple status update result for booking_id $bookingId: " . json_encode($result));
            }

            Logger::log("BookingModel::updateBookingStatus Result for booking_id $bookingId to $status: " . json_encode($result));

            if (isset($result['success']) && $result['success']) {
                if ($result['affected_rows'] > 0) {
                    Logger::log("Booking status updated successfully for booking_id: $bookingId");
                    $this->db->commit();
                    return ["success" => true, "message" => "Booking status updated successfully"];
                } else {
                    Logger::log("No rows affected for booking_id: $bookingId - possible database error or booking not found");
                    $this->db->rollback();
                    return ["success" => false, "message" => "Failed to update booking status - no rows affected"];
                }
            } else {
                Logger::log("Failed to update booking status for booking_id: $bookingId");
                $this->db->rollback();
                return ["success" => false, "message" => "Failed to update booking status"];
            }
        } catch (Exception $e) {
            Logger::log("Exception in updateBookingStatus for booking_id $bookingId: " . $e->getMessage());
            $this->db->rollback();
            return ["success" => false, "message" => "Error updating booking status: " . $e->getMessage()];
        }
    }

    public function getUserBookings($userId) {
        Logger::log("getUserBookings started for user_id: $userId");

        $result = $this->validator->validateNumeric($userId, 'user_id');
        if (!$result['success']) return $result;

        $result = $this->validator->validateUserExists($userId);
        if (!$result['success']) return $result;

        $query = "SELECT id, booking_type, package_id, package_name, flight_details, hotel_details, itinerary_details, start_date, end_date, persons, total_price, status, created_at, pending_changes FROM bookings WHERE user_id = ?";
        $types = "i";
        $bookings = $this->db->fetchQuery($query, $types, $userId);

        foreach ($bookings as &$booking) {
            if ($booking['flight_details']) {
                $booking['flight_details'] = json_decode($booking['flight_details'], true);
            }
            if ($booking['hotel_details']) {
                $booking['hotel_details'] = json_decode($booking['hotel_details'], true);
            }
            if ($booking['itinerary_details']) {
                $booking['itinerary_details'] = json_decode($booking['itinerary_details'], true);
            }
            if ($booking['pending_changes']) {
                $booking['pending_changes'] = json_decode($booking['pending_changes'], true);
            }
        }

        Logger::log("BookingModel::getUserBookings: " . json_encode($bookings));
        return ["success" => true, "data" => $bookings];
    }

    public function getAllBookings() {
        Logger::log("getAllBookings started");

        $query = "SELECT b.id, b.user_id, u.firstName, u.lastName, u.role, b.booking_type, b.package_id, b.package_name, b.flight_details, b.hotel_details, b.itinerary_details, b.start_date, b.end_date, b.persons, b.total_price, b.status, b.created_at, b.pending_changes 
                  FROM bookings b 
                  JOIN users u ON b.user_id = u.id  
                  ORDER BY b.id ASC";
        $bookings = $this->db->fetchQuery($query, "");

        foreach ($bookings as &$booking) {
            if ($booking['flight_details']) {
                $booking['flight_details'] = json_decode($booking['flight_details'], true);
            }
            if ($booking['hotel_details']) {
                $booking['hotel_details'] = json_decode($booking['hotel_details'], true);
            }
            if ($booking['itinerary_details']) {
                $booking['itinerary_details'] = json_decode($booking['itinerary_details'], true);
            }
            if ($booking['pending_changes']) {
                $booking['pending_changes'] = json_decode($booking['pending_changes'], true);
            }
        }

        Logger::log("BookingModel::getAllBookings: " . json_encode($bookings));
        return ["success" => true, "data" => $bookings];
    }

    public function editBooking($bookingId, $userId, $changes) {
        Logger::log("editBooking started for booking_id: $bookingId, user_id: $userId");

        $result = $this->validator->validateNumeric($bookingId, 'booking_id');
        if (!$result['success']) return $result;

        $result = $this->validator->validateUserExists($userId);
        if (!$result['success']) return $result;

        $result = $this->validator->validateBookingExists($bookingId, $userId);
        if (!$result['success']) return $result;

        if (isset($changes['package_id'])) {
            $result = $this->validator->validatePackage($changes['package_id']);
            if (!$result['success']) return $result;
            $package = $result['data'];
            $changes['package_name'] = $package['name'];
        }

        $query = "UPDATE bookings SET pending_changes = ?, status = 'pending' 
                  WHERE id = ? AND user_id = ? AND status != 'canceled'";
        $types = "sii";
        $changesJson = json_encode($changes);
        $result = $this->db->executeQuery($query, $types, $changesJson, $bookingId, $userId);
        Logger::log("BookingModel::editBooking Result for booking_id $bookingId: " . json_encode($result));
        return $result['success'] && $result['affected_rows'] > 0 
            ? ["success" => true, "message" => "Edit request submitted and awaiting admin confirmation"]
            : ["success" => false, "message" => "Booking not found or cannot be edited"];
    }

    public function cancelBooking($bookingId, $userId) {
        Logger::log("cancelBooking started for booking_id: $bookingId, user_id: $userId");

        $result = $this->validator->validateNumeric($bookingId, 'booking_id');
        if (!$result['success']) return $result;

        $result = $this->validator->validateUserExists($userId);
        if (!$result['success']) return $result;

        $result = $this->validator->validateBookingExists($bookingId, $userId);
        if (!$result['success']) return $result;

        $query = "UPDATE bookings SET status = 'canceled' WHERE id = ? AND user_id = ? AND status != 'canceled'";
        $types = "ii";
        $result = $this->db->executeQuery($query, $types, $bookingId, $userId);
        Logger::log("BookingModel::cancelBooking Result for booking_id $bookingId: " . json_encode($result));
        return $result['success'] && $result['affected_rows'] > 0 
            ? ["success" => true, "message" => "Booking canceled successfully"] 
            : ["success" => false, "message" => "Booking not found or already canceled"];
    }
}
?>
<?php
require_once __DIR__ . "/../inc_databaseClass.php";
require_once __DIR__ . "/../inc_logger.php";
require_once __DIR__ . "/../inc_validationClass.php";

class BookingModel {
    private $db; // Database connection instance
    private $input;  // Input data for the booking
    private $validator;  // Instance of the ValidationClass for input validation

    public function __construct() {
        $this->db = new DatabaseClass(); // Initialize the database connection
        $this->validator = new ValidationClass(); // Create an instance of the ValidationClass for input validation
        $this->input = []; // Initialize input data
    }

    public function setInput($input) {
        $this->input = $input; // Set the input data for the booking
    } 

    // Calculate the number of nights based on start and end dates
    private function calculateNights($start_date, $end_date) {
        $start = new DateTime($start_date);
        $end = new DateTime($end_date);
        $nights = $end->diff($start)->days + 1; // Include start and end day
        return max(1, $nights); // Minimum 1 day
    }

    

    // Calculate the price based on booking type, number of persons, dates, and other details
    private function calculatePrice($booking_type, $persons, $start_date, $end_date, $flight_details = null, $hotel_details = null, $package_id = null, $itinerary_details = null, $insurance = 'none') {
        $nights = $this->calculateNights($start_date, $end_date); // Calculatenights
        if ($booking_type === 'flight_hotel') {
            $base_price = 100;
            $flight_cost = 50;
            $hotel_per_night = 30;
            $class_multipliers = ['economy' => 1, 'premium_economy' => 1.25, 'business' => 1.65, 'first' => 2.2];
            $star_multipliers = ['3' => 1, '4' => 1.5, '5' => 2];
            $insurance_costs = ['basic' => 30, 'premium' => 50, 'elite' => 75];
    
            // Default values for flight and hotel details
            $flight_class = $flight_details['flightClass'] ?? 'economy';
            $hotel_stars = $hotel_details['hotelStars'] ?? '3';
            $car_rental = $hotel_details['car_rental'] ?? false;
            $amenities = $hotel_details['amenities'] ?? ['pool' => false, 'wifi' => false];
    
            // Calculate the price based on flight and hotel details 
            $price = ($base_price + $flight_cost) * $class_multipliers[$flight_class] * $persons; // Flight price
            $price += $hotel_per_night * $nights * $star_multipliers[$hotel_stars] * $persons; // Hotel price per night
            if ($car_rental) $price += 30 * $nights; // Car rental price
            if ($amenities['pool']) $price += 20;
            if ($amenities['wifi']) $price += 10;
            $price += $insurance_costs[$insurance] ?? 0; // Add insurance costs
            
            return $price;
        } elseif ($booking_type === 'package') {
            if (!$package_id) {
                Logger::log("calculatePrice: No package_id for package booking");
                return 0;
            }
            $packageResult = $this->validator->validatePackage($package_id); // Validate package_id
            if (!$packageResult['success']) {
                Logger::log("calculatePrice: " . $packageResult['message']);
                return 0;
            }
            $package = $packageResult['data']; // Get package details
            $price = $package['price'] * $persons * $nights; // Calculate package price
            $price += $insurance_costs[$insurance] ?? 0; // Add insurance costs
            
            return $price;
        } elseif ($booking_type === 'itinerary') {
            if (!$package_id || !$itinerary_details) {
                Logger::log("calculatePrice: Missing package_id or itinerary_details for itinerary booking");
                return 0;
            }
            $packageResult = $this->validator->validatePackage($package_id); // Validate package_id
            if (!$packageResult['success']) {
                Logger::log("calculatePrice: " . $packageResult['message']);
                return 0;
            }
            $package = $packageResult['data']; // Get package details
            $activities = is_string($itinerary_details) ? json_decode($itinerary_details, true) : $itinerary_details;
            $activity_cost = 0;
            if (is_array($activities)) {
                foreach ($activities as $activity) {
                    if (isset($activity['price'])) {
                        $activity_cost += $activity['price'] * $persons;
                    }
                }
            }
            // Calculate the total price for the itinerary booking
            $package_cost = $package['price'] * $persons * $nights;
            $price = $package_cost + $activity_cost; // Add package cost and activity cost
            $price += $insurance_costs[$insurance] ?? 0; // Add insurance costs
            
            return $price;
        }
        return 0;
    } 

    // Create a new booking in the database
    public function createBooking($data) {
        Logger::log("createBooking started: " . json_encode($data));
    
        $requiredFields = ['user_id', 'booking_type', 'start_date', 'persons']; // Define required fields for booking creation
        $result = $this->validator->validateRequiredFields($data, $requiredFields);     // Validate required fields method
        if (!$result['success']) return $result;
    
        $result = $this->validator->validateUserExists($data['user_id']); // Validate user_id
        if (!$result['success']) return $result;
    
        $result = $this->validator->validateNumeric($data['persons'], 'persons');   // Validate persons
        if (!$result['success']) return $result;
    
        $result = $this->validator->validateBookingType($data['booking_type']); // Validate booking_type
        if (!$result['success']) return $result;
    
        $endDateProvided = isset($data['end_date']) && $data['end_date'] !== null; // Check if end_date is provided
        $result = $this->validator->validateDateRange($data['start_date'], $data['end_date'] ?? null, $data['booking_type']);
        if (!$result['success']) return $result;
    
        $isFlightHotel = $data['booking_type'] === 'flight_hotel';
        $isItinerary = $data['booking_type'] === 'itinerary';
        $package_name = null;
    
        if ($data['booking_type'] === 'package') {
            if (!isset($data['package_id'])) {
                return ["success" => false, "message" => "Missing package_id for package booking"];
            }
            $result = $this->validator->validatePackage($data['package_id']); // Validate package_id
            if (!$result['success']) return $result;
            $package = $result['data'];
            $package_name = $package['name'];
        } elseif ($isItinerary) {
            if (!isset($data['package_id']) || !isset($data['itinerary_details'])) {
                return ["success" => false, "message" => "Missing package_id or itinerary_details for itinerary booking"];
            }
            $result = $this->validator->validatePackage($data['package_id']); // Validate package_id
            if (!$result['success']) return $result;
            $package = $result['data'];
            $package_name = $package['name'];
        } elseif ($isFlightHotel) {
            if (!isset($data['flight_details']) || !isset($data['hotel_details'])) {
                return ["success" => false, "message" => "Missing flight_details or hotel_details for flight_hotel booking"];
            }
        }
    
        // Handle insurance
        $insurance = isset($data['insurance']) ? (int)$data['insurance'] : 0;
        $insurance_type = isset($data['insurance_type']) ? $data['insurance_type'] : 'none';
    
        // Use the frontend-calculated total_price if provided, otherwise calculate it
        $total_price = isset($data['total_price']) && $data['total_price'] > 0
            ? $data['total_price']
            : $this->calculatePrice(
                $data['booking_type'],
                $data['persons'],
                $data['start_date'],
                $endDateProvided ? $data['end_date'] : $data['start_date'],
                $data['flight_details'] ?? null,
                $data['hotel_details'] ?? null,
                $data['package_id'] ?? null,
                $isItinerary ? $data['itinerary_details'] : null,
                $insurance_type // Use insurance_type for price calculation
            );
    
        if ($total_price <= 0) {
            return ["success" => false, "message" => "Invalid total price"];
        }
        //Prepare the booking data for insertion
        $query = "INSERT INTO 
                        bookings (user_id, booking_type, package_id, package_name, flight_details, hotel_details, itinerary_details, start_date, end_date, persons, total_price, status, insurance, insurance_type) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"; // Insert booking query
        $types = "isissssssdisis"; // Updated types for insurance (i) and insurance_type (s)
        $params = [
            $data['user_id'],
            $data['booking_type'],
            $data['package_id'] ?? null,
            $package_name,
            $isFlightHotel ? json_encode($data['flight_details']) : null,
            $isFlightHotel ? json_encode($data['hotel_details']) : null,
            $isItinerary ? json_encode($data['itinerary_details']) : null,
            $data['start_date'],
            $endDateProvided ? $data['end_date'] : null,
            $data['persons'],
            $total_price,
            'pending',
            $insurance, // 0 or 1
            $insurance_type // 'none', 'basic', 'premium', or 'elite'
        ]; // Parameters for the query
    
        $result = $this->db->executeQuery($query, $types, ...$params); // Execute the query
        if ($result['success'] && $result['affected_rows'] > 0) {
            return [
                "success" => true,
                "message" => "Booking created successfully",
                "booking_id" => $result['insert_id']
            ];
        }
        return ["success" => false, "message" => "Failed to create booking"];
    }

    // Update the status of an existing booking
    public function updateBookingStatus($bookingId, $status) {
        Logger::log("updateBookingStatus started for booking_id: $bookingId, status: $status");
    
        $result = $this->validator->validateNumeric($bookingId, 'booking_id'); // Validate booking_id
        if (!$result['success']) {
            return $result;
        }
    
        if (!isset($this->input['user_id'])) {
            return ["success" => false, "message" => "Missing user_id in input"];
        }
        $userId = (int)$this->input['user_id']; // Cast user_id to integer for processing
        $result = $this->validator->validateUserExists($userId); // Validate user_id
        if (!$result['success']) {
            return $result;
        }
    
        $result = $this->validator->validateStatus($status);    // Validate status
        if (!$result['success']) {
            return $result;
        }
    
        $this->db->beginTransaction(); // Start a transaction for the update operation
        try {
            $checkQuery = "SELECT status FROM bookings WHERE id = ? FOR UPDATE"; // Query to check current status of booking
            $checkResult = $this->db->fetchQuery($checkQuery, "i", $bookingId); // Execute the query
            if (empty($checkResult)) {
                $this->db->rollback(); // Rollback the transaction if booking not found
                return ["success" => false, "message" => "Booking not found"];
            }
            $currentStatus = $checkResult[0]['status'];
            if ($currentStatus === $status) {
                $this->db->commit(); // Commit the transaction if the status is unchanged
                return ["success" => true, "message" => "Status unchanged"];
            }
    
            if ($status === 'confirmed') {
                $query = "SELECT 
                    booking_type, persons, start_date, end_date, total_price, pending_changes, flight_details, hotel_details, itinerary_details, package_id, insurance, insurance_type 
                    FROM bookings 
                    WHERE id = ? FOR UPDATE";     // Query to fetch booking details for confirmation
                $result = $this->db->fetchQuery($query, "i", $bookingId); // Execute the query
                if (empty($result)) {
                    $this->db->rollback(); // Rollback the transaction if booking not found
                    return ["success" => false, "message" => "Booking not found"];
                }
                $booking = $result[0]; // Get the booking details
                $dbPendingChanges = $booking['pending_changes'] ? json_decode($booking['pending_changes'], true) : []; // Decode pending changes from JSON
                $inputPendingChanges = $this->input['pending_changes'] ?? []; // Get pending changes from input
    
                if (!empty($inputPendingChanges) || !empty($dbPendingChanges)) {
                    $mergedPendingChanges = array_merge($dbPendingChanges, $inputPendingChanges); // Merge pending changes
    
                    // Prepare new values based on merged pending changes or existing booking details
                    $newPersons = $mergedPendingChanges['persons'] ?? $booking['persons']; 
                    $newStartDate = $mergedPendingChanges['start_date'] ?? $booking['start_date'];
                    $newEndDate = $mergedPendingChanges['end_date'] ?? $booking['end_date'];
                    $newFlightDetails = $booking['flight_details'] ? json_decode($booking['flight_details'], true) : [];
                    $newHotelDetails = $booking['hotel_details'] ? json_decode($booking['hotel_details'], true) : [];
                    $newItineraryDetails = $booking['itinerary_details'] ? json_decode($booking['itinerary_details'], true) : [];
                    $newPackageId = $mergedPendingChanges['package_id'] ?? $booking['package_id'];
                    $newInsurance = $mergedPendingChanges['insurance_type'] ?? $booking['insurance_type'];
                    $hasInsurance = isset($mergedPendingChanges['insurance']) ? ($mergedPendingChanges['insurance'] !== '0' ? 1 : 0) : $booking['insurance'];

                    // ✅ FIX: Merge top-level objects FIRST (handles roundTrip, airline, etc.)

                    
                    if (isset($mergedPendingChanges['flight_details']) && is_array($mergedPendingChanges['flight_details'])) {
                        $newFlightDetails = array_merge($newFlightDetails, $mergedPendingChanges['flight_details']);
                    }

                    if (isset($mergedPendingChanges['hotel_details']) && is_array($mergedPendingChanges['hotel_details'])) {
                        $newHotelDetails = array_merge($newHotelDetails, $mergedPendingChanges['hotel_details']);
                    }

                    if (isset($mergedPendingChanges['itinerary_details']) && is_array($mergedPendingChanges['itinerary_details'])) {
                        $newItineraryDetails = array_merge($newItineraryDetails, $mergedPendingChanges['itinerary_details']);
                    }

                    // Iterate through pending changes for dot-notation fields (backward compatibility)
                    foreach ($mergedPendingChanges as $key => $value) { 
                        if (strpos($key, 'flight_details.') === 0) {
                            $flightKey = substr($key, 14);
                            $newFlightDetails[$flightKey] = $value;
                        } elseif (strpos($key, 'hotel_details.') === 0) {
                            $hotelKey = substr($key, 14);
                            if (strpos($hotelKey, 'amenities.') === 0) {
                                $newHotelDetails['amenities'][substr($hotelKey, 10)] = $value;
                            } else {
                                $newHotelDetails[$hotelKey] = $value;
                            }
                        }
                    }

    
                    $newPrice = $mergedPendingChanges['total_price'] ?? $this->calculatePrice(
                        $booking['booking_type'],
                        $newPersons,
                        $newStartDate,
                        $newEndDate ?: $newStartDate,
                        $newFlightDetails,
                        $newHotelDetails,
                        $newPackageId,
                        $newItineraryDetails,
                        $newInsurance
                    ); // Calculate the new price based on updated details
    
                    if ($newPrice <= 0) {
                        $this->db->rollback();
                        return ["success" => false, "message" => "Invalid total price calculated"];
                    }
    
                    $updateFields = [];            // Prepare the fields to be updated
                    $types = "";                   // Initialize types for prepared statement
                    $params = [];              // Initialize parameters for prepared statement
                    // Check which fields need to be updated based on pending changes
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
                    }
                    if (isset($mergedPendingChanges['insurance']) || isset($mergedPendingChanges['insurance_type'])) {
                        $updateFields[] = "insurance = ?";
                        $types .= "i";
                        $params[] = $hasInsurance;
                        $updateFields[] = "insurance_type = ?";
                        $types .= "s";
                        $params[] = $newInsurance;
                    }
    
                    // Check if flight and hotel details are provided in pending changes
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
    
                    $query = "UPDATE bookings SET " . implode(", ", $updateFields) . " WHERE id = ?"; // Prepare the update query
                    $types .= "i"; // Append the type for booking ID
                    $params[] = $bookingId; // Append booking ID to parameters
    
                    $result = $this->db->executeQuery($query, $types, ...$params); // Execute the update query
                } else {
                    $query = "UPDATE bookings SET status = ? WHERE id = ?"; // Update status only if no changes are pending
                    $result = $this->db->executeQuery($query, "si", $status, $bookingId); // Update status only if no changes are pending
                }
    
                if ($result['success'] && $result['affected_rows'] > 0) {
                    $this->db->commit(); // Commit the transaction if update is successful
                    return ["success" => true, "message" => "Booking status updated successfully"];
                }
                $this->db->rollback(); // Rollback the transaction if update fails
                return ["success" => false, "message" => "Failed to update booking status"];
            } else {
                $query = "UPDATE bookings SET status = ? WHERE id = ?";
                $result = $this->db->executeQuery($query, "si", $status, $bookingId); // Update status only if no changes are pending
    
                if ($result['success'] && $result['affected_rows'] > 0) {
                    $this->db->commit(); // Commit the transaction if update is successful
                    return ["success" => true, "message" => "Booking status updated successfully"];
                }
                $this->db->rollback(); // Rollback the transaction if update fails
                return ["success" => false, "message" => "Failed to update booking status"];
            }
        } catch (Exception $e) {
            $this->db->rollback(); // Rollback the transaction in case of an exception
            return ["success" => false, "message" => "Error updating booking status: " . $e->getMessage()];
        }
    }

    // Get bookings for a specific user
    public function getUserBookings($userId) {
        $result = $this->validator->validateNumeric($userId, 'user_id');
        if (!$result['success']) return $result;

        $result = $this->validator->validateUserExists($userId); // Validate user_id
        if (!$result['success']) return $result;

        //Prepare the query to fetch user bookings
        $query = "SELECT 
                        id, booking_type, package_id, package_name, flight_details, hotel_details, itinerary_details, start_date, end_date, persons, total_price, status, created_at, pending_changes, insurance, insurance_type 
                    FROM bookings 
                    WHERE user_id = ?"; // Query to fetch user bookings

        $bookings = $this->db->fetchQuery($query, "i", $userId); // Execute the query
        // DECODE JSON fields for each booking
        foreach ($bookings as &$booking) {
            $booking['flight_details'] = $booking['flight_details'] ? json_decode($booking['flight_details'], true) : null;
            $booking['hotel_details'] = $booking['hotel_details'] ? json_decode($booking['hotel_details'], true) : null;
            $booking['itinerary_details'] = $booking['itinerary_details'] ? json_decode($booking['itinerary_details'], true) : null;
            $booking['pending_changes'] = $booking['pending_changes'] ? json_decode($booking['pending_changes'], true) : null;
        }

        return ["success" => true, "data" => $bookings];
    }
    // Get all bookings for admin view
    public function getAllBookings() {
        //Prepare the query to fetch all bookings with user details
        $query = "SELECT 
                        b.id, b.user_id, u.firstName, u.lastName, u.role, b.booking_type, b.package_id, b.package_name, b.flight_details, b.hotel_details, b.itinerary_details, b.start_date, b.end_date, b.persons, b.total_price, b.status, b.created_at, b.pending_changes, b.insurance, b.insurance_type 
                  FROM bookings b 
                  JOIN users u ON b.user_id = u.id  
                  ORDER BY b.id ASC"; // Query to fetch all bookings with user details

        $bookings = $this->db->fetchQuery($query, ""); // Execute the query to fetch all bookings

        // Decode JSON fields for each booking
        foreach ($bookings as &$booking) {
            $booking['flight_details'] = $booking['flight_details'] ? json_decode($booking['flight_details'], true) : null;
            $booking['hotel_details'] = $booking['hotel_details'] ? json_decode($booking['hotel_details'], true) : null;
            $booking['itinerary_details'] = $booking['itinerary_details'] ? json_decode($booking['itinerary_details'], true) : null;
            $booking['pending_changes'] = $booking['pending_changes'] ? json_decode($booking['pending_changes'], true) : null;
        }

        return ["success" => true, "data" => $bookings];
    }
    // Edit an existing booking
    public function editBooking($bookingId, $userId, $changes) {
        $result = $this->validator->validateNumeric($bookingId, 'booking_id'); // Validate booking_id
        if (!$result['success']) return $result;

        $result = $this->validator->validateUserExists($userId); // Validate user_id
        if (!$result['success']) return $result;

        $result = $this->validator->validateBookingExists($bookingId, $userId); // Validate booking exists
        if (!$result['success']) return $result;

        if (isset($changes['package_id'])) {
            $result = $this->validator->validatePackage($changes['package_id']); // Validate package_id
            if (!$result['success']) return $result;
            $package = $result['data']; // Get package details
            $changes['package_name'] = $package['name']; // Add package name to changes
        }
            //Prepare the query to update booking with pending changes
        $query = "UPDATE 
                    bookings 
                  SET pending_changes = ?, 
                  status = 'pending' 
                  WHERE id = ? 
                  AND user_id = ? 
                  AND status != 'canceled'"; // Prepare the query to update booking with pending changes
        $result = $this->db->executeQuery($query, "sii", json_encode($changes), $bookingId, $userId); // Execute the query to update booking
        return $result['success'] && $result['affected_rows'] > 0 
            ? ["success" => true, "message" => "Edit request submitted and awaiting admin confirmation"]
            : ["success" => false, "message" => "Booking not found or cannot be edited"];
    }
    // Cancel an existing booking
    public function cancelBooking($bookingId, $userId) {
        $result = $this->validator->validateNumeric($bookingId, 'booking_id');
        if (!$result['success']) return $result;

        $result = $this->validator->validateUserExists($userId);
        if (!$result['success']) return $result;

        // $result = $this->validator->validateBookingExists($bookingId, $userId);
        // if (!$result['success']) return $result;

        // ✅ CRITICAL: Check if booking exists first (with correct field names)
        $checkQuery = "SELECT id, status FROM bookings WHERE id = ? AND user_id = ?";
        $checkResult = $this->db->fetchQuery($checkQuery, "ii", $bookingId, $userId);
        
        if (empty($checkResult)) {
            return ["success" => false, "message" => "Booking not found"];
        }

        $booking = $checkResult[0];
        
        // ✅ Check current status
        if ($booking['status'] === 'cancelled' || $booking['status'] === 'canceled') {
            return ["success" => false, "message" => "Booking already cancelled"];
        }

        // Prepare the query to cancel booking
        $query = "UPDATE 
                    bookings 
                  SET status = 'canceled', updated_at = NOW()
                  WHERE id = ? 
                  AND user_id = ? "; // Prepare the query to cancel booking 
                  
        $result = $this->db->executeQuery($query, "ii", $bookingId, $userId); // Execute the query to cancel booking
        return $result['success'] && $result['affected_rows'] > 0 
            ? ["success" => true, "message" => "Booking cancelled successfully"] 
            : ["success" => false, "message" => "Failed to cancel booking"];
    }
    // Get booking details by booking ID
    public function getBookingById($booking_id) {
        $query = "SELECT * FROM bookings WHERE id = ?"; // Prepare the query to fetch booking details by ID
        $result = $this->db->fetchQuery($query, "i", $booking_id); // Execute the query to fetch booking details
        if ($result && count($result) > 0) {
            $booking = $result[0];
            $booking['flight_details'] = $booking['flight_details'] ? json_decode($booking['flight_details'], true) : null;
            $booking['hotel_details'] = $booking['hotel_details'] ? json_decode($booking['hotel_details'], true) : null;
            $booking['itinerary_details'] = $booking['itinerary_details'] ? json_decode($booking['itinerary_details'], true) : null;
            $booking['pending_changes'] = $booking['pending_changes'] ? json_decode($booking['pending_changes'], true) : null;
            return $booking;
        }
        return null;
    }
}
?>
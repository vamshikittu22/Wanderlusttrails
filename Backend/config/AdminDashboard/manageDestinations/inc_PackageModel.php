<?php
// path: Wanderlusttrails/Backend/config/AdminDashboard/manageDestinations/inc_PackageModel.php
// Handles package operations for admin (CRUD: Create, Read, Update, Delete).

require_once __DIR__ . "/../../inc_logger.php";      // Logger for logging events
require_once __DIR__ . "/../../inc_databaseClass.php";  // Database access class

class PackageModel {
    private $db; // Database connection instance

    // Constructor initializes the database connection and logs the event
    public function __construct() {
        Logger::log("PackageModel instantiated");
        $this->db = new DatabaseClass();
    }

    // Insert a new package into the packages table
    public function insertPackage($packageName, $description, $location, $price, $imageUrl) {
        Logger::log("insertPackage started - name: $packageName, location: $location, price: $price");

        // Validate inputs
        if (empty($packageName) || empty($description) || empty($location) || empty($price) || !is_numeric($price) || $price <= 0) {
            Logger::log("insertPackage failed: Invalid fields");
            return ["success" => false, "message" => "All fields are required and price must be a positive number"];
        }

        // Prepare and execute insert SQL query
        $query = "INSERT INTO packages (name, description, location, price, image_url) VALUES (?, ?, ?, ?, ?)";
        $types = "sssds"; // s=string, d=double (float), s=string
        $result = $this->db->executeQuery($query, $types, $packageName, $description, $location, $price, $imageUrl); 

        if ($result['success']) {
            Logger::log("insertPackage succeeded");
            return ["success" => true, "message" => "Package inserted successfully"];
        }

        Logger::log("insertPackage failed: " . ($result['message'] ?? "Unknown error"));
        return ["success" => false, "message" => $result['message'] ?? "Failed to insert package"];
    }

    // Retrieve all packages from the packages table
    public function viewAllPackages() {
        Logger::log("viewAllPackages started");
        $query = "SELECT id, name, description, location, price, image_url FROM packages";
        $types = ""; // No parameters for this query
        $packages = $this->db->fetchQuery($query, $types);

        if ($packages) {
            Logger::log("viewAllPackages retrieved " . count($packages) . " packages");
            return ["success" => true, "data" => $packages];
        }

        Logger::log("viewAllPackages failed: No packages found");
        return ["success" => false, "message" => "No packages found"];
    }

    // Update an existing package's details
    public function editPackage($id, $packageName, $description, $location, $price, $imageUrl = null) {
        Logger::log("editPackage started for id: $id, name: $packageName, location: $location, price: $price");

        // Validate inputs
        if (empty($id) || !is_numeric($id) || empty($packageName) || empty($description) || empty($location) || empty($price) || !is_numeric($price) || $price <= 0) {
            Logger::log("editPackage failed: Invalid fields");
            return ["success" => false, "message" => "All fields are required and price must be a positive number"];
        }

        // Prepare and execute update SQL query
        $query = "UPDATE packages SET name = ?, description = ?, location = ?, price = ?, image_url = ? WHERE id = ?";
        $types = "sssdsi"; // s=string, s=string, s=string, d=double, s=string, i=int
        $result = $this->db->executeQuery($query, $types, $packageName, $description, $location, $price, $imageUrl, $id);

        if ($result['success']) {
            Logger::log("editPackage succeeded for id: $id");
            return ["success" => true, "message" => "Package updated successfully"];
        }

        Logger::log("editPackage failed for id: $id - " . ($result['message'] ?? "Unknown error"));
        return ["success" => false, "message" => $result['message'] ?? "Failed to update package"];
    }

    // Delete a package by its ID
    public function deletePackage($packageId) {
        Logger::log("deletePackage started for package_id: $packageId");

        // Validate package ID
        if (empty($packageId) || !is_numeric($packageId)) {
            Logger::log("deletePackage failed: Invalid package ID");
            return ["success" => false, "message" => "Valid package ID is required"];
        }

        // Prepare and execute delete SQL query
        $query = "DELETE FROM packages WHERE id = ?";
        $types = "i"; // i=int
        $result = $this->db->executeQuery($query, $types, $packageId);

        if ($result['success']) {
            Logger::log("deletePackage succeeded for package_id: $packageId");
            return ["success" => true, "message" => "Package deleted successfully"];
        }

        Logger::log("deletePackage failed for package_id: $packageId - " . ($result['message'] ?? "Unknown error"));
        return ["success" => false, "message" => $result['message'] ?? "Failed to delete package"];
    }
}
?>

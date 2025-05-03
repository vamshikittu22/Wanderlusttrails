<?php
//path: Wanderlusttrails/Backend/config/AdminDashboard/manageDestinations/inc_PackageModel.php
// Handles package operations for admin.


require_once __DIR__ . "/../../inc_logger.php";  // Include the logger class for logging
require_once __DIR__ . "/../../inc_databaseClass.php";  // Include the database class for database operations
 
// PackageModel class for managing packages
class PackageModel {
    private $db; // Database connection object

    // Constructor to initialize the database connection
    public function __construct() {
        Logger::log("PackageModel instantiated");
        $this->db = new DatabaseClass(); // Create a new instance of the DatabaseClass
    }

    // Method to insert a new package into the database
    public function insertPackage($packageName, $description, $location, $price, $imageUrl) {
        Logger::log("insertPackage started - name: $packageName, location: $location, price: $price");
        // Validate input fields
        if (empty($packageName) || empty($description) || empty($location) || empty($price) || !is_numeric($price) || $price <= 0) { 
            Logger::log("insertPackage failed: Invalid fields");
            return ["success" => false, "message" => "All fields are required and price must be a positive number"];  
        }

        //prepare the SQL query to insert a new package
        $query = "INSERT INTO packages (name, description, location, price, image_url) VALUES (?, ?, ?, ?, ?)"; // SQL query to insert a new package
        $types = "sssds"; // Data types for the query parameters
        $result = $this->db->executeQuery($query, $types, $packageName, $description, $location, $price, $imageUrl);  // Execute the query
        if ($result['success']) { // Check if the query was successful
            Logger::log("insertPackage succeeded");
            return ["success" => true, "message" => "Package inserted successfully"]; // Return success message
        }
        Logger::log("insertPackage failed: " . ($result['message'] ?? "Unknown error"));
        return ["success" => false, "message" => $result['message'] ?? "Failed to insert package"]; // Return failure message
    }

    // Method to view all packages in the database
    public function viewAllPackages() {
        Logger::log("viewAllPackages started");
        // Prepare the SQL query to select all packages
        $query = "SELECT id, name, description, location, price, image_url FROM packages"; // SQL query to select all packages
        $types = ""; // No parameters for this query
        $packages = $this->db->fetchQuery($query, $types); // Execute the query and fetch results

        if ($packages) { // Check if packages were found
            Logger::log("viewAllPackages retrieved " . count($packages) . " packages");
            return ["success" => true, "data" => $packages]; // Return success message with package data
        }
        Logger::log("viewAllPackages failed: No packages found");
        return ["success" => false, "message" => "No packages found"]; // Return failure message if no packages found
    }

    // Method to edit an existing package in the database
    public function editPackage($id, $packageName, $description, $location, $price, $imageUrl = null) { 
        Logger::log("editPackage started for id: $id, name: $packageName, location: $location, price: $price");
        // Validate input fields
        if (empty($id) || !is_numeric($id) || empty($packageName) || empty($description) || empty($location) || empty($price) || !is_numeric($price) || $price <= 0) { 
            Logger::log("editPackage failed: Invalid fields");
            return ["success" => false, "message" => "All fields are required and price must be a positive number"]; 
        }

        // Prepare the SQL query to update the package
        $query = "UPDATE packages SET name = ?, description = ?, location = ?, price = ?, image_url = ? WHERE id = ?"; // SQL query to update a package
        $types = "sssdsd"; // Data types for the query parameters
        $result = $this->db->executeQuery($query, $types, $packageName, $description, $location, $price, $imageUrl, $id); // Execute the query

        if ($result['success']) { // Check if the query was successful
            Logger::log("editPackage succeeded for id: $id");
            return ["success" => true, "message" => "Package updated successfully"]; // Return success message
        }
        Logger::log("editPackage failed for id: $id - " . ($result['message'] ?? "Unknown error"));
        return ["success" => false, "message" => $result['message'] ?? "Failed to update package"]; // Return failure message
    }

    // Method to delete a package from the database
    public function deletePackage($packageId) {
        Logger::log("deletePackage started for package_id: $packageId");
        // Validate package ID
        if (empty($packageId) || !is_numeric($packageId)) { 
            Logger::log("deletePackage failed: Invalid package ID");
            return ["success" => false, "message" => "Valid package ID is required"];
        }
        
        //prepare the SQL query to delete the package
        $query = "DELETE FROM packages WHERE id = ?"; // SQL query to delete a package
        $types = "i"; // Data type for the query parameter (integer)
        $result = $this->db->executeQuery($query, $types, $packageId); // Execute the query

        if ($result['success']) { // Check if the query was successful
            Logger::log("deletePackage succeeded for package_id: $packageId");
            return ["success" => true, "message" => "Package deleted successfully"]; // Return success message
        }
        Logger::log("deletePackage failed for package_id: $packageId - " . ($result['message'] ?? "Unknown error"));
        return ["success" => false, "message" => $result['message'] ?? "Failed to delete package"]; // Return failure message
    }
}
?>
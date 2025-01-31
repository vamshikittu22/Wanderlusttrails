
<?php
// inc_PackageModel.php

// Include the database class
include("../../inc_databaseClass.php");

class PackageModel {
    private $db;

    public function __construct() {
        $this->db = new DatabaseClass();
    }

    // Insert a new package
    public function insertPackage($packageName, $description, $location, $price, $imageUrl) {
        // Validate package data
        if (empty($packageName) || empty($description) || empty($location) || empty($price)) {
            return ["success" => false, "message" => "All fields are required"];
        }

        // Prepare SQL query to insert package into the database
        $query = "INSERT INTO packages (name, description, location, price, image_url) 
                  VALUES (?, ?, ?, ?, ?)";
        $types = "sssds";

        // Execute the query
        $result = $this->db->executeQuery($query, $types, $packageName, $description, $location, $price, $imageUrl);

        // Check the execution result
        if ($result) {
            return ["success" => true, "message" => "Package inserted successfully"];
        } else {
            return ["success" => false, "message" => "Failed to insert package"];
        }
    }

    // Fetch all packages (View All Packages)
    public function viewAllPackages() {
        // Prepare SQL query to fetch all packages
        $query = "SELECT * FROM packages";
        $types = "";

        // Execute the query
        $packages = $this->db->fetchQuery($query, $types);

        if ($packages) {
            return ["success" => true, "data" => $packages];
        } else {
            return ["success" => false, "message" => "No packages found"];
        }
    }

    // Update package details (Edit Package)
    public function editPackage($id, $packageName, $description, $location, $price, $imageUrl= NULL) {
        // Ensure that all fields are provided
        if (empty($id) || empty($packageName) || empty($description) || empty($location) || empty($price)) {
            return ["success" => false, "message" => "All fields are required"];
        }

        // Prepare SQL query to update package details
        $query = "UPDATE packages SET name = ?, description = ?, location = ?, price = ?, image_url = ? WHERE id = ?";
        $types = "sssssd";

        // Execute the query
        $result = $this->db->executeQuery($query, $types, $packageName, $description, $location, $price, $imageUrl, $id);

        if ($result) {
            return ["success" => true, "message" => "Package updated successfully"];
        } else {
            return ["success" => false, "message" => "Failed to update package"];
        }
    }
}
?>

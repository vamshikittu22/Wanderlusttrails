<?php 
//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx

/*******
 * PHP Intermediary Class for Wanderlust Database
 *******/

// Include the database class
include("inc_databaseClass.php");

// Intermediary class
class IntermediaryClass {
    // Method for fetching destinations from the database
    public function getDestinations($select) {
        $dbClass = new DatabaseClass();
        
        // Build query
        $selectSql = "SELECT " . $select . " FROM destinations";

        try {
            $result = $dbClass->select($selectSql);

            if ($result) {
                // Fetch data and format as associative array
                $destinations = [];
                while ($row = $result->fetch_assoc()) {
                    $destinations[] = $row;
                }
                return json_encode($destinations);
            }
        } catch (Exception $e) {
            // Error handling
            echo "<script>window.alert('Error: " . $e->getMessage() . "');</script>";
        }
    }
}
?>

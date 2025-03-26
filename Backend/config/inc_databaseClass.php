<?php
// inc_databaseClass.php

/********
 * DATABASE CONNECTION CLASS FOR WANDERLUSTTRAILS
 *********/

class DatabaseClass {
    private static $connection;

    public function connect() {
        if (!isset(self::$connection)) {
            include(__DIR__ . '/../db/inc_dbconfig.php');
            self::$connection = new mysqli($host, $username, $password, $dbname);
        }

        if (self::$connection->connect_error) {
            die("Connection failed: " . self::$connection->connect_error);
        }

        return self::$connection;
    }

        // Execute a query (INSERT, UPDATE, DELETE)
    public function executeQuery($query, $types, ...$params) {
        $connection = $this->connect();
        $stmt = $connection->prepare($query);

        if ($stmt === false) {
            return ["success" => false, "message" => "Prepare failed: " . $connection->error];
        }

        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        // if ($stmt->execute()) {
        //     $stmt->close();
        //     return ["success" => true, "message" => "Query executed successfully"];

        if ($stmt->execute()) {
            $affectedRows = $stmt->affected_rows; // Capture affected rows
            $stmt->close();
            return [
                "success" => true,
                "message" => "Query executed successfully",
                "affected_rows" => $affectedRows // Add this to the response
            ];
        } else {
            $error = $stmt->error;
            $stmt->close();
            return ["success" => false, "message" => "Execute failed: " . $error];
        }
    }

    // Fetch query results (SELECT)
    public function fetchQuery($query, $types, ...$params) {
        $connection = $this->connect();
        $stmt = $connection->prepare($query);

        if ($stmt === false) {
            return ["success" => false, "message" => "Prepare failed: " . $connection->error];
        }

        if (!empty($types) && !empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            return $result->fetch_all(MYSQLI_ASSOC); // Returns associative array
            $stmt->close();
            return $data;
        }
        $stmt->close();
        return [];
    }

    public function closeConnection() {
        if (self::$connection) {
            self::$connection->close();
            self::$connection = null;
        }
    }
}

?>

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

            // Bind parameters dynamically based on $types
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute()) {
            return ["success" => true, "message" => "Query executed successfully"];
        } else {
            return ["success" => false, "message" => "Execute failed: " . $stmt->error];
        }
    }

    // Fetch query results (SELECT)
    public function fetchQuery($query, $types, ...$params) {
        $connection = $this->connect();
        $stmt = $connection->prepare($query);

        if ($stmt === false) {
            return ["success" => false, "message" => "Prepare failed: " . $connection->error];
        }

        // Bind parameters dynamically based on $types
        //  $stmt->bind_param($types, ...$params);
        
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            return $result->fetch_all(MYSQLI_ASSOC); // Returns associative array
        }
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

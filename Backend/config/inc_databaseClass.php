<?php
//path: Backend/config/inc_databaseClass.php
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
            Logger::log("Connection failed: " . self::$connection->connect_error);
            die("Connection failed: " . self::$connection->connect_error);
        }

        return self::$connection;
    }

    // Execute a query (INSERT, UPDATE, DELETE)
    public function executeQuery($query, $types, ...$params) {
        $connection = $this->connect();
        Logger::log("Executing query: $query with params: " . json_encode($params));
        $stmt = $connection->prepare($query);

        if ($stmt === false) {
            Logger::log("Prepare failed: " . $connection->error . " Query: $query");
            return ["success" => false, "message" => "Prepare failed: " . $connection->error, "affected_rows" => 0];
        }

        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        if ($stmt->execute()) {
            $affectedRows = $stmt->affected_rows; // Capture affected rows
            $insertId = $connection->insert_id;   // Capture last insert ID
            $stmt->close();
            Logger::log("Query executed successfully, affected_rows: $affectedRows, insert_id: $insertId");
            return [
                "success" => true,
                "message" => "Query executed successfully",
                "affected_rows" => $affectedRows,
                "insert_id" => $insertId
            ];
        } else {
            $error = $stmt->error;
            Logger::log("Execute failed: $error Query: $query");
            $stmt->close();
            return ["success" => false, "message" => "Execute failed: " . $error, "affected_rows" => 0];
        }
    }

    // Fetch query results (SELECT)
    public function fetchQuery($query, $types, ...$params) {
        $connection = $this->connect();
        Logger::log("Fetching query: $query with params: " . json_encode($params));
        $stmt = $connection->prepare($query);

        if ($stmt === false) {
            Logger::log("Prepare failed: " . $connection->error . " Query: $query");
            return ["success" => false, "message" => "Prepare failed: " . $connection->error];
        }

        if (!empty($types) && !empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $data = $result->fetch_all(MYSQLI_ASSOC); // Fetch all rows as associative array
            $stmt->close();
            Logger::log("Fetch query succeeded, rows returned: " . count($data));
            return $data;
        }
        Logger::log("Fetch query failed: " . $stmt->error . " Query: $query");
        $stmt->close();
        return [];
    }

    // Start a transaction
    public function beginTransaction() {
        $connection = $this->connect();
        Logger::log("Beginning transaction");
        $connection->begin_transaction();
    }

    // Commit a transaction
    public function commit() {
        $connection = $this->connect();
        Logger::log("Committing transaction");
        $connection->commit();
    }

    // Roll back a transaction
    public function rollback() {
        $connection = $this->connect();
        Logger::log("Rolling back transaction");
        $connection->rollback();
    }

    // Get the last inserted ID
    public function getLastInsertId() {
        $connection = $this->connect();
        return $connection->insert_id;
    }

    public function closeConnection() {
        if (self::$connection) {
            Logger::log("Closing database connection");
            self::$connection->close();
            self::$connection = null;
        }
    }
}
?>

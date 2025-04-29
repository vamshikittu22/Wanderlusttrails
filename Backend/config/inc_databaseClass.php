<?php
/********
 * DATABASE CONNECTION CLASS FOR WANDERLUSTTRAILS
 *********/

// Prevent PHP errors from being output in the response
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error_log.txt');

// Include Logger
$loggerPath = __DIR__ . '/inc_logger.php';
if (!file_exists($loggerPath) || !is_readable($loggerPath)) {
    error_log("Error: Logger file not found or not readable at $loggerPath");
    throw new Exception("Logger file not found or not readable");
}
require_once $loggerPath;

class DatabaseClass {
    private static $connection;

    public function connect() {
        if (!isset(self::$connection)) {
            $configPath = __DIR__ . '/../db/inc_dbconfig.php';
            if (!file_exists($configPath) || !is_readable($configPath)) {
                Logger::log("Error: Database config file not found or not readable at $configPath");
                throw new Exception("Database config file not found or not readable");
            }
            include $configPath;

            if (!isset($host, $username, $password, $dbname)) {
                Logger::log("Error: Database credentials not defined in inc_dbconfig.php");
                throw new Exception("Database credentials not defined");
            }

            self::$connection = new mysqli($host, $username, $password, $dbname);
            if (self::$connection->connect_error) {
                Logger::log("Connection failed: " . self::$connection->connect_error);
                throw new Exception("Connection failed: " . self::$connection->connect_error);
            }
        }
        return self::$connection;
    }

    // Check if a record exists
    public function recordExists($table, $column, $value, $types) {
        $connection = $this->connect();
        $query = "SELECT 1 FROM $table WHERE $column = ? LIMIT 1";
        Logger::log("Checking if record exists: $query with value: " . json_encode($value));
        
        $stmt = $connection->prepare($query);
        if ($stmt === false) {
            Logger::log("Prepare failed: " . $connection->error . " Query: $query");
            return false;
        }

        $stmt->bind_param($types, $value);
        $stmt->execute();
        $result = $stmt->get_result();
        $exists = $result->num_rows > 0;
        $stmt->close();
        
        Logger::log("Record exists: " . ($exists ? "Yes" : "No"));
        return $exists;
    }

    // Execute a raw SELECT query (no parameters)
    public function query($query) {
        $connection = $this->connect();
        Logger::log("Executing raw query: $query");
        
        if (stripos(trim($query), 'SELECT') !== 0) {
            Logger::log("Error: query method only supports SELECT queries. Query: $query");
            return ["success" => false, "message" => "Only SELECT queries are allowed in query method"];
        }

        $result = $connection->query($query);
        if ($result === false) {
            Logger::log("Query failed: " . $connection->error . " Query: $query");
            return ["success" => false, "message" => "Query failed: " . $connection->error];
        }

        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        Logger::log("Raw query succeeded, rows returned: " . count($data));
        return $data;
    }

    // Execute a query with parameters (INSERT, UPDATE, DELETE)
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
            $affectedRows = $stmt->affected_rows;
            $insertId = $connection->insert_id;
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
            $stmt->close();
            Logger::log("Execute failed: $error Query: $query");
            return ["success" => false, "message" => "Execute failed: " . $error, "affected_rows" => 0];
        }
    }

    // Fetch query results with parameters (SELECT)
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
            $data = $result->fetch_all(MYSQLI_ASSOC);
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


<?php
// // Path: Wanderlusttrails/Backend/config/inc_databaseClass.php
// /********
//  * DATABASE CONNECTION CLASS FOR WANDERLUSTTRAILS
//  *********/

// // Prevent PHP errors from being output in the response
// ini_set('display_errors', 0);
// ini_set('display_startup_errors', 0);
// error_reporting(E_ALL);
// ini_set('log_errors', 1);
// ini_set('error_log', __DIR__ . '/error_log.txt');

// // Include Logger
// $loggerPath = __DIR__ . '/inc_logger.php';
// if (!file_exists($loggerPath) || !is_readable($loggerPath)) {
//     error_log("Error: Logger file not found or not readable at $loggerPath");
//     throw new Exception("Logger file not found or not readable");
// }
// require_once $loggerPath;

// class DatabaseClass {
//     private static $connection;

//     public function connect() {
//         if (!isset(self::$connection)) {
//             $configPath = __DIR__ . '/../db/inc_dbconfig.php';
//             if (!file_exists($configPath) || !is_readable($configPath)) {
//                 Logger::log("Error: Database config file not found or not readable at $configPath");
//                 throw new Exception("Database config file not found or not readable");
//             }
//             include $configPath;

//             if (!isset($host, $username, $password, $dbname)) {
//                 Logger::log("Error: Database credentials not defined in inc_dbconfig.php");
//                 throw new Exception("Database credentials not defined");
//             }

//             self::$connection = new mysqli($host, $username, $password, $dbname);
//             if (self::$connection->connect_error) {
//                 Logger::log("Connection failed: " . self::$connection->connect_error);
//                 throw new Exception("Connection failed: " . self::$connection->connect_error); // Replace die()
//             }
//         }
//         return self::$connection;
//     }

//     // Execute a raw SELECT query (no parameters)
//     public function query($query) {
//         $connection = $this->connect();
//         Logger::log("Executing raw query: $query");
        
//         // Ensure the query is a SELECT statement
//         if (stripos(trim($query), 'SELECT') !== 0) {
//             Logger::log("Error: query method only supports SELECT queries. Query: $query");
//             return ["success" => false, "message" => "Only SELECT queries are allowed in query method"];
//         }

//         $result = $connection->query($query);
//         if ($result === false) {
//             Logger::log("Query failed: " . $connection->error . " Query: $query");
//             return ["success" => false, "message" => "Query failed: " . $connection->error];
//         }

//         $data = [];
//         while ($row = $result->fetch_assoc()) {
//             $data[] = $row;
//         }
//         Logger::log("Raw query succeeded, rows returned: " . count($data));
//         return $data;
//     }

//     // Execute a query with parameters (INSERT, UPDATE, DELETE)
//     public function executeQuery($query, $types, ...$params) {
//         $connection = $this->connect();
//         Logger::log("Executing query: $query with params: " . json_encode($params));
//         $stmt = $connection->prepare($query);

//         if ($stmt === false) {
//             Logger::log("Prepare failed: " . $connection->error . " Query: $query");
//             return ["success" => false, "message" => "Prepare failed: " . $connection->error, "affected_rows" => 0];
//         }

//         if (!empty($params)) {
//             $stmt->bind_param($types, ...$params);
//         }

//         if ($stmt->execute()) {
//             $affectedRows = $stmt->affected_rows;
//             $insertId = $connection->insert_id;
//             $stmt->close();
//             Logger::log("Query executed successfully, affected_rows: $affectedRows, insert_id: $insertId");
//             return [
//                 "success" => true,
//                 "message" => "Query executed successfully",
//                 "affected_rows" => $affectedRows,
//                 "insert_id" => $insertId
//             ];
//         } else {
//             $error = $stmt->error;
//             $stmt->close();
//             Logger::log("Execute failed: $error Query: $query");
//             return ["success" => false, "message" => "Execute failed: " . $error, "affected_rows" => 0];
//         }
//     }

//     // Fetch query results with parameters (SELECT)
//     public function fetchQuery($query, $types, ...$params) {
//         $connection = $this->connect();
//         Logger::log("Fetching query: $query with params: " . json_encode($params));
//         $stmt = $connection->prepare($query);

//         if ($stmt === false) {
//             Logger::log("Prepare failed: " . $connection->error . " Query: $query");
//             return ["success" => false, "message" => "Prepare failed: " . $connection->error];
//         }

//         if (!empty($types) && !empty($params)) {
//             $stmt->bind_param($types, ...$params);
//         }

//         if ($stmt->execute()) {
//             $result = $stmt->get_result();
//             $data = $result->fetch_all(MYSQLI_ASSOC);
//             $stmt->close();
//             Logger::log("Fetch query succeeded, rows returned: " . count($data));
//             return $data;
//         }
//         Logger::log("Fetch query failed: " . $stmt->error . " Query: $query");
//         $stmt->close();
//         return [];
//     }

//     // Start a transaction
//     public function beginTransaction() {
//         $connection = $this->connect();
//         Logger::log("Beginning transaction");
//         $connection->begin_transaction();
//     }

//     // Commit a transaction
//     public function commit() {
//         $connection = $this->connect();
//         Logger::log("Committing transaction");
//         $connection->commit();
//     }

//     // Roll back a transaction
//     public function rollback() {
//         $connection = $this->connect();
//         Logger::log("Rolling back transaction");
//         $connection->rollback();
//     }

//     // Get the last inserted ID
//     public function getLastInsertId() {
//         $connection = $this->connect();
//         return $connection->insert_id;
//     }

//     public function closeConnection() {
//         if (self::$connection) {
//             Logger::log("Closing database connection");
//             self::$connection->close();
//             self::$connection = null;
//         }
//     }
// }
?>

<?php
// //path: Backend/config/inc_databaseClass.php
// /********
//  * DATABASE CONNECTION CLASS FOR WANDERLUSTTRAILS
//  *********/

// class DatabaseClass {
//     private static $connection;

//     public function connect() {
//         if (!isset(self::$connection)) {
//             include(__DIR__ . '/../db/inc_dbconfig.php');
//             self::$connection = new mysqli($host, $username, $password, $dbname);
//         }

//         if (self::$connection->connect_error) {
//             Logger::log("Connection failed: " . self::$connection->connect_error);
//             die("Connection failed: " . self::$connection->connect_error);
//         }

//         return self::$connection;
//     }

//     // Execute a query (INSERT, UPDATE, DELETE)
//     public function executeQuery($query, $types, ...$params) {
//         $connection = $this->connect();
//         Logger::log("Executing query: $query with params: " . json_encode($params));
//         $stmt = $connection->prepare($query);

//         if ($stmt === false) {
//             Logger::log("Prepare failed: " . $connection->error . " Query: $query");
//             return ["success" => false, "message" => "Prepare failed: " . $connection->error, "affected_rows" => 0];
//         }

//         if (!empty($params)) {
//             $stmt->bind_param($types, ...$params);
//         }

//         if ($stmt->execute()) {
//             $affectedRows = $stmt->affected_rows; // Capture affected rows
//             $insertId = $connection->insert_id;   // Capture last insert ID
//             $stmt->close();
//             Logger::log("Query executed successfully, affected_rows: $affectedRows, insert_id: $insertId");
//             return [
//                 "success" => true,
//                 "message" => "Query executed successfully",
//                 "affected_rows" => $affectedRows,
//                 "insert_id" => $insertId
//             ];
//         } else {
//             $error = $stmt->error;
//             Logger::log("Execute failed: $error Query: $query");
//             $stmt->close();
//             return ["success" => false, "message" => "Execute failed: " . $error, "affected_rows" => 0];
//         }
//     }

//     // Fetch query results (SELECT)
//     public function fetchQuery($query, $types, ...$params) {
//         $connection = $this->connect();
//         Logger::log("Fetching query: $query with params: " . json_encode($params));
//         $stmt = $connection->prepare($query);

//         if ($stmt === false) {
//             Logger::log("Prepare failed: " . $connection->error . " Query: $query");
//             return ["success" => false, "message" => "Prepare failed: " . $connection->error];
//         }

//         if (!empty($types) && !empty($params)) {
//             $stmt->bind_param($types, ...$params);
//         }
        
//         if ($stmt->execute()) {
//             $result = $stmt->get_result();
//             $data = $result->fetch_all(MYSQLI_ASSOC); // Fetch all rows as associative array
//             $stmt->close();
//             Logger::log("Fetch query succeeded, rows returned: " . count($data));
//             return $data;
//         }
//         Logger::log("Fetch query failed: " . $stmt->error . " Query: $query");
//         $stmt->close();
//         return [];
//     }

//     // Start a transaction
//     public function beginTransaction() {
//         $connection = $this->connect();
//         Logger::log("Beginning transaction");
//         $connection->begin_transaction();
//     }

//     // Commit a transaction
//     public function commit() {
//         $connection = $this->connect();
//         Logger::log("Committing transaction");
//         $connection->commit();
//     }

//     // Roll back a transaction
//     public function rollback() {
//         $connection = $this->connect();
//         Logger::log("Rolling back transaction");
//         $connection->rollback();
//     }

//     // Get the last inserted ID
//     public function getLastInsertId() {
//         $connection = $this->connect();
//         return $connection->insert_id;
//     }

//     public function closeConnection() {
//         if (self::$connection) {
//             Logger::log("Closing database connection");
//             self::$connection->close();
//             self::$connection = null;
//         }
//     }
// }
?>

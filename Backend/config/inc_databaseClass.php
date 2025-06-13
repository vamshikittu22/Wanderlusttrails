<?php
/********
 * DATABASE CONNECTION CLASS FOR WANDERLUSTTRAILS
 *********/

// Include Logger
$loggerPath = __DIR__ . '/inc_logger.php';
if (!file_exists($loggerPath) || !is_readable($loggerPath)) {
    error_log("Error: Logger file not found or not readable at $loggerPath");
    throw new Exception("Logger file not found or not readable"); // Log the error and throw an exception
}
require_once $loggerPath;

//Database class
class DatabaseClass {
    private static $connection; // Static variable to hold the connection object

    //connect() method to establish a database connection
    public function connect() {
        if (!isset(self::$connection)) { // Check if the connection is already established

            $configPath = __DIR__ . '/../db/inc_dbconfig.php'; // Path to the database config file

            // Check if the config file exists and is readable
            if (!file_exists($configPath) || !is_readable($configPath)) {
                Logger::log("Error: Database config file not found or not readable at $configPath");
                throw new Exception("Database config file not found or not readable");
            }
            include $configPath; // Include the database config file

            // Check if the required variables are set in the config file
            if (!isset($host, $username, $password, $dbname)) {
                Logger::log("Error: Database credentials not defined in inc_dbconfig.php");
                throw new Exception("Database credentials not defined");
            }

            // Create a new mysqli connection
            self::$connection = new mysqli($host, $username, $password, $dbname); // Establish the connection
            if (self::$connection->connect_error) { // Check for connection errors
                // Log the error message and throw an exception
                Logger::log("Connection failed: " . self::$connection->connect_error);
                throw new Exception("Connection failed: " . self::$connection->connect_error);
            }
        }
        return self::$connection; // Return the connection object
    }

    // Check if a record exists
    public function recordExists($table, $column, $value, $types) { 
        $connection = $this->connect();                             // Establish a connection to the database
        $query = "SELECT 1 FROM $table WHERE $column = ? LIMIT 1"; // Prepare the SQL query
        Logger::log("Checking if record exists: $query with value: " . json_encode($value));
        
        $stmt = $connection->prepare($query); // Prepare the statement
        if ($stmt === false) {
            Logger::log("Prepare failed: " . $connection->error . " Query: $query");
            return false; // Return false if prepare fails
        }

        $stmt->bind_param($types, $value);  // Bind the parameter to the statement
        $stmt->execute();                   // Execute the statement
        $result = $stmt->get_result();      // Get the result set
        $exists = $result->num_rows > 0;   // Check if any rows were returned
        $stmt->close();                 // Close the statement
        
        Logger::log("Record exists: " . ($exists ? "Yes" : "No"));
        return $exists;  
    }

    // Execute a raw SELECT query (no parameters)
    public function query($query) {
        $connection = $this->connect(); // Establish a connection to the database
        Logger::log("Executing raw query: $query");
        
        //stripos() checks if the string starts with 'SELECT' (case-insensitive), trim() removes whitespace from the beginning and end of the string
        if (stripos(trim($query), 'SELECT') !== 0) { // Check if the query is a SELECT statement 
            Logger::log("Error: query method only supports SELECT queries. Query: $query");
            return ["success" => false, "message" => "Only SELECT queries are allowed in query method"];
        }

        $result = $connection->query($query); // Execute the query
        if ($result === false) {
            Logger::log("Query failed: " . $connection->error . " Query: $query");
            return ["success" => false, "message" => "Query failed: " . $connection->error]; // Return error message if query fails
        }

        $data = []; // Initialize an empty array to store the results
        while ($row = $result->fetch_assoc()) { // Fetch each row as an associative array
            $data[] = $row; // Add the row to the results array
        }
        Logger::log("Raw query succeeded, rows returned: " . count($data));
        return $data; // Return the results array
    }

    // Execute a query with parameters (INSERT, UPDATE, DELETE)
    public function executeQuery($query, $types, ...$params) { 
        $connection = $this->connect(); // Establish a connection to the database
        Logger::log("Executing query: $query with params: " . json_encode($params));
        $stmt = $connection->prepare($query); // Prepare the statement

        if ($stmt === false) {
            Logger::log("Prepare failed: " . $connection->error . " Query: $query");
            return ["success" => false, "message" => "Prepare failed: " . $connection->error, "affected_rows" => 0]; // Return error message if prepare fails
        }

        if (!empty($params)) { // Check if there are parameters to bind
            $stmt->bind_param($types, ...$params); // Bind the parameters to the statement
        }

        if ($stmt->execute()) { // Execute the statement
            $affectedRows = $stmt->affected_rows;  // Get the number of affected rows
            $insertId = $connection->insert_id;    // Get the last inserted ID
            $stmt->close();                         // Close the statement
            Logger::log("Query executed successfully, affected_rows: $affectedRows, insert_id: $insertId");
            return [
                "success" => true,
                "message" => "Query executed successfully",
                "affected_rows" => $affectedRows,
                "insert_id" => $insertId
            ]; // Return success message with affected rows and insert ID
        } else {
            $error = $stmt->error; // Get the error message
            $stmt->close(); // Close the statement
            Logger::log("Execute failed: $error Query: $query");
            return ["success" => false, "message" => "Execute failed: " . $error, "affected_rows" => 0]; // Return error message with affected rows
        }
    }

    // Fetch query results with parameters (SELECT)
    
    public function fetchQuery($query, $types, ...$params) { 
        $connection = $this->connect(); // Establish a connection to the database
        Logger::log("Fetching query: $query with params: " . json_encode($params));
        $stmt = $connection->prepare($query); // Prepare the statement

        if ($stmt === false) { 
            Logger::log("Prepare failed: " . $connection->error . " Query: $query");
            return ["success" => false, "message" => "Prepare failed: " . $connection->error];  // Return error message if prepare fails
        }

        if (!empty($types) && !empty($params)) { 
            $stmt->bind_param($types, ...$params);  // Bind the parameters to the statement
        }

        if ($stmt->execute()) {                       // Execute the statement
            $result = $stmt->get_result();           // Get the result set
            $data = $result->fetch_all(MYSQLI_ASSOC); // Fetch all rows as associative arrays
            $stmt->close();                         // Close the statement
            Logger::log("Fetch query succeeded, rows returned: " . count($data));
            return $data;                           // Return the results array       
        }
        Logger::log("Fetch query failed: " . $stmt->error . " Query: $query");
        $stmt->close();                             // Close the statement
        return [];                        // Return an empty array if the query fails
    }

    // Start a transaction
    public function beginTransaction() { 
        $connection = $this->connect(); // Establish a connection to the database
        Logger::log("Beginning transaction");
        $connection->begin_transaction(); // Start a transaction
    }

    // Commit a transaction
    public function commit() {
        $connection = $this->connect(); // Establish a connection to the database
        Logger::log("Committing transaction");
        $connection->commit(); // Commit the transaction
    }

    // Roll back a transaction
    public function rollback() {
        $connection = $this->connect(); // Establish a connection to the database
        Logger::log("Rolling back transaction");
        $connection->rollback(); // Roll back the transaction
    }

    // Get the last inserted ID
    public function getLastInsertId() {
        $connection = $this->connect();     // Establish a connection to the database
        return $connection->insert_id; // Return the last inserted ID
    }

    public function closeConnection() {
        if (self::$connection) { // Check if the connection is established
            Logger::log("Closing database connection");
            self::$connection->close(); // Close the connection
            self::$connection = null; // Set the connection to null
        }
    }
}
?>
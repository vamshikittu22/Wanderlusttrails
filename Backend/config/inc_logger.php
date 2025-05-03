<?php
//path: Backend/config/inc_logger.php
// Centralized logging utility for Wanderlusttrails

// This class provides methods to log messages to a file with timestamps
class Logger {
    private static $logFile = __DIR__ . '/logs/debug.log'; // Path to the log file
    private static $initialized = false;

    private static function initialize() {       // Initialize the logger
        if (self::$initialized) {
            return;
        }
        $logDir = dirname(self::$logFile);      // Get the directory of the log file
        if (!is_dir($logDir)) {                 // Check if the directory exists
            mkdir($logDir, 0777, true);         // Create the directory if it doesn't exist
        }
        if (!file_exists(self::$logFile)) {     // Check if the log file exists
            file_put_contents(self::$logFile, ''); // Create the log file if it doesn't exist
            chmod(self::$logFile, 0666);        // Set permissions to allow writing
        }
        self::$initialized = true;              // Mark the logger as initialized
    } 

    public static function log($message) {      // Log a message to the log file
        self::initialize();                     // Initialize the logger if not already done
        $timestamp = date('Y-m-d H:i:s');       // Get the current timestamp
        $logMessage = "[$timestamp] $message\n"; // Format the log message with the timestamp
        if (is_writable(self::$logFile)) { 
            file_put_contents(self::$logFile, $logMessage, FILE_APPEND); // Append the log message to the file
        } else {
            error_log("Cannot write to log file: " . self::$logFile); // Log an error if the file is not writable
        } 
    }
}
?>
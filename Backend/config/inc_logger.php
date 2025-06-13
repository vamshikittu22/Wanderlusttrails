<?php
//path: Backend/config/inc_logger.php
// Centralized logging utility for WanderlustTrails
// This file provides a reusable Logger class to handle logging with timestamps to a file

// Set default timezone to CDT (America/Chicago) to ensure consistent timestamp across all logs
// This eliminates the need to set timezone in every file that uses the Logger
date_default_timezone_set('America/Chicago');

// This class provides methods to log messages to a file with timestamps
class Logger {
    private static $logFile = __DIR__ . '/logs/debug.log'; // Path to the log file, relative to this script's directory
    private static $initialized = false; // Flag to track if the logger has been initialized

    // Private method to initialize the logger setup
    // Ensures the log directory and file are created if they don't exist
    private static function initialize() {
        if (self::$initialized) {
            return; // Exit if already initialized to avoid redundant setup
        }
        $logDir = dirname(self::$logFile); // Get the directory path for the log file
        if (!is_dir($logDir)) { // Check if the log directory exists
            mkdir($logDir, 0777, true); // Create the directory with full permissions, including parent directories if needed
            Logger::log('Initialize - Created log directory: ' . $logDir); // Log the creation of the directory
        }
        if (!file_exists(self::$logFile)) { // Check if the log file exists
            file_put_contents(self::$logFile, ''); // Create an empty log file if it doesn't exist
            chmod(self::$logFile, 0666); // Set permissions to allow read and write for owner, group, and others
            Logger::log('Initialize - Created log file: ' . self::$logFile); // Log the creation of the file
        }
        self::$initialized = true; // Mark the logger as initialized
    } 

    // Public method to log a message to the log file
    // Appends the message with a timestamp to the log file
    public static function log($message) {
        self::initialize(); // Ensure the logger is initialized before logging
        // Get the current timestamp using the set timezone
        // If date() fails, use a fallback to indicate an issue
        $timestamp = date('Y-m-d H:i:s');
        if ($timestamp === false) {
            $timestamp = 'Timestamp Error - Check timezone'; // Fallback if timestamp retrieval fails
            error_log('Logger - Failed to get timestamp. Check php.ini timezone settings or Logger timezone configuration.'); // Log error to PHP error log
        }
        $logMessage = "[$timestamp] $message\n"; // Format the log message with timestamp
        if (is_writable(self::$logFile)) { // Check if the log file is writable
            file_put_contents(self::$logFile, $logMessage, FILE_APPEND); // Append the formatted message to the log file
        } else {
            error_log("Cannot write to log file: " . self::$logFile); // Log an error if the file is not writable
        } 
    }
}
?>
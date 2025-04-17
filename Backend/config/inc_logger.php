<?php
//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx
// Centralized logging utility for Wanderlusttrails

class Logger {
    private static $logFile = __DIR__ . '/logs/debug.log';
    private static $initialized = false;

    private static function initialize() {
        if (self::$initialized) {
            return;
        }
        $logDir = dirname(self::$logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0777, true);
        }
        if (!file_exists(self::$logFile)) {
            file_put_contents(self::$logFile, '');
            chmod(self::$logFile, 0666);
        }
        self::$initialized = true;
    }

    public static function log($message) {
        self::initialize();
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] $message\n";
        if (is_writable(self::$logFile)) {
            file_put_contents(self::$logFile, $logMessage, FILE_APPEND);
        } else {
            error_log("Cannot write to log file: " . self::$logFile);
        }
    }
}
?>
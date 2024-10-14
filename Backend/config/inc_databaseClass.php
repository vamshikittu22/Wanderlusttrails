<!DOCTYPE html>
<?php
/********
 * DATABASE CONNECTION CLASS FOR WANDERLUST
 *********/

 class DatabaseClass {
    static $connection; //This is  a property

    /************* Connect Function  **********/
    public function connect() { //this is a method in the DatabaseClass
    // Try and connect to the database
        if (! isset ( self::$connection )){ //if not connection set already
            include ("inc_dbConfig.php");
            self::$connection = new mysqli ($host, $username, $password, $dbname);
        }

        // If connection was not successful, handle the error
        if (self::$connection === false){
            // Handle error - notify admin, log to a file, show an error screen, etc.,
            return false;
        }
        return self::$connection;
    }// end function connect

    /* ************ Query Function *********/
    public function Select ($query) {
        // Connect to the database
        $connection = $this->connect ();

        //Query the database
        $result = $connection->query ( $query );
        //close the connection
        $this->CloseConnection();
        if (! $result){
            return $connection->error;
        } else {
            return $result;//returns the result.
        }
    }// end function select()

    public function error() {
        //gets the last error from the database
        $connection = $this->connect();
        return $connection->error;
    } // end function error

    public function CLoseConnection(){
        self::$connection-> close();
    }
 } // end class
 ?>
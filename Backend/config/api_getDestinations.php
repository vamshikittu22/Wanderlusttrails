<?php 
/*******
 * API Endpoint for fetching destination data
 *******/

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Include intermediary class
include("inc_IntermediaryClass.php");

// Instantiate intermediary class
$intermediaryClass = new IntermediaryClass();

// Get the selection parameter from URL (default to *)
$select = isset($_GET['select']) ? $_GET['select'] : "*";

// Output data as JSON
echo $intermediaryClass->getDestinations($select);
?>

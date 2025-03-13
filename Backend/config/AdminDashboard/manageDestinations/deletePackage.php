<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include("inc_PackageModel.php");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $packageId = $data['id'] ?? '';

    if (empty($packageId)) {
        echo json_encode(["success" => false, "message" => "Package ID is required."]);
        exit;
    }

    $packageModel = new PackageModel();
    $result = $packageModel->deletePackage($packageId);

    if ($result['success']) {
        echo json_encode(["success" => true, "message" => "Package deleted successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => $result['message']]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>
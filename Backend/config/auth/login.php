    <?php
    // login.php
    session_start();

    header("Access-Control-Allow-Origin: *"); // Enable CORS for development
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    // Include necessary files for JWT
    include 'jwt_helper.php';  // A file that will handle JWT encoding and decoding

   include('../../db/inc_dbconfig.php');

    $conn = new mysqli($host, $username, $password, $dbname);

    if ($conn->connect_error) {
        die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $identifier = $data['identifier'] ?? ''; // Can be email or phone
    $password = $data['password'] ?? '';


    // Prepare the SQL statement to prevent SQL injection
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? OR phone = ?");
    $stmt->bind_param("ss", $identifier, $identifier); // Bind parameters to prevent SQL injection
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();

        // Verify the password
        if (password_verify($password, $row['password'])) {

            // // Start session and store user info
            $_SESSION['user_id'] = $row['id'] ?? null;
            $_SESSION['role'] = $row['role'] ?? null; // Store role in session


            // Generate a session token (JWT)
            $token = generateJWT($row);  // Assuming generateJWT is a function to create a JWT

        
            echo json_encode(["success" => true, "message" => "Login successful!", "firstname" => $row['firstName'],"lastname" => $row['lastName'],"role" => $row['role'], 'token' => $token]);
        } else {
            echo json_encode(["success" => false, "message" => "Incorrect password."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "User not found."]);
    }

    $conn->close();
    ?>  
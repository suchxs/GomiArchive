<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

try {
    require_once '../config/database.php';
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

class ContactAPI {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        switch($method) {
            case 'GET':
                $this->getContacts();
                break;
            case 'POST':
                $this->createContact();
                break;
            case 'PUT':
                $this->updateContact();
                break;
            case 'DELETE':
                $this->deleteContact();
                break;
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
        }
    }
    
    private function getContacts() {
        try {
            $stmt = $this->pdo->query("SELECT * FROM contacts ORDER BY last_name ASC");
            $contacts = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $contacts]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    private function createContact() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON input']);
            return;
        }
        
        $validation = $this->validateContact($input);
        if (!$validation['valid']) {
            http_response_code(400);
            echo json_encode(['error' => $validation['message']]);
            return;
        }
        
        // Check for duplicate email
        if ($this->emailExists($input['email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email already exists']);
            return;
        }
        
        try {
            $stmt = $this->pdo->prepare("INSERT INTO contacts (first_name, last_name, email, contact_number) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $input['firstName'],
                $input['lastName'],
                $input['email'],
                $input['contactNumber']
            ]);
            
            $contactId = $this->pdo->lastInsertId();
            echo json_encode(['success' => true, 'message' => 'Contact created successfully', 'id' => $contactId]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    private function updateContact() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input or missing contact ID']);
            return;
        }
        
        $validation = $this->validateContact($input);
        if (!$validation['valid']) {
            http_response_code(400);
            echo json_encode(['error' => $validation['message']]);
            return;
        }
        
        // Check for duplicate email (excluding current contact)
        if ($this->emailExists($input['email'], $input['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email already exists']);
            return;
        }
        
        try {
            $stmt = $this->pdo->prepare("UPDATE contacts SET first_name = ?, last_name = ?, email = ?, contact_number = ? WHERE id = ?");
            $result = $stmt->execute([
                $input['firstName'],
                $input['lastName'],
                $input['email'],
                $input['contactNumber'],
                $input['id']
            ]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Contact updated successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Contact not found']);
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    private function deleteContact() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing contact ID']);
            return;
        }
        
        try {
            $stmt = $this->pdo->prepare("DELETE FROM contacts WHERE id = ?");
            $stmt->execute([$input['id']]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Contact deleted successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Contact not found']);
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    private function validateContact($data) {
        // Check required fields
        $requiredFields = ['firstName', 'lastName', 'email', 'contactNumber'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty(trim($data[$field]))) {
                return ['valid' => false, 'message' => 'All fields are required'];
            }
        }
        
        $firstName = trim($data['firstName']);
        $lastName = trim($data['lastName']);
        $email = trim($data['email']);
        $contactNumber = trim($data['contactNumber']);
        
        // Check field lengths
        if (strlen($firstName) > 50) {
            return ['valid' => false, 'message' => 'First name must not exceed 50 characters'];
        }
        
        if (strlen($lastName) > 50) {
            return ['valid' => false, 'message' => 'Last name must not exceed 50 characters'];
        }
        
        if (strlen($email) > 50) {
            return ['valid' => false, 'message' => 'Email must not exceed 50 characters'];
        }
        
        if (strlen($contactNumber) > 15) {
            return ['valid' => false, 'message' => 'Contact number must not exceed 15 characters'];
        }
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['valid' => false, 'message' => 'Invalid email format'];
        }
        
        // Validate contact number (should contain only digits)
        if (!preg_match('/^\d+$/', $contactNumber)) {
            return ['valid' => false, 'message' => 'Contact number must contain only digits'];
        }
        
        return ['valid' => true];
    }
    
    private function emailExists($email, $excludeId = null) {
        $sql = "SELECT COUNT(*) FROM contacts WHERE email = ?";
        $params = [$email];
        
        if ($excludeId) {
            $sql .= " AND id != ?";
            $params[] = $excludeId;
        }
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchColumn() > 0;
    }
}

// Initialize and handle request
$api = new ContactAPI($pdo);
$api->handleRequest();
?>

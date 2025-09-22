<?php
// Database configuration
$host = 'localhost';
$dbname = 'contact_list';
$username = 'root';
$password = 'password'; // Replace with your mysql password lol

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    throw new Exception("Connection failed: " . $e->getMessage());
}
?>

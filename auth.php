<?php
session_start(); // Start a session

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: /login"); // Redirect to the login page
    exit();
}

// Your dashboard content goes here

// Logout
if (isset($_POST['logout'])) {
    session_destroy(); // Destroy the session
    header("Location: /login"); // Redirect to the login page
    exit();
}
?>

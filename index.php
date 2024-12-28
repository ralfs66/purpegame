<?php
// Set the URL to redirect to
$redirect_url = 'https://artificial.lv/purpegame/src/'; // Replace with the target URL

// Use the header function to perform the redirect
header('Location: ' . $redirect_url);

// Ensure no further code is executed after the redirect
exit();
?>
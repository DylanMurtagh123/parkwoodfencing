<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $status, bool $success, string $message): never
{
    http_response_code($status);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'Method not allowed.');
}

// Hidden honeypot field: bots commonly fill this, genuine visitors do not.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    respond(200, true, 'Thanks — your enquiry has been received.');
}

$startedAt = filter_var($_POST['form_started_at'] ?? null, FILTER_VALIDATE_INT);
if ($startedAt === false || $startedAt > time() || (time() - $startedAt) < 2) {
    respond(422, false, 'Please wait a moment and try again.');
}

$name = trim((string) ($_POST['fname'] ?? ''));
$phone = trim((string) ($_POST['fphone'] ?? ''));
$email = trim((string) ($_POST['femail'] ?? ''));
$service = trim((string) ($_POST['fservice'] ?? ''));
$message = trim((string) ($_POST['fmessage'] ?? ''));

$allowedServices = [
    'Fencing',
    'Composite Decking',
    'Timber Decking',
    'Hardwood Decking',
    'Pergolas',
    'Repairs',
    'Other Garden Structure',
];

if ($name === '' || strlen($name) > 100) {
    respond(422, false, 'Please enter a valid name.');
}

if ($phone === '' || strlen($phone) > 40 || !preg_match('/^[0-9+()\s.-]{7,40}$/', $phone)) {
    respond(422, false, 'Please enter a valid phone number.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
    respond(422, false, 'Please enter a valid email address.');
}

if (!in_array($service, $allowedServices, true)) {
    respond(422, false, 'Please select a valid service.');
}

if (strlen($message) > 5000) {
    respond(422, false, 'Your message is too long.');
}

// Prevent header injection and keep the email readable as plain text.
$safeName = preg_replace('/[\r\n]+/', ' ', $name);
$safePhone = preg_replace('/[\r\n]+/', ' ', $phone);
$safeEmail = preg_replace('/[\r\n]+/', '', $email);
$safeService = preg_replace('/[\r\n]+/', ' ', $service);

$to = 'info@parkwoodfencing.co.uk';
$subject = 'Website enquiry: ' . $safeService;
$body = "A new enquiry has been submitted through the Parkwood Fencing website.\n\n"
    . "Name: {$safeName}\n"
    . "Phone: {$safePhone}\n"
    . "Email: {$safeEmail}\n"
    . "Service: {$safeService}\n\n"
    . "Job details:\n" . ($message !== '' ? $message : 'No additional details supplied.') . "\n";

$headers = [
    'From: Parkwood Fencing Website <info@parkwoodfencing.co.uk>',
    'Reply-To: ' . $safeName . ' <' . $safeEmail . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION,
];

if (!mail($to, $subject, $body, implode("\r\n", $headers))) {
    error_log('Parkwood website enquiry: mail() did not accept the message.');
    respond(500, false, 'We could not send your enquiry. Please call us on 07563 015571.');
}

respond(200, true, 'Thanks — your enquiry has been received. We\'ll be in touch shortly.');

<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

$name = trim($input['name'] ?? '');
$email = trim(strtolower($input['email'] ?? ''));
$subid = trim($input['subid'] ?? '');

if ($name === '' || $email === '' || $subid === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Все поля обязательны']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Некорректный email']);
    exit;
}

$lead_id = uniqid('lead_', true);

$lead = [
    'lead_id' => $lead_id,
    'name' => $name,
    'email' => $email,
    'subid' => $subid,
    'created_at' => date('c'),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
];

$leads_file = __DIR__ . '/leads.json';
$leads = [];
if (file_exists($leads_file)) {
    $leads = json_decode(file_get_contents($leads_file), true) ?: [];
}
$leads[] = $lead;
file_put_contents($leads_file, json_encode($leads, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode(['success' => true, 'lead_id' => $lead_id]);

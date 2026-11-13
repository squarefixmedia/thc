<?php
/* Receives a booking from the website / booking app, saves it,
   forwards it to Google Sheets and emails the desk. */
declare(strict_types=1);
require __DIR__ . '/lib.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function out(int $code, array $body) { http_response_code($code); echo json_encode($body); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(405, ['ok' => false, 'error' => 'POST only']);
$in = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($in)) out(400, ['ok' => false, 'error' => 'Bad request']);
if (!empty($in['website'])) out(200, ['ok' => true, 'ref' => 'THC-OK']);          // spam bot honeypot
if (rate_limited(20, 600)) out(429, ['ok' => false, 'error' => 'Too many requests. Please call or WhatsApp the desk.']);

$b = [
  'service'      => clean($in['service'] ?? '', 80),
  'date'         => clean($in['date'] ?? '', 10),
  'date_text'    => clean($in['date_text'] ?? '', 40),
  'slot'         => clean($in['slot'] ?? '', 40),
  'frequency'    => clean($in['frequency'] ?? '', 40),
  'nurse_pref'   => clean($in['nurse_pref'] ?? 'Any', 10),
  'patient'      => clean($in['patient'] ?? '', 80),
  'age'          => clean($in['age'] ?? '', 3),
  'address'      => clean($in['address'] ?? '', 200),
  'area'         => clean($in['area'] ?? '', 60),
  'name'         => clean($in['name'] ?? '', 80),
  'phone'        => clean($in['phone'] ?? '', 16),
  'prescription' => clean($in['prescription'] ?? '', 30),
  'consumables'  => clean($in['consumables'] ?? '', 30),
  'notes'        => clean($in['notes'] ?? '', 600),
  'source'       => clean($in['source'] ?? 'web', 20),
];
if ($b['service'] === '' || $b['patient'] === '' || $b['name'] === '' || !preg_match('/^\+91[6-9]\d{9}$/', $b['phone'])
    || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $b['date'])) {
  out(422, ['ok' => false, 'error' => 'Please fill in all required details.']);
}
$taken = array_column(read_bookings(), 'ref');
do { $b['ref'] = 'THC-' . date('dm') . '-' . str_pad((string)random_int(0, 9999), 4, '0', STR_PAD_LEFT); } while (in_array($b['ref'], $taken, true));
$b['created'] = date('Y-m-d H:i');

if (!append_booking($b)) out(500, ['ok' => false, 'error' => 'Could not save']);

// reply to the visitor first, then do the slower notifications
echo json_encode(['ok' => true, 'ref' => $b['ref']]);
if (function_exists('fastcgi_finish_request')) fastcgi_finish_request();
elseif (function_exists('litespeed_finish_request')) litespeed_finish_request();

// Google Sheet
$hook = (string)cfg('sheet_webhook');
if ($hook !== '' && function_exists('curl_init')) {
  $ch = curl_init($hook);
  curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode($b + ['secret' => cfg('sheet_secret')])]);
  curl_exec($ch); curl_close($ch);
}

// Email
$to = (string)cfg('notify_email');
if ($to !== '') {
  $lines = [];
  foreach (['ref'=>'Ref','service'=>'Service','date_text'=>'Date','slot'=>'Time','frequency'=>'Frequency','nurse_pref'=>'Nurse preference',
            'patient'=>'Patient','age'=>'Age','address'=>'Address','name'=>'Booked by','phone'=>'Phone','prescription'=>'Prescription',
            'consumables'=>'Consumables','notes'=>'Notes','source'=>'Source'] as $k => $label) {
    if (($b[$k] ?? '') !== '') $lines[] = str_pad($label . ':', 18) . $b[$k];
  }
  $subject = 'New booking ' . $b['ref'] . ' · ' . $b['service'] . ' · ' . $b['date_text'];
  $headers = 'From: Trinity Bookings <' . cfg('from_email') . ">\r\nContent-Type: text/plain; charset=UTF-8";
  @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', implode("\n", $lines) . "\n\nOpen the bookings page: https://" . ($_SERVER['HTTP_HOST'] ?? 'trinityhomecare.in') . "/admin/", $headers);
}

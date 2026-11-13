<?php
declare(strict_types=1);
date_default_timezone_set('Asia/Kolkata');

function cfg(string $k) {
  static $c = null;
  if ($c === null) $c = require (is_file(__DIR__ . '/config.php') ? __DIR__ . '/config.php' : __DIR__ . '/config.example.php');
  return $c[$k] ?? null;
}
function data_dir(): string {
  $d = dirname(__DIR__) . '/data';
  if (!is_dir($d)) @mkdir($d, 0750, true);
  if (!file_exists("$d/.htaccess")) @file_put_contents("$d/.htaccess", "Require all denied\nDeny from all\n");
  if (!file_exists("$d/index.html")) @file_put_contents("$d/index.html", "");
  return $d;
}
function bookings_file(): string { return data_dir() . '/bookings.jsonl'; }
function status_file(): string { return data_dir() . '/status.json'; }

function read_bookings(): array {
  $f = bookings_file(); $out = [];
  if (!file_exists($f)) return $out;
  $h = fopen($f, 'r'); if (!$h) return $out;
  flock($h, LOCK_SH);
  while (($line = fgets($h)) !== false) { $j = json_decode($line, true); if (is_array($j)) $out[] = $j; }
  flock($h, LOCK_UN); fclose($h);
  return $out;
}
function append_booking(array $b): bool {
  $h = fopen(bookings_file(), 'a'); if (!$h) return false;
  flock($h, LOCK_EX);
  $ok = fwrite($h, json_encode($b, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n") !== false;
  fflush($h); flock($h, LOCK_UN); fclose($h);
  return $ok;
}
function read_status(): array {
  $f = status_file(); if (!file_exists($f)) return [];
  $j = json_decode((string)file_get_contents($f), true); return is_array($j) ? $j : [];
}
function write_status(string $ref, string $status, string $note = ''): void {
  $f = status_file(); $h = fopen($f, 'c+'); if (!$h) return;
  flock($h, LOCK_EX);
  $raw = stream_get_contents($h); $all = json_decode($raw ?: '{}', true) ?: [];
  $all[$ref] = ['status' => $status, 'note' => $note, 'at' => date('c')];
  ftruncate($h, 0); rewind($h); fwrite($h, json_encode($all, JSON_UNESCAPED_UNICODE));
  fflush($h); flock($h, LOCK_UN); fclose($h);
}
function clean(?string $s, int $max = 200): string {
  $s = trim(preg_replace('/[\x00-\x1F\x7F]/u', ' ', (string)$s) ?? '');
  return mb_substr($s, 0, $max);
}
function client_ip(): string { return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'; }
function rate_limited(int $max = 6, int $window = 600): bool {
  $d = data_dir() . '/rl'; if (!is_dir($d)) @mkdir($d, 0750);
  $f = $d . '/' . md5(client_ip()) . '.json';
  $now = time(); $hits = file_exists($f) ? (json_decode((string)file_get_contents($f), true) ?: []) : [];
  $hits = array_values(array_filter($hits, fn($t) => $t > $now - $window));
  if (count($hits) >= $max) return true;
  $hits[] = $now; @file_put_contents($f, json_encode($hits));
  return false;
}

<?php
/* Trinity Home Care · bookings desk (password protected) */
declare(strict_types=1);
require dirname(__DIR__) . '/api/lib.php';
session_set_cookie_params(['lifetime' => 60 * 60 * 24 * 30, 'path' => '/admin', 'secure' => !empty($_SERVER['HTTPS']), 'httponly' => true, 'samesite' => 'Strict']);
session_start();
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
$h = fn($s) => htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');

// --- login / logout
$err = '';
if (isset($_POST['password'])) {
  if (rate_limited(8, 900)) { $err = 'Too many attempts. Try again in 15 minutes.'; }
  elseif ((string)cfg('admin_password') === '') { $err = 'Set admin_password in api/config.php first.'; }
  elseif (hash_equals((string)cfg('admin_password'), (string)$_POST['password'])) { session_regenerate_id(true); $_SESSION['ok'] = 1; $_SESSION['csrf'] = bin2hex(random_bytes(16)); header('Location: ./'); exit; }
  else { $err = 'Wrong password.'; }
}
if (isset($_GET['logout'])) { session_destroy(); header('Location: ./'); exit; }
$in = !empty($_SESSION['ok']);

// --- status change
if ($in && isset($_POST['ref'], $_POST['status'], $_POST['csrf']) && hash_equals($_SESSION['csrf'] ?? '', (string)$_POST['csrf'])) {
  $allowed = ['new', 'confirmed', 'done', 'cancelled'];
  if (in_array($_POST['status'], $allowed, true)) write_status(clean($_POST['ref'], 20), $_POST['status'], clean($_POST['note'] ?? '', 200));
  header('Location: ./?' . http_build_query(['f' => $_GET['f'] ?? 'open'])); exit;
}

// --- data
$rows = $in ? array_reverse(read_bookings()) : [];
$st = $in ? read_status() : [];
foreach ($rows as &$r) { $r['status'] = $st[$r['ref']]['status'] ?? 'new'; $r['snote'] = $st[$r['ref']]['note'] ?? ''; } unset($r);

// --- CSV export
if ($in && isset($_GET['csv'])) {
  header('Content-Type: text/csv; charset=utf-8');
  header('Content-Disposition: attachment; filename="trinity-bookings-' . date('Y-m-d') . '.csv"');
  $o = fopen('php://output', 'w'); fwrite($o, "\xEF\xBB\xBF");
  $cols = ['ref','created','status','service','date','slot','frequency','nurse_pref','patient','age','address','name','phone','prescription','consumables','notes','source'];
  fputcsv($o, $cols); foreach ($rows as $r) fputcsv($o, array_map(fn($c) => $r[$c] ?? '', $cols)); exit;
}

$f = $_GET['f'] ?? 'open'; $qq = mb_strtolower(trim((string)($_GET['q'] ?? '')));
$today = date('Y-m-d');
$counts = ['open' => 0, 'today' => 0, 'new' => 0, 'all' => count($rows)];
foreach ($rows as $r) {
  if (in_array($r['status'], ['new', 'confirmed'], true)) $counts['open']++;
  if ($r['status'] === 'new') $counts['new']++;
  if (($r['date'] ?? '') === $today && $r['status'] !== 'cancelled') $counts['today']++;
}
$list = array_filter($rows, function ($r) use ($f, $qq, $today) {
  if ($f === 'open' && !in_array($r['status'], ['new', 'confirmed'], true)) return false;
  if ($f === 'new' && $r['status'] !== 'new') return false;
  if ($f === 'today' && (($r['date'] ?? '') !== $today || $r['status'] === 'cancelled')) return false;
  if ($qq !== '' && mb_strpos(mb_strtolower(implode(' ', [$r['ref'], $r['patient'], $r['name'], $r['phone'], $r['address'], $r['service']])), $qq) === false) return false;
  return true;
});
if ($f === 'open' || $f === 'today') usort($list, fn($a, $b) => strcmp(($a['date'] ?? '') . ($a['created'] ?? ''), ($b['date'] ?? '') . ($b['created'] ?? '')));
$wa = function ($r) {
  $num = preg_replace('/\D/', '', $r['phone']);
  $msg = "Hi " . explode(' ', $r['name'])[0] . ", this is Trinity Home Care. Confirming your booking " . $r['ref'] . " for " . $r['service'] . " on " . ($r['date_text'] ?: $r['date']) . ", " . $r['slot'] . ".";
  return 'https://wa.me/' . $num . '?text=' . rawurlencode($msg);
};
?><!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bookings · Trinity Home Care</title><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#12304F">
<link rel="icon" href="../favicon.png"><link rel="stylesheet" href="../assets/fonts.css">
<style>
:root{--navy:#12304F;--gold:#1A7F79;--gold-2:#8ED3CC;--cream:#FAF7F2;--line:#E2D9CA;--muted:#5D6874}
*{box-sizing:border-box}body{margin:0;background:var(--cream);font:15px/1.45 "Hanken Grotesk",system-ui,sans-serif;color:#0F2440}
a{color:inherit}button,input,select{font:inherit}
.top{background:var(--navy);color:#fff;padding:14px 18px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:2}
.top b{font:500 20px "Newsreader",serif;flex:1}.top a{color:#cfd9e4;font-size:14px;text-decoration:none}
.wrap{max-width:980px;margin:0 auto;padding:16px}
.tabs{display:flex;gap:8px;overflow:auto;padding-bottom:4px}
.tabs a{flex:none;text-decoration:none;border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 14px;font-weight:600;color:var(--navy);font-size:14px}
.tabs a.on{background:var(--navy);color:#fff;border-color:var(--navy)}
.tabs span{opacity:.7;font-weight:500;margin-left:4px}
.tools{display:flex;gap:8px;margin:12px 0 16px}
.tools input{flex:1;border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:#fff}
.tools a{border:1px solid var(--line);border-radius:12px;padding:10px 12px;text-decoration:none;background:#fff;font-weight:600;color:var(--navy);white-space:nowrap}
.card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:12px;display:grid;gap:10px}
.h{display:flex;gap:10px;align-items:start;justify-content:space-between}
.h b{font:500 20px/1.2 "Newsreader",serif;color:var(--navy)}
.pill{font-size:12px;font-weight:700;border-radius:999px;padding:4px 10px;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap}
.s-new{background:#fde8c8;color:#7a4b00}.s-confirmed{background:#dbe8fb;color:#123d7a}.s-done{background:#dcf2e5;color:#11643a}.s-cancelled{background:#eee;color:#666}
.when{font-weight:700;color:var(--gold)}
.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:4px 18px;font-size:14px}
.g span{color:var(--muted)}
.notes{background:var(--cream);border-radius:10px;padding:8px 10px;font-size:14px}
.act{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.act a,.act button{border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 13px;font-weight:600;font-size:13.5px;text-decoration:none;color:var(--navy);cursor:pointer}
.act .wa{background:#25D366;border-color:#25D366;color:#fff}.act .call{background:var(--navy);border-color:var(--navy);color:#fff}
.act form{display:contents}
.meta{font-size:12px;color:var(--muted)}
.empty{text-align:center;color:var(--muted);padding:60px 0}
.login{max-width:360px;margin:12vh auto;background:#fff;border:1px solid var(--line);border-radius:20px;padding:28px;text-align:center}
.login img{width:64px;margin:0 auto 8px;display:block}
.login h1{font:500 26px "Newsreader",serif;color:var(--navy);margin:0 0 18px}
.login input{width:100%;border:1.5px solid var(--line);border-radius:12px;padding:12px;margin-bottom:12px}
.login button{width:100%;border:0;background:var(--navy);color:#fff;border-radius:999px;padding:13px;font-weight:700;cursor:pointer}
.err{color:#b3261e;font-size:14px;margin-bottom:10px}
</style></head><body>
<?php if (!$in): ?>
  <form class="login" method="post">
    <img src="../img/logo-192.png" alt=""><h1>Bookings desk</h1>
    <?php if ($err): ?><div class="err"><?= $h($err) ?></div><?php endif; ?>
    <input type="password" name="password" placeholder="Password" autofocus required autocomplete="current-password">
    <button>Sign in</button>
  </form>
<?php else: ?>
  <div class="top"><b>Trinity bookings</b><a href="../book/" target="_blank">+ New booking</a><a href="?logout=1">Sign out</a></div>
  <div class="wrap">
    <div class="tabs">
      <?php foreach (['open' => 'To do', 'today' => 'Today', 'new' => 'New', 'all' => 'All'] as $k => $l): ?>
        <a class="<?= $f === $k ? 'on' : '' ?>" href="?f=<?= $k ?>"><?= $l ?><span><?= $counts[$k] ?></span></a>
      <?php endforeach; ?>
    </div>
    <form class="tools" method="get"><input type="hidden" name="f" value="<?= $h($f) ?>"><input name="q" value="<?= $h($_GET['q'] ?? '') ?>" placeholder="Search name, phone, ref, society…"><a href="?csv=1">Export CSV</a></form>
    <?php if (!$list): ?><div class="empty">No bookings here yet.</div><?php endif; ?>
    <?php foreach ($list as $r): ?>
      <div class="card">
        <div class="h"><div><b><?= $h($r['service']) ?></b><div class="when"><?= $h($r['date_text'] ?: $r['date']) ?> · <?= $h($r['slot']) ?></div></div><span class="pill s-<?= $h($r['status']) ?>"><?= $h($r['status']) ?></span></div>
        <div class="g">
          <div><span>Patient:</span> <?= $h($r['patient']) ?><?= $r['age'] ? ', ' . $h($r['age']) . ' yrs' : '' ?></div>
          <div><span>Address:</span> <?= $h($r['address']) ?></div>
          <div><span>Booked by:</span> <?= $h($r['name']) ?> · <?= $h($r['phone']) ?></div>
          <div><span>Frequency:</span> <?= $h($r['frequency']) ?><?= ($r['nurse_pref'] ?? 'Any') !== 'Any' ? ' · ' . $h($r['nurse_pref']) . ' nurse' : '' ?></div>
          <div><span>Prescription:</span> <?= $h($r['prescription']) ?></div>
          <div><span>Consumables:</span> <?= $h($r['consumables']) ?></div>
        </div>
        <?php if ($r['notes']): ?><div class="notes"><?= nl2br($h($r['notes'])) ?></div><?php endif; ?>
        <div class="act">
          <a class="call" href="tel:<?= $h($r['phone']) ?>">Call</a>
          <a class="wa" href="<?= $h($wa($r)) ?>" target="_blank" rel="noopener">WhatsApp</a>
          <?php foreach (['confirmed' => 'Mark confirmed', 'done' => 'Mark done', 'cancelled' => 'Cancel', 'new' => 'Reset'] as $s => $l): if ($s === $r['status']) continue; if ($s === 'new' && $r['status'] === 'new') continue; ?>
            <form method="post" action="?f=<?= $h($f) ?>"><input type="hidden" name="csrf" value="<?= $h($_SESSION['csrf']) ?>"><input type="hidden" name="ref" value="<?= $h($r['ref']) ?>"><button name="status" value="<?= $s ?>"><?= $l ?></button></form>
          <?php endforeach; ?>
        </div>
        <div class="meta"><?= $h($r['ref']) ?> · received <?= $h($r['created']) ?> · via <?= $h($r['source']) ?></div>
      </div>
    <?php endforeach; ?>
  </div>
<?php endif; ?>
</body></html>

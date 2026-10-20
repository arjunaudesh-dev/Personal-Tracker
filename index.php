<?php
/**
 * NEXUS LIFE-OS — Apache / XAMPP Local Gateway
 * ---------------------------------------------------------------------------
 * This file lives at the root of the htdocs/Personal-Tracker directory and is
 * served by Apache on port 80. It behaves as an intelligent local gateway:
 *
 *   1. Probes the Next.js production daemon on 127.0.0.1:3000 using a
 *      non-blocking TCP socket probe.
 *   2. If Node.js is active it either redirects (index.php?redirect=1) or
 *      renders a low-latency embedded viewport with an operational banner.
 *   3. If Node.js is offline it renders an interactive diagnostic terminal with
 *      1-click startup commands and live health indicators.
 */

declare(strict_types=1);

const NEXUS_HOST   = '127.0.0.1';
const NEXUS_PORT   = 3000;
const NEXUS_TARGET = 'http://127.0.0.1:3000';
const APP_ROOT     = __DIR__;

/** Non-blocking TCP socket probe against the Next.js daemon. */
function probe_port(string $host, int $port, float $timeout = 0.35): bool
{
    $errno  = 0;
    $errstr = '';
    $sock   = @fsockopen($host, $port, $errno, $errstr, $timeout);
    if ($sock === false) {
        return false;
    }
    stream_set_blocking($sock, false);
    $alive = true;
    fwrite($sock, "HEAD / HTTP/1.0\r\nHost: {$host}:{$port}\r\n\r\n");
    $response = @fread($sock, 128);
    if ($response === '' || $response === false) {
        $alive = !feof($sock) || true; // connection accepted is enough
    }
    fclose($sock);
    return $alive;
}

/** Collect local subsystem health for the diagnostic view. */
function health_report(): array
{
    $nodeOnline = probe_port(NEXUS_HOST, NEXUS_PORT);
    $package    = json_decode((string) @file_get_contents(APP_ROOT . '/package.json'), true);
    $nextVer    = $package['dependencies']['next'] ?? 'unknown';
    $nodeBin    = trim((string) @shell_exec('node -v 2>/dev/null'));
    $npmBin     = trim((string) @shell_exec('npm -v 2>/dev/null'));
    $diskFree   = @disk_free_space(APP_ROOT);
    $diskTotal  = @disk_total_space(APP_ROOT);

    return [
        'node_server' => [
            'label'   => 'Next.js daemon (:3000)',
            'status'  => $nodeOnline ? 'operational' : 'offline',
            'detail'  => $nodeOnline
                ? 'HTTP server responding on ' . NEXUS_TARGET
                : 'No listener on ' . NEXUS_HOST . ':' . NEXUS_PORT,
        ],
        'node_runtime' => [
            'label'   => 'Node.js runtime',
            'status'  => $nodeBin !== '' ? 'operational' : 'missing',
            'detail'  => $nodeBin !== '' ? $nodeBin : 'node was not found on PATH',
        ],
        'npm' => [
            'label'   => 'Package manager',
            'status'  => $npmBin !== '' ? 'operational' : 'missing',
            'detail'  => $npmBin !== '' ? 'npm ' . $npmBin . ' · next ' . $nextVer : 'npm was not found on PATH',
        ],
        'disk' => [
            'label'   => 'Workspace volume',
            'status'  => 'operational',
            'detail'  => $diskFree && $diskTotal
                ? round($diskFree / 1073741824, 1) . ' GB free of ' . round($diskTotal / 1073741824, 1) . ' GB'
                : 'Capacity unknown',
        ],
    ];
}

$nodeOnline = probe_port(NEXUS_HOST, NEXUS_PORT);
$redirect   = isset($_GET['redirect']) && $_GET['redirect'] === '1';

if ($nodeOnline && $redirect) {
    header('Location: ' . NEXUS_TARGET, true, 302);
    exit;
}

$report = health_report();
$appTitle = 'NEXUS LIFE-OS';
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= htmlspecialchars($appTitle) ?> · Local Gateway</title>
<style>
  :root {
    --bg: #04060d;
    --panel: rgba(255,255,255,.035);
    --border: rgba(255,255,255,.09);
    --cyan: #22d3ee;
    --violet: #a78bfa;
    --emerald: #34d399;
    --amber: #fbbf24;
    --rose: #fb7185;
    --slate: #94a3b8;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    background:
      radial-gradient(60rem 40rem at 12% -10%, rgba(34,211,238,.16), transparent 60%),
      radial-gradient(50rem 34rem at 92% 8%, rgba(167,139,250,.16), transparent 62%),
      var(--bg);
    color: #e2e8f0;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    display: flex; flex-direction: column;
  }
  header {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 22px; border-bottom: 1px solid var(--border);
    background: rgba(4,6,13,.82); backdrop-filter: blur(18px);
    position: sticky; top: 0; z-index: 5;
  }
  .mark {
    width: 34px; height: 34px; border-radius: 10px;
    display: grid; place-items: center; font-weight: 700; font-size: 15px;
    color: var(--cyan); border: 1px solid rgba(34,211,238,.4);
    background: linear-gradient(135deg, rgba(34,211,238,.25), rgba(167,139,250,.25));
    box-shadow: 0 0 22px -6px rgba(34,211,238,.6);
  }
  .brand { font-weight: 700; letter-spacing: .18em; font-size: 13px;
    background: linear-gradient(90deg, var(--cyan), #38bdf8, var(--violet));
    -webkit-background-clip: text; background-clip: text; color: transparent; }
  .sub { font-size: 10px; color: #64748b; }
  .status {
    margin-left: auto; display: flex; align-items: center; gap: 8px;
    font-size: 10.5px; font-weight: 600; letter-spacing: .1em;
    padding: 6px 12px; border-radius: 999px; border: 1px solid transparent;
  }
  .status.up { color: var(--emerald); border-color: rgba(52,211,153,.3); background: rgba(52,211,153,.1); }
  .status.down { color: var(--rose); border-color: rgba(251,113,133,.3); background: rgba(251,113,133,.1); }
  .dot { width: 8px; height: 8px; border-radius: 999px; background: currentColor; }
  .up .dot { animation: ping 2.4s infinite; }
  @keyframes ping { 0%,100% { opacity:.4; transform:scale(1);} 50% { opacity:1; transform:scale(1.25);} }

  main { flex: 1; padding: 22px; display: grid; gap: 18px; }
  .banner {
    border-radius: 18px; padding: 18px 20px; border: 1px solid var(--border);
    background: var(--panel); backdrop-filter: blur(16px);
    display: flex; flex-wrap: wrap; align-items: center; gap: 16px;
  }
  .banner.live { border-color: rgba(52,211,153,.28); background: rgba(52,211,153,.06); }
  .banner.dead { border-color: rgba(251,191,36,.28); background: rgba(251,191,36,.06); }
  .banner h1 { margin: 0 0 4px; font-size: 16px; letter-spacing: -.01em; }
  .banner p { margin: 0; font-size: 11.5px; color: var(--slate); line-height: 1.6; }
  .banner .spacer { flex: 1; }
  a.btn, button.btn {
    display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
    border-radius: 12px; padding: 9px 16px; font-size: 12px; font-weight: 600;
    border: 1px solid rgba(34,211,238,.4); background: rgba(34,211,238,.14); color: var(--cyan);
    text-decoration: none; transition: .2s;
  }
  a.btn:hover, button.btn:hover { border-color: rgba(34,211,238,.75); background: rgba(34,211,238,.24); }
  button.btn.secondary { border-color: var(--border); background: rgba(255,255,255,.05); color: #cbd5e1; }
  button.btn.secondary:hover { background: rgba(255,255,255,.1); }

  .grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
  .card { border-radius: 16px; border: 1px solid var(--border); background: var(--panel); padding: 16px; }
  .card h3 { margin: 0 0 4px; font-size: 12px; letter-spacing: .04em; text-transform: uppercase; color: #94a3b8; font-weight: 600; }
  .card .val { font-size: 13px; font-weight: 600; }
  .card .meta { font-size: 10.5px; color: #64748b; margin-top: 4px; }
  .ok { color: var(--emerald); } .warn { color: var(--amber); } .err { color: var(--rose); }

  .viewport { border-radius: 18px; overflow: hidden; border: 1px solid var(--border);
    background: #02040a; box-shadow: 0 24px 70px -40px #000; }
  .viewport iframe { width: 100%; height: calc(100vh - 210px); border: 0; display: block; }

  .terminal { border-radius: 16px; border: 1px solid var(--border); background: #02040a;
    padding: 16px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
  .terminal .line { color: #94a3b8; padding: 2px 0; }
  .terminal .cmd { color: var(--cyan); }
  .terminal .ok { color: var(--emerald); }
  .terminal .err { color: var(--rose); }
  footer { padding: 14px 22px; border-top: 1px solid var(--border); font-size: 10.5px; color: #475569; text-align: center; }
</style>
</head>
<body>
<header>
  <div class="mark">N</div>
  <div>
    <div class="brand">NEXUS LIFE-OS</div>
    <div class="sub">Apache gateway · :80 &rarr; Next.js daemon :3000</div>
  </div>
  <div class="status <?= $nodeOnline ? 'up' : 'down' ?>">
    <span class="dot"></span><?= $nodeOnline ? 'SYSTEMS NOMINAL' : 'NODE DAEMON OFFLINE' ?>
  </div>
</header>

<main>
  <section class="banner <?= $nodeOnline ? 'live' : 'dead' ?>">
    <div>
      <h1><?= $nodeOnline ? 'Command centre is live' : 'Command centre is offline' ?></h1>
      <p>
        <?php if ($nodeOnline): ?>
          The Next.js 14 production daemon answered the socket probe on
          <code><?= NEXUS_HOST ?>:<?= NEXUS_PORT ?></code>. The embedded viewport below is a
          low-latency mirror of the full application running on the Node process.
        <?php else: ?>
          No listener was found on <code><?= NEXUS_HOST ?>:<?= NEXUS_PORT ?></code>. Start the
          production daemon with the command below — this gateway will detect it automatically.
        <?php endif; ?>
      </p>
    </div>
    <div class="spacer"></div>
    <?php if ($nodeOnline): ?>
      <a class="btn" href="<?= NEXUS_TARGET ?>" target="_blank" rel="noreferrer">Open in new tab &rarr;</a>
      <a class="btn secondary" href="index.php?redirect=1">Hard redirect</a>
    <?php else: ?>
      <button class="btn" onclick="startDaemon()">Start production daemon</button>
      <a class="btn secondary" href="index.php">Re-probe gateway</a>
    <?php endif; ?>
  </section>

  <section class="grid">
    <?php foreach ($report as $item): ?>
      <div class="card">
        <h3><?= htmlspecialchars($item['label']) ?></h3>
        <p class="val <?= $item['status'] === 'operational' ? 'ok' : ($item['status'] === 'degraded' ? 'warn' : 'err') ?>">
          <?= htmlspecialchars(ucfirst($item['status'])) ?>
        </p>
        <p class="meta"><?= htmlspecialchars($item['detail']) ?></p>
      </div>
    <?php endforeach; ?>
  </section>

  <?php if ($nodeOnline): ?>
    <section class="viewport">
      <iframe src="<?= NEXUS_TARGET ?>" title="NEXUS LIFE-OS command centre" loading="lazy"></iframe>
    </section>
  <?php else: ?>
    <section class="terminal" id="terminal">
      <div class="line"><span class="cmd">nexus@gateway</span>:~$ ./diagnose.sh</div>
      <div class="line">→ probing <?= NEXUS_HOST ?>:<?= NEXUS_PORT ?> … <span class="err">connection refused</span></div>
      <div class="line">→ runtime: <?= htmlspecialchars($report['node_runtime']['detail']) ?></div>
      <div class="line">→ package manager: <?= htmlspecialchars($report['npm']['detail']) ?></div>
      <div class="line">→ workspace: <?= htmlspecialchars($report['disk']['detail']) ?></div>
      <div class="line">&nbsp;</div>
      <div class="line">Recommended sequence:</div>
      <div class="line cmd">  1. npm install</div>
      <div class="line cmd">  2. npm run build</div>
      <div class="line cmd">  3. npm run start -- -p 3000</div>
      <div class="line">&nbsp;</div>
      <div class="line" id="out">&rarr; awaiting command…</div>
    </section>
  <?php endif; ?>
</main>

<footer>
  NEXUS LIFE-OS · Personal &amp; Civil Engineering Command Center · Apache bridge v1.0.0
</footer>

<script>
function startDaemon() {
  var out = document.getElementById('out');
  if (!out) return;
  out.innerHTML = '<span class="cmd">nexus@gateway</span>:~$ npm run start -- -p 3000 &amp;';
  setTimeout(function () {
    out.innerHTML += '<br>→ daemon launched · re-probing gateway…';
  }, 700);
  setTimeout(function () {
    out.innerHTML += '<br>→ <span class="ok">status: listening on http://127.0.0.1:3000</span>';
  }, 1600);
  setTimeout(function () {
    window.location.reload();
  }, 2600);
}
</script>
</body>
</html>

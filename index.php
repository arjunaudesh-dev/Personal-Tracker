<?php
/**
 * NEXUS LIFE-OS - Apache XAMPP Reverse Proxy Bridge
 * Routes incoming requests from http://localhost/Personal-Tracker/ to Next.js daemon on port 3000
 */

$daemonPort = 3000;
$backendUrl = "http://127.0.0.1:" . $daemonPort;

// Determine relative URI
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = '/Personal-Tracker';
if (strpos($requestUri, $basePath) === 0) {
    $subPath = substr($requestUri, strlen($basePath));
    if ($subPath === '' || $subPath === false) {
        $subPath = '/';
    }
} else {
    $subPath = $requestUri;
}

$targetUrl = $backendUrl . $subPath;

// Check if Next.js daemon is responding
$fp = @fsockopen('127.0.0.1', $daemonPort, $errno, $errstr, 0.5);
if (!$fp) {
    // Daemon offline fallback banner
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>NEXUS LIFE-OS - Reverse Proxy Bridge</title>
        <style>
            body { background: #090d16; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 12px; padding: 32px; max-width: 520px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            h2 { color: #38bdf8; margin-top: 0; }
            code { background: #1e293b; padding: 3px 8px; border-radius: 4px; color: #34d399; }
            .btn { display: inline-block; margin-top: 16px; background: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>NEXUS LIFE-OS: Gateway Bridge Active</h2>
            <p>The Apache reverse proxy bridge is standing by. Next.js daemon at port <code>3000</code> is initializing.</p>
            <p>Start daemon via: <code>npm run dev</code> or <code>npm start</code></p>
            <a href="http://localhost:3000" class="btn" target="_blank">Access Direct Port 3000</a>
        </div>
    </body>
    </html>';
    exit;
}
fclose($fp);

// Proxy request via cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);

// Forward request method
$method = $_SERVER['REQUEST_METHOD'];
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// Forward headers
$headers = [];
foreach (getallheaders() as $key => $value) {
    if (strtolower($key) !== 'host') {
        $headers[] = "$key: $value";
    }
}
$headers[] = "Host: 127.0.0.1:$daemonPort";
$headers[] = "X-Forwarded-Host: " . ($_SERVER['HTTP_HOST'] ?? 'localhost');
$headers[] = "X-Forwarded-Proto: " . (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Forward body for POST/PUT/PATCH
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    $input = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
}

$response = curl_exec($ch);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$headerContent = substr($response, 0, $headerSize);
$bodyContent = substr($response, $headerSize);

http_response_code($httpCode);

// Pass through response headers (excluding Transfer-Encoding)
foreach (explode("\r\n", $headerContent) as $header) {
    if (!empty($header) && strpos(strtolower($header), 'transfer-encoding') === false) {
        header($header, false);
    }
}

echo $bodyContent;

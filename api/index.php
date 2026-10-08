<?php

declare(strict_types=1);

require __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function respond(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        respond(['message' => 'Ungültiges JSON.'], 400);
    }

    return $decoded;
}

function textValue(array $data, string $key, int $max = 255): string
{
    $value = trim((string)($data[$key] ?? ''));
    return mb_substr($value, 0, $max);
}

function nullableDateTime(?string $value): ?string
{
    if (!$value) return null;

    $normalized = str_replace('T', ' ', trim($value));
    if (strlen($normalized) === 16) {
        $normalized .= ':00';
    }

    $date = DateTime::createFromFormat('Y-m-d H:i:s', $normalized);
    return $date ? $date->format('Y-m-d H:i:s') : null;
}

function validateMatch(array $data): array
{
    $errors = [];

    $home = textValue($data, 'home_team', 120);
    $away = textValue($data, 'away_team', 120);
    $date = textValue($data, 'match_date', 10);
    $time = textValue($data, 'kickoff_time', 8);

    if ($home === '') $errors['home_team'] = 'Heimteam fehlt.';
    if ($away === '') $errors['away_team'] = 'Auswärtsteam fehlt.';
    if ($home !== '' && $away !== '' && mb_strtolower($home) === mb_strtolower($away)) {
        $errors['away_team'] = 'Heim- und Auswärtsteam müssen verschieden sein.';
    }

    $dateObject = DateTime::createFromFormat('Y-m-d', $date);
    if (!$dateObject || $dateObject->format('Y-m-d') !== $date) {
        $errors['match_date'] = 'Ungültiges Datum.';
    }

    if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $time)) {
        $errors['kickoff_time'] = 'Ungültige Anspielzeit.';
    }

    return $errors;
}

function validateTask(array $data): array
{
    $errors = [];
    $categories = ['Social Media', 'Grafik', 'Foto', 'Video', 'Text', 'Sonstiges'];
    $statuses = ['Offen', 'In Arbeit', 'Geplant', 'Erledigt', 'Überfällig'];

    if ((int)($data['match_id'] ?? 0) < 1) $errors['match_id'] = 'Match fehlt.';
    if (textValue($data, 'title', 160) === '') $errors['title'] = 'Titel fehlt.';
    if (!in_array((string)($data['category'] ?? ''), $categories, true)) $errors['category'] = 'Ungültige Kategorie.';
    if (!in_array((string)($data['status'] ?? ''), $statuses, true)) $errors['status'] = 'Ungültiger Status.';

    return $errors;
}

function requestPath(): string
{
    $request = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $base = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/api/index.php'), '/');

    if ($base !== '' && $base !== '/' && str_starts_with($request, $base)) {
        $request = substr($request, strlen($base));
    }

    return '/' . trim($request, '/');
}

function externalJson(string $url): array
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 12,
            CURLOPT_CONNECTTIMEOUT => 6,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
            CURLOPT_USERAGENT => 'M291-Matchday-Content-Planner/1.0',
        ]);

        $raw = curl_exec($ch);
        $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($raw === false || $status < 200 || $status >= 300) {
            throw new RuntimeException($error ?: "OpenLigaDB antwortet mit HTTP $status.");
        }
    } else {
        $context = stream_context_create([
            'http' => [
                'timeout' => 12,
                'header' => "Accept: application/json\r\nUser-Agent: M291-Matchday-Content-Planner/1.0\r\n",
            ],
        ]);
        $raw = @file_get_contents($url, false, $context);
        if ($raw === false) {
            throw new RuntimeException('OpenLigaDB konnte nicht erreicht werden.');
        }
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        throw new RuntimeException('OpenLigaDB lieferte ungültige Daten.');
    }

    return $decoded;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = requestPath();

try {
    if ($method === 'GET' && ($path === '/' || $path === '/health')) {
        db();
        respond(['message' => 'API erreichbar.', 'database' => 'ok']);
    }

    if ($method === 'GET' && $path === '/matches') {
        $stmt = db()->query(
            "SELECT id, external_id, home_team, away_team, competition, match_date,
                    kickoff_time, stadium, created_at
             FROM matches
             ORDER BY match_date ASC, kickoff_time ASC"
        );
        respond(['data' => $stmt->fetchAll()]);
    }

    if ($method === 'POST' && $path === '/matches') {
        $data = body();
        $errors = validateMatch($data);
        if ($errors) respond(['message' => 'Bitte prüfe die Eingaben.', 'errors' => $errors], 422);

        $externalId = isset($data['external_id']) && $data['external_id'] !== null
            ? (int)$data['external_id']
            : null;

        if ($externalId) {
            $check = db()->prepare('SELECT * FROM matches WHERE external_id = ? LIMIT 1');
            $check->execute([$externalId]);
            $existing = $check->fetch();
            if ($existing) {
                respond(['message' => 'Dieses OpenLigaDB-Spiel wurde bereits übernommen.', 'data' => $existing], 409);
            }
        }

        $stmt = db()->prepare(
            "INSERT INTO matches
             (external_id, home_team, away_team, competition, match_date, kickoff_time, stadium)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );

        $stmt->execute([
            $externalId,
            textValue($data, 'home_team', 120),
            textValue($data, 'away_team', 120),
            textValue($data, 'competition', 120),
            textValue($data, 'match_date', 10),
            textValue($data, 'kickoff_time', 8),
            textValue($data, 'stadium', 160),
        ]);

        $id = (int)db()->lastInsertId();
        $get = db()->prepare('SELECT * FROM matches WHERE id = ?');
        $get->execute([$id]);

        respond(['message' => 'Match gespeichert.', 'data' => $get->fetch()], 201);
    }

    if ($method === 'GET' && preg_match('#^/matches/(\d+)$#', $path, $match)) {
        $stmt = db()->prepare('SELECT * FROM matches WHERE id = ?');
        $stmt->execute([(int)$match[1]]);
        $row = $stmt->fetch();

        if (!$row) respond(['message' => 'Match nicht gefunden.'], 404);
        respond(['data' => $row]);
    }

    if ($method === 'GET' && $path === '/tasks') {
        $sql = "SELECT id, match_id, title, category, status, publish_time, notes, created_at
                FROM tasks";
        $params = [];

        if (isset($_GET['match_id']) && (int)$_GET['match_id'] > 0) {
            $sql .= ' WHERE match_id = ?';
            $params[] = (int)$_GET['match_id'];
        }

        $sql .= ' ORDER BY created_at DESC';
        $stmt = db()->prepare($sql);
        $stmt->execute($params);

        respond(['data' => $stmt->fetchAll()]);
    }

    if ($method === 'POST' && $path === '/tasks') {
        $data = body();
        $errors = validateTask($data);
        if ($errors) respond(['message' => 'Bitte prüfe die Eingaben.', 'errors' => $errors], 422);

        $matchCheck = db()->prepare('SELECT id FROM matches WHERE id = ?');
        $matchCheck->execute([(int)$data['match_id']]);
        if (!$matchCheck->fetch()) {
            respond(['message' => 'Das gewählte Match existiert nicht.'], 422);
        }

        $stmt = db()->prepare(
            "INSERT INTO tasks
             (match_id, title, category, status, publish_time, notes)
             VALUES (?, ?, ?, ?, ?, ?)"
        );

        $stmt->execute([
            (int)$data['match_id'],
            textValue($data, 'title', 160),
            (string)$data['category'],
            (string)$data['status'],
            nullableDateTime(isset($data['publish_time']) ? (string)$data['publish_time'] : null),
            textValue($data, 'notes', 4000),
        ]);

        $id = (int)db()->lastInsertId();
        $get = db()->prepare('SELECT * FROM tasks WHERE id = ?');
        $get->execute([$id]);

        respond(['message' => 'Aufgabe gespeichert.', 'data' => $get->fetch()], 201);
    }

    if ($method === 'PUT' && preg_match('#^/tasks/(\d+)$#', $path, $match)) {
        $data = body();
        $statuses = ['Offen', 'In Arbeit', 'Geplant', 'Erledigt', 'Überfällig'];
        $status = (string)($data['status'] ?? '');

        if (!in_array($status, $statuses, true)) {
            respond(['message' => 'Ungültiger Status.'], 422);
        }

        $stmt = db()->prepare('UPDATE tasks SET status = ? WHERE id = ?');
        $stmt->execute([$status, (int)$match[1]]);

        if ($stmt->rowCount() === 0) {
            $check = db()->prepare('SELECT id FROM tasks WHERE id = ?');
            $check->execute([(int)$match[1]]);
            if (!$check->fetch()) respond(['message' => 'Aufgabe nicht gefunden.'], 404);
        }

        $get = db()->prepare('SELECT * FROM tasks WHERE id = ?');
        $get->execute([(int)$match[1]]);

        respond(['message' => 'Status gespeichert.', 'data' => $get->fetch()]);
    }

    if ($method === 'GET' && $path === '/templates') {
        $stmt = db()->query('SELECT id, name, description, created_at FROM templates ORDER BY created_at DESC');
        respond(['data' => $stmt->fetchAll()]);
    }

    if ($method === 'POST' && $path === '/templates') {
        $data = body();
        $name = textValue($data, 'name', 140);

        if ($name === '') {
            respond(['message' => 'Bitte gib einen Namen ein.', 'errors' => ['name' => 'Name fehlt.']], 422);
        }

        $stmt = db()->prepare('INSERT INTO templates (name, description) VALUES (?, ?)');
        $stmt->execute([$name, textValue($data, 'description', 4000)]);

        $id = (int)db()->lastInsertId();
        $get = db()->prepare('SELECT * FROM templates WHERE id = ?');
        $get->execute([$id]);

        respond(['message' => 'Vorlage gespeichert.', 'data' => $get->fetch()], 201);
    }

    if ($method === 'GET' && $path === '/openliga') {
        $league = (string)($_GET['league'] ?? 'bl1');
        $season = (int)($_GET['season'] ?? date('Y'));

        if (!preg_match('/^[A-Za-z0-9_-]{1,20}$/', $league)) {
            respond(['message' => 'Ungültige Liga.'], 422);
        }

        if ($season < 2000 || $season > 2100) {
            respond(['message' => 'Ungültige Saison.'], 422);
        }

        $url = sprintf(
            'https://api.openligadb.de/getmatchdata/%s/%d',
            rawurlencode($league),
            $season
        );

        $data = externalJson($url);
        respond([
            'data' => $data,
            'source' => 'OpenLigaDB',
            'source_url' => 'https://www.openligadb.de/',
        ]);
    }

    respond(['message' => 'Endpunkt nicht gefunden.'], 404);
} catch (Throwable $error) {
    error_log($error->getMessage());
    respond(['message' => 'Serverfehler. Prüfe API-Konfiguration und Datenbank.'], 500);
}

<?php

declare(strict_types=1);

function loadEnvFile(string $path): array
{
    if (!is_file($path)) {
        throw new RuntimeException('api/.env fehlt. Kopiere api/.env.example nach api/.env.');
    }

    $values = parse_ini_file($path, false, INI_SCANNER_RAW);
    if ($values === false) {
        throw new RuntimeException('api/.env konnte nicht gelesen werden.');
    }

    return $values;
}

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $env = loadEnvFile(__DIR__ . '/.env');

    foreach (['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS'] as $key) {
        if (!array_key_exists($key, $env) || $env[$key] === '') {
            throw new RuntimeException("$key fehlt in api/.env.");
        }
    }

    $port = $env['DB_PORT'] ?? '3306';
    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        $env['DB_HOST'],
        $port,
        $env['DB_NAME']
    );

    $pdo = new PDO($dsn, $env['DB_USER'], $env['DB_PASS'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    ensureSchema($pdo);

    return $pdo;
}

function ensureSchema(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS matches (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            external_id INT NULL,
            home_team VARCHAR(120) NOT NULL,
            away_team VARCHAR(120) NOT NULL,
            competition VARCHAR(120) NOT NULL DEFAULT '',
            match_date DATE NOT NULL,
            kickoff_time TIME NOT NULL,
            stadium VARCHAR(160) NOT NULL DEFAULT '',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_match_date (match_date),
            INDEX idx_external_id (external_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS tasks (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            match_id INT UNSIGNED NOT NULL,
            title VARCHAR(160) NOT NULL,
            category VARCHAR(60) NOT NULL,
            status VARCHAR(30) NOT NULL,
            publish_time DATETIME NULL,
            notes TEXT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_task_match (match_id),
            INDEX idx_task_status (status),
            CONSTRAINT fk_tasks_match
              FOREIGN KEY (match_id) REFERENCES matches(id)
              ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS templates (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(140) NOT NULL,
            description TEXT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

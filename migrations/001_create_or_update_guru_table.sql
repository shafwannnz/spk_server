-- Migration: Create or update `guru` table to include required columns
-- Run this once in your database (backup DB first).

-- Option A: If you are creating the table from scratch (no `guru` table exists), run this:
CREATE TABLE IF NOT EXISTS `guru` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(100) NOT NULL,
  `nip` VARCHAR(50) DEFAULT NULL,
  `nuptk` VARCHAR(50) DEFAULT NULL,
  `alamat` TEXT,
  `user_id` INT DEFAULT NULL,
  `mata_pelajaran` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('Aktif','Cuti','Nonaktif') DEFAULT 'Aktif',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_id` (`user_id`),
  KEY `idx_nip` (`nip`),
  CONSTRAINT `fk_guru_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Option B: If `guru` table already exists (older schema), run the ALTER statements below.
-- These statements use `IF NOT EXISTS` for MySQL 8+. If your MySQL version doesn't support
-- `ADD COLUMN IF NOT EXISTS`, run the single `ALTER TABLE ADD COLUMN` lines manually
-- after checking the column doesn't already exist in phpMyAdmin / information_schema.

ALTER TABLE `guru` ADD COLUMN IF NOT EXISTS `nip` VARCHAR(50) DEFAULT NULL;
ALTER TABLE `guru` ADD COLUMN IF NOT EXISTS `nuptk` VARCHAR(50) DEFAULT NULL;
ALTER TABLE `guru` ADD COLUMN IF NOT EXISTS `mata_pelajaran` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `guru` ADD COLUMN IF NOT EXISTS `status` ENUM('Aktif','Cuti','Nonaktif') DEFAULT 'Aktif';
ALTER TABLE `guru` ADD COLUMN IF NOT EXISTS `alamat` TEXT;
ALTER TABLE `guru` ADD COLUMN IF NOT EXISTS `user_id` INT DEFAULT NULL;

-- Ensure foreign key to users exists (optional). If a foreign key with same name exists,
-- this will fail; only run if you need to add FK.
-- ALTER TABLE `guru` ADD CONSTRAINT `fk_guru_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL;

-- Verify that `penilaian` table references `guru(id)` via `id_guru`.
-- If `penilaian` already exists and has the FK, nothing to do. If not, add FK:
-- ALTER TABLE `penilaian` ADD CONSTRAINT `fk_penilaian_guru` FOREIGN KEY (`id_guru`) REFERENCES `guru`(`id`) ON DELETE CASCADE;

/* Usage notes:
- Backup your DB before running.
- If your MySQL version does not accept `ADD COLUMN IF NOT EXISTS`, remove the `IF NOT EXISTS`
  or run the `ALTER TABLE ADD COLUMN` for each column only if it is not present.
- After running migration, restart Node server (app.js) and re-test the frontend.
*/
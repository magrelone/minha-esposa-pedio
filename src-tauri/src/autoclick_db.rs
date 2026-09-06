use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AutoClickRunRecord {
    pub id: String,
    pub profile_id: Option<String>,
    pub profile_name: String,
    pub started_at: String,
    pub finished_at: String,
    pub duration_seconds: f64,
    pub click_count: u64,
    pub target_cps: f64,
    pub status: String,      // "completed", "stopped", "panic_stopped", "error"
    pub stop_reason: String,
}

pub struct AutoClickDatabase {
    conn: Mutex<Connection>,
}

impl AutoClickDatabase {
    pub fn new(db_path: PathBuf) -> Result<Self> {
        if let Some(parent) = db_path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        let conn = Connection::open(db_path)?;
        let db = Self {
            conn: Mutex::new(conn),
        };
        db.init_schema()?;
        Ok(db)
    }

    fn init_schema(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();

        // 1. autoclick_profiles
        conn.execute(
            "CREATE TABLE IF NOT EXISTS autoclick_profiles (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                click_mode TEXT NOT NULL,
                interval_ms REAL NOT NULL,
                cps REAL NOT NULL,
                mouse_button TEXT NOT NULL,
                repeat_mode TEXT NOT NULL,
                repeat_count INTEGER,
                is_favorite INTEGER DEFAULT 0,
                config_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );",
            [],
        )?;

        // 2. autoclick_actions
        conn.execute(
            "CREATE TABLE IF NOT EXISTS autoclick_actions (
                id TEXT PRIMARY KEY,
                profile_id TEXT,
                action_type TEXT NOT NULL,
                order_index INTEGER NOT NULL,
                delay_before_ms REAL NOT NULL,
                duration_ms REAL DEFAULT 0,
                payload_json TEXT NOT NULL
            );",
            [],
        )?;

        // 3. autoclick_points
        conn.execute(
            "CREATE TABLE IF NOT EXISTS autoclick_points (
                id TEXT PRIMARY KEY,
                profile_id TEXT,
                order_index INTEGER NOT NULL,
                x INTEGER NOT NULL,
                y INTEGER NOT NULL,
                monitor_index INTEGER DEFAULT 0,
                button TEXT NOT NULL,
                click_type TEXT NOT NULL,
                delay_before_ms REAL NOT NULL,
                delay_after_ms REAL NOT NULL,
                repeat_times INTEGER DEFAULT 1,
                enabled INTEGER DEFAULT 1
            );",
            [],
        )?;

        // 4. autoclick_hotkeys
        conn.execute(
            "CREATE TABLE IF NOT EXISTS autoclick_hotkeys (
                action_id TEXT PRIMARY KEY,
                key_combination TEXT NOT NULL,
                description TEXT
            );",
            [],
        )?;

        // 5. autoclick_history
        conn.execute(
            "CREATE TABLE IF NOT EXISTS autoclick_history (
                id TEXT PRIMARY KEY,
                profile_id TEXT,
                profile_name TEXT NOT NULL,
                started_at TEXT NOT NULL,
                finished_at TEXT NOT NULL,
                duration_seconds REAL NOT NULL,
                click_count INTEGER NOT NULL,
                target_cps REAL NOT NULL,
                status TEXT NOT NULL,
                stop_reason TEXT NOT NULL
            );",
            [],
        )?;

        // 6. autoclick_runs
        conn.execute(
            "CREATE TABLE IF NOT EXISTS autoclick_runs (
                run_id TEXT PRIMARY KEY,
                profile_id TEXT,
                started_at TEXT NOT NULL,
                finished_at TEXT,
                action_count INTEGER DEFAULT 0,
                click_count INTEGER DEFAULT 0,
                status TEXT NOT NULL,
                stop_reason TEXT
            );",
            [],
        )?;

        // 7. autoclick_schedules
        conn.execute(
            "CREATE TABLE IF NOT EXISTS autoclick_schedules (
                id TEXT PRIMARY KEY,
                profile_id TEXT NOT NULL,
                scheduled_time TEXT NOT NULL,
                duration_minutes INTEGER,
                status TEXT NOT NULL DEFAULT 'pending'
            );",
            [],
        )?;

        // 8. autoclick_settings
        conn.execute(
            "CREATE TABLE IF NOT EXISTS autoclick_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );",
            [],
        )?;

        Ok(())
    }

    pub fn insert_history(&self, record: &AutoClickRunRecord) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO autoclick_history (
                id, profile_id, profile_name, started_at, finished_at,
                duration_seconds, click_count, target_cps, status, stop_reason
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                record.id,
                record.profile_id,
                record.profile_name,
                record.started_at,
                record.finished_at,
                record.duration_seconds,
                record.click_count,
                record.target_cps,
                record.status,
                record.stop_reason
            ],
        )?;
        Ok(())
    }

    pub fn get_recent_history(&self, limit: usize) -> Result<Vec<AutoClickRunRecord>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, profile_id, profile_name, started_at, finished_at,
                    duration_seconds, click_count, target_cps, status, stop_reason
             FROM autoclick_history
             ORDER BY started_at DESC
             LIMIT ?1",
        )?;

        let rows = stmt.query_map(params![limit as i64], |row| {
            Ok(AutoClickRunRecord {
                id: row.get(0)?,
                profile_id: row.get(1)?,
                profile_name: row.get(2)?,
                started_at: row.get(3)?,
                finished_at: row.get(4)?,
                duration_seconds: row.get(5)?,
                click_count: row.get::<_, i64>(6)? as u64,
                target_cps: row.get(7)?,
                status: row.get(8)?,
                stop_reason: row.get(9)?,
            })
        })?;

        let mut results = Vec::new();
        for r in rows {
            results.push(r?);
        }
        Ok(results)
    }

    pub fn clear_history(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM autoclick_history", [])?;
        Ok(())
    }
}

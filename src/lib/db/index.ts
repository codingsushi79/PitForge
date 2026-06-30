import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePostgres } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import * as sqliteSchema from "./schema";
import * as pgSchema from "./schema.pg";

export const isPostgres = !!process.env.DATABASE_URL;

type AppDb = ReturnType<typeof drizzleSqlite<typeof sqliteSchema>>;

function createDb(): AppDb {
  if (isPostgres) {
    const sql = neon(process.env.DATABASE_URL!);
    return drizzlePostgres(sql, { schema: pgSchema }) as unknown as AppDb;
  }

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const uploadsDir = path.join(dataDir, "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const sqlite = new Database(path.join(dataDir, "app.db"));
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  initSqlite(sqlite);
  return drizzleSqlite(sqlite, { schema: sqliteSchema });
}

function initSqlite(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
      password_hash TEXT NOT NULL, created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_id TEXT NOT NULL REFERENCES users(id),
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY, team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id), role TEXT NOT NULL, joined_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS lineups (
      id TEXT PRIMARY KEY, team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      name TEXT NOT NULL, car_class TEXT NOT NULL, created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS drivers (
      id TEXT PRIMARY KEY, lineup_id TEXT NOT NULL REFERENCES lineups(id) ON DELETE CASCADE,
      name TEXT NOT NULL, color TEXT NOT NULL DEFAULT '#e85d04', sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS race_plans (
      id TEXT PRIMARY KEY, team_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
      user_id TEXT NOT NULL REFERENCES users(id), lineup_id TEXT REFERENCES lineups(id) ON DELETE SET NULL,
      name TEXT NOT NULL, track_id TEXT NOT NULL, track_layout TEXT NOT NULL,
      race_duration_minutes INTEGER NOT NULL DEFAULT 360, start_time TEXT, timezone TEXT DEFAULT 'UTC',
      car_class TEXT NOT NULL DEFAULT 'Hypercar', fuel_per_lap REAL DEFAULT 2.8, tank_capacity REAL DEFAULT 90,
      virtual_energy_per_lap REAL DEFAULT 1.0, pit_loss_seconds REAL DEFAULT 45, avg_lap_time_seconds REAL DEFAULT 105,
      tyre_sets_total INTEGER DEFAULT 12, stints_json TEXT NOT NULL DEFAULT '[]', notes TEXT,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS setup_files (
      id TEXT PRIMARY KEY, team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      uploaded_by TEXT NOT NULL REFERENCES users(id), name TEXT NOT NULL, car_class TEXT NOT NULL,
      track_id TEXT, filename TEXT NOT NULL, file_path TEXT NOT NULL, description TEXT, created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS telemetry_sessions (
      id TEXT PRIMARY KEY, race_plan_id TEXT REFERENCES race_plans(id) ON DELETE SET NULL,
      team_id TEXT REFERENCES teams(id) ON DELETE SET NULL, user_id TEXT NOT NULL REFERENCES users(id),
      share_code TEXT NOT NULL UNIQUE, track_id TEXT, status TEXT NOT NULL DEFAULT 'active', created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS telemetry_snapshots (
      id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES telemetry_sessions(id) ON DELETE CASCADE,
      data_json TEXT NOT NULL, created_at INTEGER NOT NULL
    );
  `);
}

export const db = createDb();

const s = sqliteSchema;
export const users = (isPostgres ? pgSchema.users : s.users) as typeof s.users;
export const teams = (isPostgres ? pgSchema.teams : s.teams) as typeof s.teams;
export const teamMembers = (isPostgres ? pgSchema.teamMembers : s.teamMembers) as typeof s.teamMembers;
export const lineups = (isPostgres ? pgSchema.lineups : s.lineups) as typeof s.lineups;
export const drivers = (isPostgres ? pgSchema.drivers : s.drivers) as typeof s.drivers;
export const racePlans = (isPostgres ? pgSchema.racePlans : s.racePlans) as typeof s.racePlans;
export const setupFiles = (isPostgres ? pgSchema.setupFiles : s.setupFiles) as typeof s.setupFiles;
export const telemetrySessions = (isPostgres ? pgSchema.telemetrySessions : s.telemetrySessions) as typeof s.telemetrySessions;
export const telemetrySnapshots = (isPostgres ? pgSchema.telemetrySnapshots : s.telemetrySnapshots) as typeof s.telemetrySnapshots;

export type { User, Team, RacePlan, Driver, Lineup } from "./schema.pg";

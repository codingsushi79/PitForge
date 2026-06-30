import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const teams = sqliteTable("teams", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const teamMembers = sqliteTable("team_members", {
  id: text("id").primaryKey(),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  role: text("role", { enum: ["owner", "admin", "member"] }).notNull(),
  joinedAt: integer("joined_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const lineups = sqliteTable("lineups", {
  id: text("id").primaryKey(),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  carClass: text("car_class").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const drivers = sqliteTable("drivers", {
  id: text("id").primaryKey(),
  lineupId: text("lineup_id")
    .notNull()
    .references(() => lineups.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#3b82f6"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const racePlans = sqliteTable("race_plans", {
  id: text("id").primaryKey(),
  teamId: text("team_id").references(() => teams.id, { onDelete: "set null" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  lineupId: text("lineup_id").references(() => lineups.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  trackId: text("track_id").notNull(),
  trackLayout: text("track_layout").notNull(),
  raceDurationMinutes: integer("race_duration_minutes").notNull().default(360),
  startTime: text("start_time"),
  timezone: text("timezone").default("UTC"),
  carClass: text("car_class").notNull().default("Hypercar"),
  fuelPerLap: real("fuel_per_lap").default(2.8),
  tankCapacity: real("tank_capacity").default(90),
  virtualEnergyPerLap: real("virtual_energy_per_lap").default(1.0),
  pitLossSeconds: real("pit_loss_seconds").default(45),
  avgLapTimeSeconds: real("avg_lap_time_seconds").default(105),
  tyreSetsTotal: integer("tyre_sets_total").default(12),
  stintsJson: text("stints_json").notNull().default("[]"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const setupFiles = sqliteTable("setup_files", {
  id: text("id").primaryKey(),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  carClass: text("car_class").notNull(),
  trackId: text("track_id"),
  filename: text("filename").notNull(),
  filePath: text("file_path").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const telemetrySessions = sqliteTable("telemetry_sessions", {
  id: text("id").primaryKey(),
  racePlanId: text("race_plan_id").references(() => racePlans.id, {
    onDelete: "set null",
  }),
  teamId: text("team_id").references(() => teams.id, { onDelete: "set null" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  shareCode: text("share_code").notNull().unique(),
  trackId: text("track_id"),
  status: text("status", { enum: ["active", "ended"] })
    .notNull()
    .default("active"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const telemetrySnapshots = sqliteTable("telemetry_snapshots", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => telemetrySessions.id, { onDelete: "cascade" }),
  dataJson: text("data_json").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type RacePlan = typeof racePlans.$inferSelect;
export type Driver = typeof drivers.$inferSelect;
export type Lineup = typeof lineups.$inferSelect;

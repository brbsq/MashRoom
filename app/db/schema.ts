import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  googleId: text("google_id").notNull().unique(),
  name: text("name").notNull(),
  pet: text("pet"),
  adopted: integer("adopted").notNull().default(0),
});
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  expires: integer("expires").notNull(),
});
export const oauthFlows = sqliteTable("oauth_flows", {
  id: text("id").primaryKey(),
  verifier: text("verifier").notNull(),
  purpose: text("purpose").notNull(),
  userId: text("user_id"),
  expires: integer("expires").notNull(),
});
export const connections = sqliteTable("connections", {
  userId: text("user_id").primaryKey(),
  access: text("access").notNull(),
  refresh: text("refresh"),
  expires: integer("expires").notNull(),
  scope: text("scope").notNull(),
  status: text("status").notNull(),
});
export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  section: text("section"),
  importedAt: integer("imported_at").notNull(),
});
export const members = sqliteTable(
  "members",
  {
    courseId: text("course_id").notNull(),
    googleId: text("google_id").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull(),
  },
  (t) => [primaryKey({ columns: [t.courseId, t.googleId] })],
);
export const assignments = sqliteTable(
  "assignments",
  {
    courseId: text("course_id").notNull(),
    id: text("id").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    due: text("due"),
    url: text("url").notNull(),
  },
  (t) => [primaryKey({ columns: [t.courseId, t.id] })],
);

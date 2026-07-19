import { pgTable, text, varchar, integer, timestamp, pgEnum, bigint, boolean, jsonb } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role_enum", ["super_admin", "admin"]);
export const statusEnum = pgEnum("status_enum", ["active", "inactive"]);
export const presentationStatusEnum = pgEnum("presentation_status_enum", ["pending", "completed"]);

export const admins = pgTable("admins", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default("admin").notNull(),
  status: statusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

export const uploads = pgTable("uploads", {
  id: text("id").primaryKey(),
  adminId: text("admin_id").references(() => admins.id, { onDelete: "set null" }),
  studentName: varchar("student_name", { length: 255 }).notNull(),
  registerNumber: varchar("register_number", { length: 100 }).notNull(),
  department: varchar("department", { length: 100 }).notNull(),
  year: varchar("year", { length: 20 }).notNull(),
  section: varchar("section", { length: 20 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  originalFileName: varchar("original_file_name", { length: 500 }).notNull(),
  displayFileName: varchar("display_file_name", { length: 500 }).notNull(),
  cloudinaryUrl: text("cloudinary_url").notNull(),
  cloudinaryPublicId: text("cloudinary_public_id").notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull(),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
  presentationStatus: presentationStatusEnum("presentation_status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const appSettings = pgTable("app_settings", {
  id: text("id").primaryKey().default("main"),
  uploadDeadline: timestamp("upload_deadline"),
  maxFileSizeMb: integer("max_file_size_mb").default(1024).notNull(),
  allowedFileTypes: text("allowed_file_types").default("pdf,ppt,pptx,doc,docx,jpg,jpeg,png,zip").notNull(),
  classroomName: varchar("classroom_name", { length: 255 }).default("ClassShare Classroom"),
  storageUsed: bigint("storage_used", { mode: "number" }).default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const qrTokens = pgTable("qr_tokens", {
  id: text("id").primaryKey(),
  adminId: text("admin_id").notNull().references(() => admins.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: text("id").primaryKey(),
  adminId: text("admin_id").references(() => admins.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
export type Upload = typeof uploads.$inferSelect;
export type NewUpload = typeof uploads.$inferInsert;
export type AppSetting = typeof appSettings.$inferSelect;
export type QrToken = typeof qrTokens.$inferSelect;
export type NewQrToken = typeof qrTokens.$inferInsert;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;

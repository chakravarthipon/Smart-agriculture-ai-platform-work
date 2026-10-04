import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  real,
  boolean,
  jsonb,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== USERS ====================
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    mobile: varchar("mobile", { length: 20 }),
    avatarUrl: text("avatar_url"),
    role: varchar("role", { length: 20 }).default("user").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
  ]
);

// ==================== USER PREFERENCES ====================
export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  language: varchar("language", { length: 10 }).default("en").notNull(),
  theme: varchar("theme", { length: 20 }).default("light").notNull(),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  pushNotifications: boolean("push_notifications").default(true).notNull(),
  detectionAlerts: boolean("detection_alerts").default(true).notNull(),
  monitoringAlerts: boolean("monitoring_alerts").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ==================== CROPS ====================
export const crops = pgTable(
  "crops",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    variety: varchar("variety", { length: 255 }),
    plantingDate: timestamp("planting_date", { withTimezone: true }),
    fieldName: varchar("field_name", { length: 255 }),
    location: varchar("location", { length: 500 }),
    notes: text("notes"),
    status: varchar("status", { length: 50 }).default("healthy").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("crops_user_id_idx").on(table.userId)]
);

// ==================== DETECTIONS ====================
export const detections = pgTable(
  "detections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cropId: uuid("crop_id").references(() => crops.id, {
      onDelete: "set null",
    }),
    imagePath: text("image_path").notNull(),
    predictedClass: varchar("predicted_class", { length: 255 }).notNull(),
    diseaseName: varchar("disease_name", { length: 255 }),
    cropName: varchar("crop_name", { length: 255 }),
    confidence: real("confidence").notNull(),
    status: varchar("status", { length: 50 }).default("completed").notNull(),
    topPredictions: jsonb("top_predictions"),
    recommendations: jsonb("recommendations"),
    modelVersion: varchar("model_version", { length: 50 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("detections_user_id_idx").on(table.userId),
    index("detections_crop_id_idx").on(table.cropId),
    index("detections_created_at_idx").on(table.createdAt),
  ]
);

// ==================== MONITORING RECORDS ====================
export const monitoringRecords = pgTable(
  "monitoring_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cropId: uuid("crop_id")
      .notNull()
      .references(() => crops.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    status: varchar("status", { length: 50 }).default("active").notNull(),
    alertRules: jsonb("alert_rules"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("monitoring_records_user_id_idx").on(table.userId),
    index("monitoring_records_crop_id_idx").on(table.cropId),
  ]
);

// ==================== MONITORING OBSERVATIONS ====================
export const monitoringObservations = pgTable(
  "monitoring_observations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    monitoringId: uuid("monitoring_id")
      .notNull()
      .references(() => monitoringRecords.id, { onDelete: "cascade" }),
    detectionId: uuid("detection_id").references(() => detections.id, {
      onDelete: "set null",
    }),
    imagePath: text("image_path"),
    predictedClass: varchar("predicted_class", { length: 255 }),
    diseaseName: varchar("disease_name", { length: 255 }),
    confidence: real("confidence"),
    notes: text("notes"),
    observedAt: timestamp("observed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("monitoring_observations_monitoring_id_idx").on(table.monitoringId),
  ]
);

// ==================== DISEASE INFORMATION ====================
export const diseaseInformation = pgTable(
  "disease_information",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    diseaseKey: varchar("disease_key", { length: 255 }).notNull(),
    diseaseName: varchar("disease_name", { length: 255 }).notNull(),
    cropName: varchar("crop_name", { length: 255 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    severity: varchar("severity", { length: 50 }).default("moderate").notNull(),
    overview: text("overview"),
    symptoms: jsonb("symptoms"),
    causes: jsonb("causes"),
    conditions: jsonb("conditions"),
    prevention: jsonb("prevention"),
    management: jsonb("management"),
    suggestedActions: jsonb("suggested_actions"),
    isHealthy: boolean("is_healthy").default(false).notNull(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("disease_information_disease_key_idx").on(table.diseaseKey),
    index("disease_information_crop_name_idx").on(table.cropName),
  ]
);

// ==================== NOTIFICATIONS ====================
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_is_read_idx").on(table.isRead),
  ]
);

// ==================== MODEL VERSIONS ====================
export const modelVersions = pgTable("model_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  version: varchar("version", { length: 50 }).notNull(),
  modelName: varchar("model_name", { length: 255 }).notNull(),
  architecture: varchar("architecture", { length: 100 }),
  numClasses: integer("num_classes"),
  accuracy: real("accuracy"),
  precision: real("precision"),
  recall: real("recall"),
  f1Score: real("f1_score"),
  classLabels: jsonb("class_labels"),
  config: jsonb("config"),
  isActive: boolean("is_active").default(false).notNull(),
  trainedAt: timestamp("trained_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ==================== RELATIONS ====================
export const usersRelations = relations(users, ({ many, one }) => ({
  crops: many(crops),
  detections: many(detections),
  monitoringRecords: many(monitoringRecords),
  notifications: many(notifications),
  preferences: one(userPreferences),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, { fields: [userPreferences.userId], references: [users.id] }),
}));

export const cropsRelations = relations(crops, ({ one, many }) => ({
  user: one(users, { fields: [crops.userId], references: [users.id] }),
  detections: many(detections),
  monitoringRecords: many(monitoringRecords),
}));

export const detectionsRelations = relations(detections, ({ one }) => ({
  user: one(users, { fields: [detections.userId], references: [users.id] }),
  crop: one(crops, { fields: [detections.cropId], references: [crops.id] }),
}));

export const monitoringRecordsRelations = relations(monitoringRecords, ({ one, many }) => ({
  user: one(users, { fields: [monitoringRecords.userId], references: [users.id] }),
  crop: one(crops, { fields: [monitoringRecords.cropId], references: [crops.id] }),
  observations: many(monitoringObservations),
}));

export const monitoringObservationsRelations = relations(monitoringObservations, ({ one }) => ({
  monitoringRecord: one(monitoringRecords, {
    fields: [monitoringObservations.monitoringId],
    references: [monitoringRecords.id],
  }),
  detection: one(detections, {
    fields: [monitoringObservations.detectionId],
    references: [detections.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));
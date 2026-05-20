import { pgTable, serial, varchar, timestamp, boolean, integer, numeric, text, jsonb, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 系统健康检查表（禁止删除）
export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 用户表
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 64 }).notNull().unique(),
  password_hash: varchar("password_hash", { length: 256 }).notNull(),
  name: varchar("name", { length: 64 }).notNull(),
  role: varchar("role", { length: 32 }).notNull().default("county_admin"), // county_admin / township_admin / lab_staff / enterprise / sys_admin
  township: varchar("township", { length: 64 }),
  phone: varchar("phone", { length: 20 }),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("users_role_idx").on(table.role),
  index("users_township_idx").on(table.township),
]);

// 制种企业备案表
export const enterprises = pgTable("enterprises", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 128 }).notNull(),
  unified_social_code: varchar("unified_social_code", { length: 32 }).notNull().unique(),
  legal_person: varchar("legal_person", { length: 64 }).notNull(),
  contact_phone: varchar("contact_phone", { length: 20 }).notNull(),
  address: varchar("address", { length: 256 }),
  qualification_url: varchar("qualification_url", { length: 512 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending / approved / rejected
  reviewer_id: varchar("reviewer_id", { length: 36 }),
  reviewed_at: timestamp("reviewed_at", { withTimezone: true }),
  reject_reason: varchar("reject_reason", { length: 512 }),
  created_by: varchar("created_by", { length: 36 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_by: varchar("updated_by", { length: 36 }),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("enterprises_status_idx").on(table.status),
  index("enterprises_created_by_idx").on(table.created_by),
]);

// 制种合同备案表
export const contracts = pgTable("contracts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  enterprise_id: varchar("enterprise_id", { length: 36 }).notNull().references(() => enterprises.id),
  contract_no: varchar("contract_no", { length: 64 }).notNull(),
  contract_file_url: varchar("contract_file_url", { length: 512 }),
  contract_date: varchar("contract_date", { length: 20 }),
  area_info: varchar("area_info", { length: 256 }),
  township: varchar("township", { length: 64 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending / approved / rejected
  created_by: varchar("created_by", { length: 36 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_by: varchar("updated_by", { length: 36 }),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("contracts_enterprise_id_idx").on(table.enterprise_id),
  index("contracts_status_idx").on(table.status),
  index("contracts_township_idx").on(table.township),
]);

// 亲本种子信息备案表
export const parentSeeds = pgTable("parent_seeds", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  enterprise_id: varchar("enterprise_id", { length: 36 }).notNull().references(() => enterprises.id),
  variety_name: varchar("variety_name", { length: 128 }).notNull(),
  batch_no: varchar("batch_no", { length: 64 }).notNull(),
  source: varchar("source", { length: 128 }),
  quantity: numeric("quantity", { precision: 12, scale: 2 }),
  unit: varchar("unit", { length: 16 }).default("kg"),
  parent_type: varchar("parent_type", { length: 16 }).notNull(), // 父本 / 母本
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending / submitted / testing
  created_by: varchar("created_by", { length: 36 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_by: varchar("updated_by", { length: 36 }),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("parent_seeds_enterprise_id_idx").on(table.enterprise_id),
  index("parent_seeds_status_idx").on(table.status),
  index("parent_seeds_batch_no_idx").on(table.batch_no),
]);

// 乡镇制种明细表
export const townshipDetails = pgTable("township_details", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  township: varchar("township", { length: 64 }).notNull(),
  serial_no: integer("serial_no"),
  farmer_name: varchar("farmer_name", { length: 64 }).notNull(),
  field_no: varchar("field_no", { length: 64 }).notNull(),
  area: numeric("area", { precision: 10, scale: 2 }),
  company: varchar("company", { length: 128 }),
  variety: varchar("variety", { length: 128 }),
  created_by: varchar("created_by", { length: 36 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("township_details_township_idx").on(table.township),
  index("township_details_field_no_idx").on(table.field_no),
]);

// 抽检任务表
export const samplingTasks = pgTable("sampling_tasks", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  task_no: varchar("task_no", { length: 64 }).notNull().unique(),
  task_type: varchar("task_type", { length: 32 }).notNull(), // parent_seed / sowing / leaf
  township: varchar("township", { length: 64 }),
  variety: varchar("variety", { length: 128 }),
  target_count: integer("target_count").default(0),
  completed_count: integer("completed_count").default(0),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending / in_progress / completed / cancelled
  assigned_to: varchar("assigned_to", { length: 36 }),
  sampling_detail: jsonb("sampling_detail"), // 存储抽检明细（保密信息）
  created_by: varchar("created_by", { length: 36 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_by: varchar("updated_by", { length: 36 }),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("sampling_tasks_task_type_idx").on(table.task_type),
  index("sampling_tasks_status_idx").on(table.status),
  index("sampling_tasks_township_idx").on(table.township),
  index("sampling_tasks_assigned_to_idx").on(table.assigned_to),
]);

// 扦样单表
export const samplingRecords = pgTable("sampling_records", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  task_id: varchar("task_id", { length: 36 }).notNull().references(() => samplingTasks.id),
  sample_no: varchar("sample_no", { length: 64 }).notNull().unique(),
  field_no: varchar("field_no", { length: 64 }),
  area: numeric("area", { precision: 10, scale: 2 }),
  variety: varchar("variety", { length: 128 }),
  parent_type: varchar("parent_type", { length: 16 }), // 父本 / 母本
  quantity: numeric("quantity", { precision: 10, scale: 2 }),
  longitude: numeric("longitude", { precision: 12, scale: 8 }),
  latitude: numeric("latitude", { precision: 12, scale: 8 }),
  photo_urls: jsonb("photo_urls"), // 照片URL数组
  sampling_method: varchar("sampling_method", { length: 32 }), // diagonal / zigzag
  township: varchar("township", { length: 64 }),
  sampler_id: varchar("sampler_id", { length: 36 }),
  sampling_date: timestamp("sampling_date", { withTimezone: true }),
  status: varchar("status", { length: 20 }).notNull().default("sampled"), // sampled / received / testing / completed
  created_by: varchar("created_by", { length: 36 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_by: varchar("updated_by", { length: 36 }),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("sampling_records_task_id_idx").on(table.task_id),
  index("sampling_records_sample_no_idx").on(table.sample_no),
  index("sampling_records_status_idx").on(table.status),
  index("sampling_records_township_idx").on(table.township),
]);

// 亲本接样单表
export const sampleReceiving = pgTable("sample_receiving", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  sample_no: varchar("sample_no", { length: 64 }).notNull().references(() => samplingRecords.sample_no),
  received_by: varchar("received_by", { length: 36 }),
  received_at: timestamp("received_at", { withTimezone: true }),
  storage_location: varchar("storage_location", { length: 128 }),
  barcode: varchar("barcode", { length: 64 }),
  status: varchar("status", { length: 20 }).notNull().default("received"), // received / in_storage / testing
  created_by: varchar("created_by", { length: 36 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("sample_receiving_sample_no_idx").on(table.sample_no),
  index("sample_receiving_status_idx").on(table.status),
]);

// 检测结果表
export const testResults = pgTable("test_results", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  sample_no: varchar("sample_no", { length: 64 }).notNull(),
  test_type: varchar("test_type", { length: 32 }).notNull(), // gmo / purity / germination
  result: varchar("result", { length: 16 }).notNull(), // negative / positive / pending
  test_photo_urls: jsonb("test_photo_urls"),
  fridge_location: varchar("fridge_location", { length: 64 }),
  tester_id: varchar("tester_id", { length: 36 }),
  test_date: timestamp("test_date", { withTimezone: true }),
  report_id: varchar("report_id", { length: 36 }),
  created_by: varchar("created_by", { length: 36 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_by: varchar("updated_by", { length: 36 }),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("test_results_sample_no_idx").on(table.sample_no),
  index("test_results_test_type_idx").on(table.test_type),
  index("test_results_result_idx").on(table.result),
]);

// 检验报告表
export const reports = pgTable("reports", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  report_no: varchar("report_no", { length: 64 }).notNull().unique(),
  sample_no: varchar("sample_no", { length: 64 }).notNull(),
  enterprise_id: varchar("enterprise_id", { length: 36 }).references(() => enterprises.id),
  test_result: varchar("test_result", { length: 16 }),
  report_file_url: varchar("report_file_url", { length: 512 }),
  is_signed: boolean("is_signed").default(false),
  sign_date: timestamp("sign_date", { withTimezone: true }),
  created_by: varchar("created_by", { length: 36 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("reports_sample_no_idx").on(table.sample_no),
  index("reports_enterprise_id_idx").on(table.enterprise_id),
  index("reports_created_at_idx").on(table.created_at),
]);

// 复检任务表
export const retestTasks = pgTable("retest_tasks", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  original_task_id: varchar("original_task_id", { length: 36 }).notNull().references(() => samplingTasks.id),
  original_sample_no: varchar("original_sample_no", { length: 64 }).notNull(),
  reason: varchar("reason", { length: 512 }),
  retest_result: varchar("retest_result", { length: 16 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending / in_progress / completed
  assigned_to: varchar("assigned_to", { length: 36 }),
  created_by: varchar("created_by", { length: 36 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_by: varchar("updated_by", { length: 36 }),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("retest_tasks_original_task_id_idx").on(table.original_task_id),
  index("retest_tasks_status_idx").on(table.status),
]);

// 企业自检数据表
export const enterpriseSelfTests = pgTable("enterprise_self_tests", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  enterprise_id: varchar("enterprise_id", { length: 36 }).notNull().references(() => enterprises.id),
  batch_no: varchar("batch_no", { length: 64 }),
  test_report_url: varchar("test_report_url", { length: 512 }),
  test_date: varchar("test_date", { length: 20 }),
  test_result: varchar("test_result", { length: 16 }),
  created_by: varchar("created_by", { length: 36 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("enterprise_self_tests_enterprise_id_idx").on(table.enterprise_id),
]);

// 阳性预警表
export const alerts = pgTable("alerts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  sample_no: varchar("sample_no", { length: 64 }).notNull(),
  field_no: varchar("field_no", { length: 64 }),
  township: varchar("township", { length: 64 }),
  variety: varchar("variety", { length: 128 }),
  alert_type: varchar("alert_type", { length: 32 }).notNull().default("positive"), // positive / abnormal
  status: varchar("status", { length: 20 }).notNull().default("unhandled"), // unhandled / handled
  handler_id: varchar("handler_id", { length: 36 }),
  handled_at: timestamp("handled_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("alerts_status_idx").on(table.status),
  index("alerts_township_idx").on(table.township),
  index("alerts_created_at_idx").on(table.created_at),
]);

// 数据字典表
export const dataDictionary = pgTable("data_dictionary", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  category: varchar("category", { length: 64 }).notNull(),
  code: varchar("code", { length: 64 }).notNull(),
  label: varchar("label", { length: 128 }).notNull(),
  sort_order: integer("sort_order").default(0),
  status: varchar("status", { length: 16 }).notNull().default("active"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("data_dictionary_category_idx").on(table.category),
]);

// 操作日志表
export const operationLogs = pgTable("operation_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id", { length: 36 }),
  user_name: varchar("user_name", { length: 64 }),
  action: varchar("action", { length: 64 }).notNull(),
  module: varchar("module", { length: 64 }),
  detail: text("detail"),
  ip_address: varchar("ip_address", { length: 45 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("operation_logs_user_id_idx").on(table.user_id),
  index("operation_logs_module_idx").on(table.module),
  index("operation_logs_created_at_idx").on(table.created_at),
]);

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, date, time, pgEnum, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "doctor", "patient"]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const appointmentStatusEnum = pgEnum("appointment_status", ["scheduled", "completed", "cancelled", "no_show"]);
export const bedStatusEnum = pgEnum("bed_status", ["available", "occupied", "maintenance"]);
export const testOrderStatusEnum = pgEnum("test_order_status", ["ordered", "collected", "reported"]);
export const billStatusEnum = pgEnum("bill_status", ["pending", "paid", "overdue", "cancelled"]);
export const alertSeverityEnum = pgEnum("alert_severity", ["low", "medium", "high", "critical"]);
export const referralStatusEnum = pgEnum("referral_status", ["pending", "accepted", "completed", "cancelled"]);
export const messageStatusEnum = pgEnum("message_status", ["sent", "delivered", "read"]);
export const refillStatusEnum = pgEnum("refill_status", ["requested", "approved", "denied", "completed"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("patient"),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Departments table
export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  floor: integer("floor"),
  headDoctorId: varchar("head_doctor_id"),
});

// Doctors table
export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  departmentId: varchar("department_id").references(() => departments.id),
  specialization: text("specialization").notNull(),
  licenseNumber: varchar("license_number", { length: 50 }).notNull().unique(),
  yearsOfExperience: integer("years_of_experience"),
});

// Nurses table
export const nurses = pgTable("nurses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  departmentId: varchar("department_id").references(() => departments.id),
  licenseNumber: varchar("license_number", { length: 50 }).notNull().unique(),
  shift: text("shift"),
});

// Technicians table
export const technicians = pgTable("technicians", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  departmentId: varchar("department_id").references(() => departments.id),
  specialization: text("specialization").notNull(),
  certificationNumber: varchar("certification_number", { length: 50 }).notNull().unique(),
});

// Patients table
export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: genderEnum("gender").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: text("email"),
  address: text("address"),
  bloodGroup: varchar("blood_group", { length: 5 }),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
  medicalHistory: text("medical_history"),
  allergies: text("allergies"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Rooms table
export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomNumber: varchar("room_number", { length: 20 }).notNull().unique(),
  departmentId: varchar("department_id").references(() => departments.id),
  roomType: text("room_type").notNull(),
  floor: integer("floor").notNull(),
  capacity: integer("capacity").notNull().default(1),
});

// Beds table
export const beds = pgTable("beds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  bedNumber: varchar("bed_number", { length: 20 }).notNull(),
  status: bedStatusEnum("status").notNull().default("available"),
  patientId: varchar("patient_id").references(() => patients.id),
  assignedDate: timestamp("assigned_date"),
});

// Recurring Appointment Settings table
export const recurringAppointments = pgTable("recurring_appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  doctorId: varchar("doctor_id").notNull().references(() => doctors.id),
  frequencyDays: integer("frequency_days").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  reason: text("reason"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  patientIdx: index("recurring_appointments_patient_idx").on(table.patientId),
  doctorIdx: index("recurring_appointments_doctor_idx").on(table.doctorId),
}));

// Appointments table
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  doctorId: varchar("doctor_id").notNull().references(() => doctors.id),
  appointmentDate: date("appointment_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  status: appointmentStatusEnum("status").notNull().default("scheduled"),
  reason: text("reason"),
  notes: text("notes"),
  preVisitNotes: text("pre_visit_notes"),
  postVisitNotes: text("post_visit_notes"),
  isEmergency: integer("is_emergency").notNull().default(0),
  recurringAppointmentId: varchar("recurring_appointment_id").references(() => recurringAppointments.id),
  followUpFor: varchar("follow_up_for"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  patientIdx: index("appointments_patient_idx").on(table.patientId),
  doctorIdx: index("appointments_doctor_idx").on(table.doctorId),
  dateIdx: index("appointments_date_idx").on(table.appointmentDate),
  followUpIdx: index("appointments_follow_up_idx").on(table.followUpFor),
}));

// Medications table
export const medications = pgTable("medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  genericName: text("generic_name"),
  dosageForm: text("dosage_form"),
  strength: text("strength"),
  description: text("description"),
  manufacturer: text("manufacturer"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  reorderLevel: integer("reorder_level").default(50),
  expiryDate: date("expiry_date"),
});

// Prescriptions table
export const prescriptions = pgTable("prescriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  doctorId: varchar("doctor_id").notNull().references(() => doctors.id),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  prescriptionDate: date("prescription_date").notNull(),
  diagnosis: text("diagnosis").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Prescription Medications junction table
export const prescriptionMedications = pgTable("prescription_medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prescriptionId: varchar("prescription_id").notNull().references(() => prescriptions.id, { onDelete: "cascade" }),
  medicationId: varchar("medication_id").notNull().references(() => medications.id),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  duration: text("duration").notNull(),
  instructions: text("instructions"),
});

// Lab Tests table
export const labTests = pgTable("lab_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testName: text("test_name").notNull().unique(),
  testCode: varchar("test_code", { length: 20 }).unique(),
  category: text("category"),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  normalRange: text("normal_range"),
  preparationInstructions: text("preparation_instructions"),
});

// Test Orders table
export const testOrders = pgTable("test_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  doctorId: varchar("doctor_id").notNull().references(() => doctors.id),
  labTestId: varchar("lab_test_id").notNull().references(() => labTests.id),
  technicianId: varchar("technician_id").references(() => technicians.id),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  status: testOrderStatusEnum("status").notNull().default("ordered"),
  collectedDate: timestamp("collected_date"),
  reportedDate: timestamp("reported_date"),
  results: text("results"),
  notes: text("notes"),
});

// Bills table
export const bills = pgTable("bills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  billDate: timestamp("bill_date").notNull().defaultNow(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  status: billStatusEnum("status").notNull().default("pending"),
  dueDate: date("due_date"),
  description: text("description"),
});

// Payments table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  billId: varchar("bill_id").notNull().references(() => bills.id, { onDelete: "cascade" }),
  paymentDate: timestamp("payment_date").notNull().defaultNow(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  transactionId: varchar("transaction_id", { length: 100 }),
  notes: text("notes"),
});

// Patient Alerts table - Warnings for allergies, chronic conditions
export const patientAlerts = pgTable("patient_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  alertType: text("alert_type").notNull(),
  severity: alertSeverityEnum("severity").notNull().default("medium"),
  message: text("message").notNull(),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  patientIdx: index("patient_alerts_patient_idx").on(table.patientId),
}));

// Prescription Templates table - Reusable templates for common illnesses
export const prescriptionTemplates = pgTable("prescription_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").notNull().references(() => doctors.id, { onDelete: "cascade" }),
  templateName: text("template_name").notNull(),
  condition: text("condition").notNull(),
  diagnosis: text("diagnosis").notNull(),
  notes: text("notes"),
  isPublic: integer("is_public").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  doctorIdx: index("prescription_templates_doctor_idx").on(table.doctorId),
}));

// Prescription Template Medications
export const prescriptionTemplateMedications = pgTable("prescription_template_medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull().references(() => prescriptionTemplates.id, { onDelete: "cascade" }),
  medicationId: varchar("medication_id").notNull().references(() => medications.id),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  duration: text("duration").notNull(),
  instructions: text("instructions"),
});

// SOAP Notes table - Structured clinical documentation
export const soapNotes = pgTable("soap_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: varchar("appointment_id").notNull().references(() => appointments.id, { onDelete: "cascade" }),
  subjective: text("subjective"),
  objective: text("objective"),
  assessment: text("assessment"),
  plan: text("plan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  appointmentIdx: index("soap_notes_appointment_idx").on(table.appointmentId),
}));

// Referrals table - Doctor-to-doctor patient referrals
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  fromDoctorId: varchar("from_doctor_id").notNull().references(() => doctors.id),
  toDoctorId: varchar("to_doctor_id").notNull().references(() => doctors.id),
  reason: text("reason").notNull(),
  notes: text("notes"),
  status: referralStatusEnum("status").notNull().default("pending"),
  referralDate: timestamp("referral_date").notNull().defaultNow(),
  completedDate: timestamp("completed_date"),
}, (table) => ({
  patientIdx: index("referrals_patient_idx").on(table.patientId),
  fromDoctorIdx: index("referrals_from_doctor_idx").on(table.fromDoctorId),
  toDoctorIdx: index("referrals_to_doctor_idx").on(table.toDoctorId),
}));

// Lab Test Panels table - Pre-defined test sets
export const labTestPanels = pgTable("lab_test_panels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  panelName: text("panel_name").notNull().unique(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Panel Tests junction table
export const panelTests = pgTable("panel_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  panelId: varchar("panel_id").notNull().references(() => labTestPanels.id, { onDelete: "cascade" }),
  labTestId: varchar("lab_test_id").notNull().references(() => labTests.id),
}, (table) => ({
  panelIdx: index("panel_tests_panel_idx").on(table.panelId),
  labTestIdx: index("panel_tests_lab_test_idx").on(table.labTestId),
}));

// Messages table - Internal messaging and patient portal
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  subject: text("subject"),
  content: text("content").notNull(),
  status: messageStatusEnum("status").notNull().default("sent"),
  isPatientPortal: integer("is_patient_portal").notNull().default(0),
  patientId: varchar("patient_id").references(() => patients.id),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  readAt: timestamp("read_at"),
}, (table) => ({
  senderIdx: index("messages_sender_idx").on(table.senderId),
  receiverIdx: index("messages_receiver_idx").on(table.receiverId),
  patientIdx: index("messages_patient_idx").on(table.patientId),
}));

// Shift Handover Notes table
export const shiftHandoverNotes = pgTable("shift_handover_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromDoctorId: varchar("from_doctor_id").notNull().references(() => doctors.id),
  toDoctorId: varchar("to_doctor_id").references(() => doctors.id),
  departmentId: varchar("department_id").references(() => departments.id),
  shiftDate: date("shift_date").notNull(),
  notes: text("notes").notNull(),
  urgentItems: text("urgent_items"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  fromDoctorIdx: index("shift_handover_from_doctor_idx").on(table.fromDoctorId),
  toDoctorIdx: index("shift_handover_to_doctor_idx").on(table.toDoctorId),
  departmentIdx: index("shift_handover_department_idx").on(table.departmentId),
}));

// Vaccinations table
export const vaccinations = pgTable("vaccinations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  vaccineName: text("vaccine_name").notNull(),
  administeredDate: date("administered_date").notNull(),
  administeredBy: varchar("administered_by").references(() => doctors.id),
  batchNumber: varchar("batch_number", { length: 50 }),
  nextDoseDate: date("next_dose_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  patientIdx: index("vaccinations_patient_idx").on(table.patientId),
  administeredDateIdx: index("vaccinations_date_idx").on(table.administeredDate),
}));

// Health Vitals table - Patient-logged vitals
export const healthVitals = pgTable("health_vitals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  recordedDate: timestamp("recorded_date").notNull().defaultNow(),
  bloodPressureSystolic: integer("blood_pressure_systolic"),
  bloodPressureDiastolic: integer("blood_pressure_diastolic"),
  heartRate: integer("heart_rate"),
  temperature: decimal("temperature", { precision: 4, scale: 1 }),
  bloodSugar: decimal("blood_sugar", { precision: 5, scale: 1 }),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  height: decimal("height", { precision: 5, scale: 2 }),
  oxygenSaturation: integer("oxygen_saturation"),
  notes: text("notes"),
}, (table) => ({
  patientIdx: index("health_vitals_patient_idx").on(table.patientId),
  recordedDateIdx: index("health_vitals_date_idx").on(table.recordedDate),
}));

// Refill Requests table
export const refillRequests = pgTable("refill_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  prescriptionId: varchar("prescription_id").notNull().references(() => prescriptions.id),
  doctorId: varchar("doctor_id").notNull().references(() => doctors.id),
  requestDate: timestamp("request_date").notNull().defaultNow(),
  status: refillStatusEnum("status").notNull().default("requested"),
  notes: text("notes"),
  approvedDate: timestamp("approved_date"),
  newPrescriptionId: varchar("new_prescription_id").references(() => prescriptions.id),
}, (table) => ({
  patientIdx: index("refill_requests_patient_idx").on(table.patientId),
  prescriptionIdx: index("refill_requests_prescription_idx").on(table.prescriptionId),
  doctorIdx: index("refill_requests_doctor_idx").on(table.doctorId),
}));

// Doctor Feedback/Ratings table
export const doctorFeedback = pgTable("doctor_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").notNull().references(() => doctors.id),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  doctorIdx: index("doctor_feedback_doctor_idx").on(table.doctorId),
  patientIdx: index("doctor_feedback_patient_idx").on(table.patientId),
}));

// Patient Events table - Denormalized timeline for quick aggregation
export const patientEvents = pgTable("patient_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  eventDate: timestamp("event_date").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  relatedId: varchar("related_id"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  patientIdx: index("patient_events_patient_idx").on(table.patientId),
  eventDateIdx: index("patient_events_date_idx").on(table.eventDate),
  eventTypeIdx: index("patient_events_type_idx").on(table.eventType),
}));

// Notifications table - System-wide notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedId: varchar("related_id"),
  isRead: integer("is_read").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("notifications_user_idx").on(table.userId),
  isReadIdx: index("notifications_is_read_idx").on(table.isRead),
}));

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  doctor: one(doctors, { fields: [users.id], references: [doctors.userId] }),
  nurse: one(nurses, { fields: [users.id], references: [nurses.userId] }),
  technician: one(technicians, { fields: [users.id], references: [technicians.userId] }),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, { fields: [doctors.userId], references: [users.id] }),
  department: one(departments, { fields: [doctors.departmentId], references: [departments.id] }),
  appointments: many(appointments),
  prescriptions: many(prescriptions),
  testOrders: many(testOrders),
}));

export const nursesRelations = relations(nurses, ({ one }) => ({
  user: one(users, { fields: [nurses.userId], references: [users.id] }),
  department: one(departments, { fields: [nurses.departmentId], references: [departments.id] }),
}));

export const techniciansRelations = relations(technicians, ({ one, many }) => ({
  user: one(users, { fields: [technicians.userId], references: [users.id] }),
  department: one(departments, { fields: [technicians.departmentId], references: [departments.id] }),
  testOrders: many(testOrders),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
  prescriptions: many(prescriptions),
  testOrders: many(testOrders),
  bills: many(bills),
  bed: many(beds),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  doctors: many(doctors),
  nurses: many(nurses),
  technicians: many(technicians),
  rooms: many(rooms),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  department: one(departments, { fields: [rooms.departmentId], references: [departments.id] }),
  beds: many(beds),
}));

export const bedsRelations = relations(beds, ({ one }) => ({
  room: one(rooms, { fields: [beds.roomId], references: [rooms.id] }),
  patient: one(patients, { fields: [beds.patientId], references: [patients.id] }),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [appointments.doctorId], references: [doctors.id] }),
  prescriptions: many(prescriptions),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one, many }) => ({
  patient: one(patients, { fields: [prescriptions.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [prescriptions.doctorId], references: [doctors.id] }),
  appointment: one(appointments, { fields: [prescriptions.appointmentId], references: [appointments.id] }),
  prescriptionMedications: many(prescriptionMedications),
}));

export const prescriptionMedicationsRelations = relations(prescriptionMedications, ({ one }) => ({
  prescription: one(prescriptions, { fields: [prescriptionMedications.prescriptionId], references: [prescriptions.id] }),
  medication: one(medications, { fields: [prescriptionMedications.medicationId], references: [medications.id] }),
}));

export const medicationsRelations = relations(medications, ({ many }) => ({
  prescriptionMedications: many(prescriptionMedications),
}));

export const labTestsRelations = relations(labTests, ({ many }) => ({
  testOrders: many(testOrders),
}));

export const testOrdersRelations = relations(testOrders, ({ one }) => ({
  patient: one(patients, { fields: [testOrders.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [testOrders.doctorId], references: [doctors.id] }),
  labTest: one(labTests, { fields: [testOrders.labTestId], references: [labTests.id] }),
  technician: one(technicians, { fields: [testOrders.technicianId], references: [technicians.id] }),
}));

export const billsRelations = relations(bills, ({ one, many }) => ({
  patient: one(patients, { fields: [bills.patientId], references: [patients.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  bill: one(bills, { fields: [payments.billId], references: [bills.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true });
export const insertDoctorSchema = createInsertSchema(doctors).omit({ id: true });
export const insertNurseSchema = createInsertSchema(nurses).omit({ id: true });
export const insertTechnicianSchema = createInsertSchema(technicians).omit({ id: true });
export const insertPatientSchema = createInsertSchema(patients).omit({ id: true, createdAt: true });
export const insertRoomSchema = createInsertSchema(rooms).omit({ id: true });
export const insertBedSchema = createInsertSchema(beds).omit({ id: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true });
export const insertMedicationSchema = createInsertSchema(medications).omit({ id: true });
export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({ id: true, createdAt: true });
export const insertPrescriptionMedicationSchema = createInsertSchema(prescriptionMedications).omit({ id: true });
export const insertLabTestSchema = createInsertSchema(labTests).omit({ id: true });
export const insertTestOrderSchema = createInsertSchema(testOrders).omit({ id: true, orderDate: true });
export const insertBillSchema = createInsertSchema(bills).omit({ id: true, billDate: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, paymentDate: true });
export const insertPatientAlertSchema = createInsertSchema(patientAlerts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPrescriptionTemplateSchema = createInsertSchema(prescriptionTemplates).omit({ id: true, createdAt: true });
export const insertPrescriptionTemplateMedicationSchema = createInsertSchema(prescriptionTemplateMedications).omit({ id: true });
export const insertSoapNoteSchema = createInsertSchema(soapNotes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertReferralSchema = createInsertSchema(referrals).omit({ id: true, referralDate: true });
export const insertRecurringAppointmentSchema = createInsertSchema(recurringAppointments).omit({ id: true, createdAt: true });
export const insertLabTestPanelSchema = createInsertSchema(labTestPanels).omit({ id: true, createdAt: true });
export const insertPanelTestSchema = createInsertSchema(panelTests).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, sentAt: true });
export const insertShiftHandoverNoteSchema = createInsertSchema(shiftHandoverNotes).omit({ id: true, createdAt: true });
export const insertVaccinationSchema = createInsertSchema(vaccinations).omit({ id: true, createdAt: true });
export const insertHealthVitalSchema = createInsertSchema(healthVitals).omit({ id: true, recordedDate: true });
export const insertRefillRequestSchema = createInsertSchema(refillRequests).omit({ id: true, requestDate: true });
export const insertDoctorFeedbackSchema = createInsertSchema(doctorFeedback).omit({ id: true, createdAt: true });
export const insertPatientEventSchema = createInsertSchema(patientEvents).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Nurse = typeof nurses.$inferSelect;
export type InsertNurse = z.infer<typeof insertNurseSchema>;
export type Technician = typeof technicians.$inferSelect;
export type InsertTechnician = z.infer<typeof insertTechnicianSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Bed = typeof beds.$inferSelect;
export type InsertBed = z.infer<typeof insertBedSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type PrescriptionMedication = typeof prescriptionMedications.$inferSelect;
export type InsertPrescriptionMedication = z.infer<typeof insertPrescriptionMedicationSchema>;
export type LabTest = typeof labTests.$inferSelect;
export type InsertLabTest = z.infer<typeof insertLabTestSchema>;
export type TestOrder = typeof testOrders.$inferSelect;
export type InsertTestOrder = z.infer<typeof insertTestOrderSchema>;
export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type PatientAlert = typeof patientAlerts.$inferSelect;
export type InsertPatientAlert = z.infer<typeof insertPatientAlertSchema>;
export type PrescriptionTemplate = typeof prescriptionTemplates.$inferSelect;
export type InsertPrescriptionTemplate = z.infer<typeof insertPrescriptionTemplateSchema>;
export type PrescriptionTemplateMedication = typeof prescriptionTemplateMedications.$inferSelect;
export type InsertPrescriptionTemplateMedication = z.infer<typeof insertPrescriptionTemplateMedicationSchema>;
export type SoapNote = typeof soapNotes.$inferSelect;
export type InsertSoapNote = z.infer<typeof insertSoapNoteSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type RecurringAppointment = typeof recurringAppointments.$inferSelect;
export type InsertRecurringAppointment = z.infer<typeof insertRecurringAppointmentSchema>;
export type LabTestPanel = typeof labTestPanels.$inferSelect;
export type InsertLabTestPanel = z.infer<typeof insertLabTestPanelSchema>;
export type PanelTest = typeof panelTests.$inferSelect;
export type InsertPanelTest = z.infer<typeof insertPanelTestSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type ShiftHandoverNote = typeof shiftHandoverNotes.$inferSelect;
export type InsertShiftHandoverNote = z.infer<typeof insertShiftHandoverNoteSchema>;
export type Vaccination = typeof vaccinations.$inferSelect;
export type InsertVaccination = z.infer<typeof insertVaccinationSchema>;
export type HealthVital = typeof healthVitals.$inferSelect;
export type InsertHealthVital = z.infer<typeof insertHealthVitalSchema>;
export type RefillRequest = typeof refillRequests.$inferSelect;
export type InsertRefillRequest = z.infer<typeof insertRefillRequestSchema>;
export type DoctorFeedback = typeof doctorFeedback.$inferSelect;
export type InsertDoctorFeedback = z.infer<typeof insertDoctorFeedbackSchema>;
export type PatientEvent = typeof patientEvents.$inferSelect;
export type InsertPatientEvent = z.infer<typeof insertPatientEventSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// DTO types for enriched API responses
export type PrescriptionListItem = Prescription & {
  patientName: string;
  doctorName: string | null;
};

export type TestOrderListItem = TestOrder & {
  patientName: string;
  doctorName: string | null;
  testName: string | null;
  testCode: string | null;
  testCategory: string | null;
  testDescription: string | null;
  normalRange: string | null;
  testPrice: string | null;
};

export type PrescriptionMedicationDetail = PrescriptionMedication & {
  medicationName: string | null;
  genericName: string | null;
  dosageForm: string | null;
  strength: string | null;
};

export type PrescriptionDetail = Prescription & {
  patientName: string;
  doctorName: string | null;
  medications: PrescriptionMedicationDetail[];
};

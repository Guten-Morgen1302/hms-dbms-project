// DatabaseStorage implementation for HMS
// Based on javascript_database blueprint
import { db } from "./db";
import { eq, like, and, desc, or } from "drizzle-orm";
import { 
  users, patients, doctors, nurses, technicians, departments, 
  rooms, beds, appointments, medications, prescriptions, prescriptionMedications,
  labTests, testOrders, bills, payments,
  patientAlerts, patientEvents, healthVitals, vaccinations,
  prescriptionTemplates, prescriptionTemplateMedications, soapNotes, referrals,
  messages, refillRequests, doctorFeedback, recurringAppointments, notifications,
  type User, type InsertUser, type Patient, type InsertPatient,
  type Doctor, type InsertDoctor, type Nurse, type InsertNurse,
  type Technician, type InsertTechnician, type Department, type InsertDepartment,
  type Room, type InsertRoom, type Bed, type InsertBed,
  type Appointment, type InsertAppointment, type Medication, type InsertMedication,
  type Prescription, type InsertPrescription, type PrescriptionMedication, type InsertPrescriptionMedication,
  type LabTest, type InsertLabTest, type TestOrder, type InsertTestOrder,
  type Bill, type InsertBill, type Payment, type InsertPayment,
  type PatientAlert, type InsertPatientAlert, type PatientEvent, type InsertPatientEvent,
  type HealthVital, type InsertHealthVital, type Vaccination, type InsertVaccination,
  type PrescriptionTemplate, type InsertPrescriptionTemplate,
  type PrescriptionTemplateMedication, type InsertPrescriptionTemplateMedication,
  type SoapNote, type InsertSoapNote, type Referral, type InsertReferral,
  type Message, type InsertMessage, type RefillRequest, type InsertRefillRequest,
  type DoctorFeedback, type InsertDoctorFeedback, type RecurringAppointment, type InsertRecurringAppointment,
  type Notification, type InsertNotification,
  type PrescriptionListItem, type TestOrderListItem, type PrescriptionDetail
} from "./shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Patients
  getPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: string): Promise<void>;
  
  // Doctors
  getDoctors(): Promise<any[]>;
  getDoctor(id: string): Promise<any | undefined>;
  createDoctor(doctor: InsertDoctor & { user: InsertUser }): Promise<any>;
  
  // Nurses
  getNurses(): Promise<any[]>;
  createNurse(nurse: InsertNurse & { user: InsertUser }): Promise<any>;
  
  // Technicians
  getTechnicians(): Promise<any[]>;
  createTechnician(technician: InsertTechnician & { user: InsertUser }): Promise<any>;
  
  // Departments
  getDepartments(): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  
  // Rooms
  getRooms(): Promise<Room[]>;
  createRoom(room: InsertRoom): Promise<Room>;
  
  // Beds
  getBeds(): Promise<Bed[]>;
  createBed(bed: InsertBed): Promise<Bed>;
  updateBed(id: string, bed: Partial<InsertBed>): Promise<Bed | undefined>;
  
  // Appointments
  getAppointments(): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  
  // Medications
  getMedications(): Promise<Medication[]>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  
  // Prescriptions
  getPrescriptions(): Promise<PrescriptionListItem[]>;
  getPrescriptionWithDetails(id: string): Promise<PrescriptionDetail | null>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  createPrescriptionMedication(data: InsertPrescriptionMedication): Promise<PrescriptionMedication>;
  
  // Lab Tests
  getLabTests(): Promise<LabTest[]>;
  createLabTest(labTest: InsertLabTest): Promise<LabTest>;
  
  // Test Orders
  getTestOrders(): Promise<TestOrderListItem[]>;
  createTestOrder(testOrder: InsertTestOrder): Promise<TestOrder>;
  updateTestOrder(id: string, testOrder: Partial<InsertTestOrder>): Promise<TestOrder | undefined>;
  
  // Bills
  getBills(): Promise<Bill[]>;
  createBill(bill: InsertBill): Promise<Bill>;
  
  // Payments
  getPayments(billId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  
  // Metrics
  getMetrics(): Promise<any>;
  
  // Patient Alerts
  getPatientAlerts(patientId: string): Promise<PatientAlert[]>;
  createPatientAlert(alert: InsertPatientAlert): Promise<PatientAlert>;
  
  // Patient Events
  getPatientEvents(patientId: string): Promise<PatientEvent[]>;
  createPatientEvent(event: InsertPatientEvent): Promise<PatientEvent>;
  
  // Health Vitals
  getHealthVitals(patientId: string): Promise<HealthVital[]>;
  createHealthVital(vital: InsertHealthVital): Promise<HealthVital>;
  
  // Vaccinations
  getVaccinations(patientId: string): Promise<Vaccination[]>;
  createVaccination(vaccination: InsertVaccination): Promise<Vaccination>;
  
  // Prescription Templates
  getPrescriptionTemplates(doctorId: string): Promise<PrescriptionTemplate[]>;
  getPrescriptionTemplate(id: string): Promise<PrescriptionTemplate | undefined>;
  createPrescriptionTemplate(template: InsertPrescriptionTemplate): Promise<PrescriptionTemplate>;
  deletePrescriptionTemplate(id: string): Promise<void>;
  
  // SOAP Notes
  getSoapNoteByAppointment(appointmentId: string): Promise<SoapNote | undefined>;
  createSoapNote(note: InsertSoapNote): Promise<SoapNote>;
  updateSoapNote(id: string, note: Partial<InsertSoapNote>): Promise<SoapNote | undefined>;
  
  // Referrals
  getReferralsByDoctor(doctorId: string, direction: "from" | "to"): Promise<Referral[]>;
  getReferralsByPatient(patientId: string): Promise<Referral[]>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  updateReferralStatus(id: string, status: string): Promise<Referral | undefined>;
  
  // Messages
  getMessagesByUser(userId: string): Promise<Message[]>;
  getConversation(user1Id: string, user2Id: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<Message | undefined>;
  
  // Refill Requests
  getRefillRequestsByPatient(patientId: string): Promise<RefillRequest[]>;
  getRefillRequestsByDoctor(doctorId: string): Promise<RefillRequest[]>;
  createRefillRequest(request: InsertRefillRequest): Promise<RefillRequest>;
  updateRefillRequestStatus(id: string, status: string, newPrescriptionId?: string): Promise<RefillRequest | undefined>;
  
  // Doctor Feedback
  getDoctorFeedback(doctorId: string): Promise<DoctorFeedback[]>;
  createDoctorFeedback(feedback: InsertDoctorFeedback): Promise<DoctorFeedback>;
  
  // Recurring Appointments
  getRecurringAppointments(patientId?: string, doctorId?: string): Promise<RecurringAppointment[]>;
  createRecurringAppointment(appointment: InsertRecurringAppointment): Promise<RecurringAppointment>;
  updateRecurringAppointment(id: string, data: Partial<InsertRecurringAppointment>): Promise<RecurringAppointment | undefined>;
  
  // Patient-specific queries for portal
  getPatientByUserId(userId: string): Promise<Patient | undefined>;
  getPatientAppointments(patientId: string): Promise<Appointment[]>;
  getPatientPrescriptions(patientId: string): Promise<Prescription[]>;
  getPatientTestOrders(patientId: string): Promise<TestOrder[]>;
  getPatientBills(patientId: string): Promise<Bill[]>;
  
  // Doctor-specific queries
  getDoctorByUserId(userId: string): Promise<any | undefined>;
  getDoctorAppointments(doctorId: string, date?: string): Promise<Appointment[]>;
  getDoctorPatients(doctorId: string): Promise<Patient[]>;
  
  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  
  // Inventory alerts
  getExpiringMedications(days?: number): Promise<Medication[]>;
  getLowStockMedications(): Promise<Medication[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Patients
  async getPatients(): Promise<Patient[]> {
    return db.select().from(patients).orderBy(desc(patients.createdAt));
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [created] = await db.insert(patients).values(patient).returning();
    return created;
  }

  async updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [updated] = await db.update(patients).set(patient).where(eq(patients.id, id)).returning();
    return updated || undefined;
  }

  async deletePatient(id: string): Promise<void> {
    await db.delete(patients).where(eq(patients.id, id));
  }

  // Doctors
  async getDoctors(): Promise<any[]> {
    const results = await db.select({
      id: doctors.id,
      userId: doctors.userId,
      specialization: doctors.specialization,
      licenseNumber: doctors.licenseNumber,
      yearsOfExperience: doctors.yearsOfExperience,
      departmentId: doctors.departmentId,
      name: users.name,
      email: users.email,
      username: users.username,
    })
    .from(doctors)
    .leftJoin(users, eq(doctors.userId, users.id));
    
    return results;
  }

  async getDoctor(id: string): Promise<any | undefined> {
    const results = await db.select({
      id: doctors.id,
      userId: doctors.userId,
      specialization: doctors.specialization,
      licenseNumber: doctors.licenseNumber,
      yearsOfExperience: doctors.yearsOfExperience,
      departmentId: doctors.departmentId,
      name: users.name,
      email: users.email,
    })
    .from(doctors)
    .leftJoin(users, eq(doctors.userId, users.id))
    .where(eq(doctors.id, id));
    
    return results[0] || undefined;
  }

  async createDoctor(data: InsertDoctor & { user: InsertUser }): Promise<any> {
    const [user] = await db.insert(users).values({ ...data.user, role: "doctor" }).returning();
    const [doctor] = await db.insert(doctors).values({
      userId: user.id,
      specialization: data.specialization,
      licenseNumber: data.licenseNumber,
      yearsOfExperience: data.yearsOfExperience,
      departmentId: data.departmentId,
    }).returning();
    
    return { ...doctor, name: user.name, email: user.email };
  }

  // Nurses
  async getNurses(): Promise<any[]> {
    const results = await db.select({
      id: nurses.id,
      userId: nurses.userId,
      licenseNumber: nurses.licenseNumber,
      shift: nurses.shift,
      departmentId: nurses.departmentId,
      name: users.name,
      email: users.email,
    })
    .from(nurses)
    .leftJoin(users, eq(nurses.userId, users.id));
    
    return results;
  }

  // Nurse creation removed - only 3 roles supported: admin, doctor, patient
  async createNurse(data: InsertNurse & { user: InsertUser }): Promise<any> {
    throw new Error("Nurse role is no longer supported. Please create a doctor account instead.");
  }

  // Technicians
  async getTechnicians(): Promise<any[]> {
    const results = await db.select({
      id: technicians.id,
      userId: technicians.userId,
      specialization: technicians.specialization,
      certificationNumber: technicians.certificationNumber,
      departmentId: technicians.departmentId,
      name: users.name,
      email: users.email,
    })
    .from(technicians)
    .leftJoin(users, eq(technicians.userId, users.id));
    
    return results;
  }

  // Technician creation removed - only 3 roles supported: admin, doctor, patient
  async createTechnician(data: InsertTechnician & { user: InsertUser }): Promise<any> {
    throw new Error("Technician role is no longer supported. Please create a doctor account instead.");
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    return db.select().from(departments);
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [created] = await db.insert(departments).values(department).returning();
    return created;
  }

  // Rooms
  async getRooms(): Promise<Room[]> {
    return db.select().from(rooms);
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const [created] = await db.insert(rooms).values(room).returning();
    return created;
  }

  // Beds
  async getBeds(): Promise<Bed[]> {
    return db.select().from(beds);
  }

  async createBed(bed: InsertBed): Promise<Bed> {
    const [created] = await db.insert(beds).values(bed).returning();
    return created;
  }

  async updateBed(id: string, bed: Partial<InsertBed>): Promise<Bed | undefined> {
    const [updated] = await db.update(beds).set(bed).where(eq(beds.id, id)).returning();
    return updated || undefined;
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return db.select().from(appointments).orderBy(desc(appointments.appointmentDate));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [created] = await db.insert(appointments).values(appointment).returning();
    return created;
  }

  // Medications
  async getMedications(): Promise<Medication[]> {
    return db.select().from(medications);
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const [created] = await db.insert(medications).values(medication).returning();
    return created;
  }

  // Prescriptions
  async getPrescriptions(): Promise<any[]> {
    const results = await db.select({
      id: prescriptions.id,
      patientId: prescriptions.patientId,
      doctorId: prescriptions.doctorId,
      appointmentId: prescriptions.appointmentId,
      prescriptionDate: prescriptions.prescriptionDate,
      diagnosis: prescriptions.diagnosis,
      notes: prescriptions.notes,
      createdAt: prescriptions.createdAt,
      patientName: patients.firstName,
      patientLastName: patients.lastName,
      doctorName: users.name,
    })
    .from(prescriptions)
    .leftJoin(patients, eq(prescriptions.patientId, patients.id))
    .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
    .leftJoin(users, eq(doctors.userId, users.id))
    .orderBy(desc(prescriptions.prescriptionDate));
    
    return results.map(r => ({
      ...r,
      patientName: `${r.patientName || ''} ${r.patientLastName || ''}`.trim(),
    }));
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const [created] = await db.insert(prescriptions).values(prescription).returning();
    return created;
  }
  
  async getPrescriptionWithDetails(id: string): Promise<any> {
    const [prescription] = await db.select({
      id: prescriptions.id,
      patientId: prescriptions.patientId,
      doctorId: prescriptions.doctorId,
      appointmentId: prescriptions.appointmentId,
      prescriptionDate: prescriptions.prescriptionDate,
      diagnosis: prescriptions.diagnosis,
      notes: prescriptions.notes,
      createdAt: prescriptions.createdAt,
      patientName: patients.firstName,
      patientLastName: patients.lastName,
      doctorName: users.name,
    })
    .from(prescriptions)
    .leftJoin(patients, eq(prescriptions.patientId, patients.id))
    .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
    .leftJoin(users, eq(doctors.userId, users.id))
    .where(eq(prescriptions.id, id));
    
    if (!prescription) return null;
    
    // Get medications for this prescription
    const meds = await db.select({
      id: prescriptionMedications.id,
      medicationId: prescriptionMedications.medicationId,
      dosage: prescriptionMedications.dosage,
      frequency: prescriptionMedications.frequency,
      duration: prescriptionMedications.duration,
      instructions: prescriptionMedications.instructions,
      medicationName: medications.name,
      genericName: medications.genericName,
      dosageForm: medications.dosageForm,
      strength: medications.strength,
    })
    .from(prescriptionMedications)
    .leftJoin(medications, eq(prescriptionMedications.medicationId, medications.id))
    .where(eq(prescriptionMedications.prescriptionId, id));
    
    return {
      ...prescription,
      patientName: `${prescription.patientName || ''} ${prescription.patientLastName || ''}`.trim(),
      medications: meds,
    };
  }
  
  async createPrescriptionMedication(data: InsertPrescriptionMedication): Promise<PrescriptionMedication> {
    const [created] = await db.insert(prescriptionMedications).values(data).returning();
    return created;
  }

  // Lab Tests
  async getLabTests(): Promise<LabTest[]> {
    return db.select().from(labTests);
  }

  async createLabTest(labTest: InsertLabTest): Promise<LabTest> {
    const [created] = await db.insert(labTests).values(labTest).returning();
    return created;
  }

  // Test Orders
  async getTestOrders(): Promise<TestOrderListItem[]> {
    const results = await db.select({
      id: testOrders.id,
      patientId: testOrders.patientId,
      doctorId: testOrders.doctorId,
      labTestId: testOrders.labTestId,
      technicianId: testOrders.technicianId,
      orderDate: testOrders.orderDate,
      status: testOrders.status,
      collectedDate: testOrders.collectedDate,
      reportedDate: testOrders.reportedDate,
      results: testOrders.results,
      notes: testOrders.notes,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      doctorName: users.name,
      testName: labTests.testName,
      testCode: labTests.testCode,
      testCategory: labTests.category,
      testDescription: labTests.description,
      normalRange: labTests.normalRange,
      testPrice: labTests.price,
    })
    .from(testOrders)
    .leftJoin(patients, eq(testOrders.patientId, patients.id))
    .leftJoin(doctors, eq(testOrders.doctorId, doctors.id))
    .leftJoin(users, eq(doctors.userId, users.id))
    .leftJoin(labTests, eq(testOrders.labTestId, labTests.id))
    .orderBy(desc(testOrders.orderDate));
    
    return results.map(r => ({
      id: r.id,
      patientId: r.patientId,
      doctorId: r.doctorId,
      labTestId: r.labTestId,
      technicianId: r.technicianId,
      orderDate: r.orderDate,
      status: r.status,
      collectedDate: r.collectedDate,
      reportedDate: r.reportedDate,
      results: r.results,
      notes: r.notes,
      patientName: `${r.patientFirstName || ''} ${r.patientLastName || ''}`.trim(),
      doctorName: r.doctorName || null,
      testName: r.testName || null,
      testCode: r.testCode || null,
      testCategory: r.testCategory || null,
      testDescription: r.testDescription || null,
      normalRange: r.normalRange || null,
      testPrice: r.testPrice ? String(r.testPrice) : null,
    }));
  }

  async createTestOrder(testOrder: InsertTestOrder): Promise<TestOrder> {
    const [created] = await db.insert(testOrders).values(testOrder).returning();
    return created;
  }

  async updateTestOrder(id: string, testOrder: Partial<InsertTestOrder>): Promise<TestOrder | undefined> {
    const [updated] = await db.update(testOrders).set(testOrder).where(eq(testOrders.id, id)).returning();
    return updated || undefined;
  }

  // Bills
  async getBills(): Promise<Bill[]> {
    return db.select().from(bills).orderBy(desc(bills.billDate));
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const [created] = await db.insert(bills).values(bill).returning();
    return created;
  }

  // Payments
  async getPayments(billId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.billId, billId));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(payments).values(payment).returning();
    return created;
  }

  // Metrics (placeholder - will return mock data for now)
  async getMetrics(): Promise<any> {
    const totalPatients = await db.select().from(patients);
    const totalBills = await db.select().from(bills);
    const totalBeds = await db.select().from(beds);
    const occupiedBeds = totalBeds.filter(bed => bed.status === "occupied");
    const pendingAppointments = await db.select().from(appointments).where(eq(appointments.status, "scheduled"));

    const totalRevenue = totalBills.reduce((sum, bill) => sum + Number(bill.paidAmount), 0);
    const bedOccupancy = totalBeds.length > 0 
      ? Math.round((occupiedBeds.length / totalBeds.length) * 100)
      : 0;
    const activePatients = totalPatients.length;

    // Generate revenue trend data (last 6 months)
    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueData = Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (now.getMonth() - (5 - i) + 12) % 12;
      const multiplier = 0.65 + (i * 0.065); // Gradual growth trend
      return {
        month: monthNames[monthIndex],
        revenue: Math.round(totalRevenue * multiplier)
      };
    });

    // Department patient distribution
    const deptNames = ["Cardiology", "Orthopedics", "Neurology", "Pediatrics", "Emergency"];
    const departmentData = deptNames.map((name, index) => ({
      name,
      patients: Math.round(activePatients * ([0.22, 0.19, 0.16, 0.14, 0.29][index] || 0.2))
    }));

    // Bed occupancy breakdown
    const occupancyData = [
      { name: "Occupied", value: bedOccupancy },
      { name: "Available", value: 100 - bedOccupancy }
    ];

    return {
      totalRevenue,
      activePatients,
      bedOccupancy,
      pendingAppointments: pendingAppointments.length,
      revenueData,
      departmentData,
      occupancyData,
    };
  }

  // Patient Alerts
  async getPatientAlerts(patientId: string): Promise<PatientAlert[]> {
    return db.select().from(patientAlerts)
      .where(eq(patientAlerts.patientId, patientId))
      .orderBy(desc(patientAlerts.createdAt));
  }

  async createPatientAlert(alert: InsertPatientAlert): Promise<PatientAlert> {
    const [created] = await db.insert(patientAlerts).values(alert).returning();
    return created;
  }

  // Patient Events
  async getPatientEvents(patientId: string): Promise<PatientEvent[]> {
    return db.select().from(patientEvents)
      .where(eq(patientEvents.patientId, patientId))
      .orderBy(desc(patientEvents.eventDate));
  }

  async createPatientEvent(event: InsertPatientEvent): Promise<PatientEvent> {
    const [created] = await db.insert(patientEvents).values(event).returning();
    return created;
  }

  // Health Vitals
  async getHealthVitals(patientId: string): Promise<HealthVital[]> {
    return db.select().from(healthVitals)
      .where(eq(healthVitals.patientId, patientId))
      .orderBy(desc(healthVitals.recordedDate));
  }

  async createHealthVital(vital: InsertHealthVital): Promise<HealthVital> {
    const [created] = await db.insert(healthVitals).values(vital).returning();
    return created;
  }

  // Vaccinations
  async getVaccinations(patientId: string): Promise<Vaccination[]> {
    return db.select().from(vaccinations)
      .where(eq(vaccinations.patientId, patientId))
      .orderBy(desc(vaccinations.administeredDate));
  }

  async createVaccination(vaccination: InsertVaccination): Promise<Vaccination> {
    const [created] = await db.insert(vaccinations).values(vaccination).returning();
    return created;
  }

  // Prescription Templates
  async getPrescriptionTemplates(doctorId: string): Promise<PrescriptionTemplate[]> {
    return db.select().from(prescriptionTemplates)
      .where(eq(prescriptionTemplates.doctorId, doctorId))
      .orderBy(desc(prescriptionTemplates.createdAt));
  }

  async getPrescriptionTemplate(id: string): Promise<PrescriptionTemplate | undefined> {
    const [template] = await db.select().from(prescriptionTemplates)
      .where(eq(prescriptionTemplates.id, id));
    return template || undefined;
  }

  async createPrescriptionTemplate(template: InsertPrescriptionTemplate): Promise<PrescriptionTemplate> {
    const [created] = await db.insert(prescriptionTemplates).values(template).returning();
    return created;
  }

  async deletePrescriptionTemplate(id: string): Promise<void> {
    await db.delete(prescriptionTemplates).where(eq(prescriptionTemplates.id, id));
  }

  // SOAP Notes
  async getSoapNoteByAppointment(appointmentId: string): Promise<SoapNote | undefined> {
    const [note] = await db.select().from(soapNotes)
      .where(eq(soapNotes.appointmentId, appointmentId));
    return note || undefined;
  }

  async createSoapNote(note: InsertSoapNote): Promise<SoapNote> {
    const [created] = await db.insert(soapNotes).values(note).returning();
    return created;
  }

  async updateSoapNote(id: string, note: Partial<InsertSoapNote>): Promise<SoapNote | undefined> {
    const [updated] = await db.update(soapNotes).set(note).where(eq(soapNotes.id, id)).returning();
    return updated || undefined;
  }

  // Referrals
  async getReferralsByDoctor(doctorId: string, direction: "from" | "to"): Promise<Referral[]> {
    const column = direction === "from" ? referrals.fromDoctorId : referrals.toDoctorId;
    return db.select().from(referrals)
      .where(eq(column, doctorId))
      .orderBy(desc(referrals.referralDate));
  }

  async getReferralsByPatient(patientId: string): Promise<Referral[]> {
    return db.select().from(referrals)
      .where(eq(referrals.patientId, patientId))
      .orderBy(desc(referrals.referralDate));
  }

  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [created] = await db.insert(referrals).values(referral).returning();
    return created;
  }

  async updateReferralStatus(id: string, status: string): Promise<Referral | undefined> {
    const [updated] = await db.update(referrals)
      .set({ status: status as any })
      .where(eq(referrals.id, id))
      .returning();
    return updated || undefined;
  }

  // Messages
  async getMessagesByUser(userId: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.sentAt));
  }

  async getConversation(user1Id: string, user2Id: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(
        or(
          and(eq(messages.senderId, user1Id), eq(messages.receiverId, user2Id)),
          and(eq(messages.senderId, user2Id), eq(messages.receiverId, user1Id))
        )
      )
      .orderBy(desc(messages.sentAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }

  async markMessageAsRead(id: string): Promise<Message | undefined> {
    const [updated] = await db.update(messages)
      .set({ status: "read", readAt: new Date() })
      .where(eq(messages.id, id))
      .returning();
    return updated || undefined;
  }

  // Refill Requests
  async getRefillRequestsByPatient(patientId: string): Promise<RefillRequest[]> {
    return db.select().from(refillRequests)
      .where(eq(refillRequests.patientId, patientId))
      .orderBy(desc(refillRequests.requestDate));
  }

  async getRefillRequestsByDoctor(doctorId: string): Promise<RefillRequest[]> {
    return db.select().from(refillRequests)
      .where(eq(refillRequests.doctorId, doctorId))
      .orderBy(desc(refillRequests.requestDate));
  }

  async createRefillRequest(request: InsertRefillRequest): Promise<RefillRequest> {
    const [created] = await db.insert(refillRequests).values(request).returning();
    return created;
  }

  async updateRefillRequestStatus(id: string, status: string, newPrescriptionId?: string): Promise<RefillRequest | undefined> {
    const updateData: any = { status: status as any };
    if (newPrescriptionId) {
      updateData.newPrescriptionId = newPrescriptionId;
    }
    const [updated] = await db.update(refillRequests)
      .set(updateData)
      .where(eq(refillRequests.id, id))
      .returning();
    return updated || undefined;
  }

  // Doctor Feedback
  async getDoctorFeedback(doctorId: string): Promise<DoctorFeedback[]> {
    return db.select().from(doctorFeedback)
      .where(eq(doctorFeedback.doctorId, doctorId))
      .orderBy(desc(doctorFeedback.createdAt));
  }

  async createDoctorFeedback(feedback: InsertDoctorFeedback): Promise<DoctorFeedback> {
    const [created] = await db.insert(doctorFeedback).values(feedback).returning();
    return created;
  }

  // Recurring Appointments
  async getRecurringAppointments(patientId?: string, doctorId?: string): Promise<RecurringAppointment[]> {
    let query = db.select().from(recurringAppointments);
    
    if (patientId && doctorId) {
      query = query.where(and(
        eq(recurringAppointments.patientId, patientId),
        eq(recurringAppointments.doctorId, doctorId)
      )) as any;
    } else if (patientId) {
      query = query.where(eq(recurringAppointments.patientId, patientId)) as any;
    } else if (doctorId) {
      query = query.where(eq(recurringAppointments.doctorId, doctorId)) as any;
    }
    
    return query.orderBy(desc(recurringAppointments.createdAt));
  }

  async createRecurringAppointment(appointment: InsertRecurringAppointment): Promise<RecurringAppointment> {
    const [created] = await db.insert(recurringAppointments).values(appointment).returning();
    return created;
  }

  async updateRecurringAppointment(id: string, data: Partial<InsertRecurringAppointment>): Promise<RecurringAppointment | undefined> {
    const [updated] = await db.update(recurringAppointments)
      .set(data)
      .where(eq(recurringAppointments.id, id))
      .returning();
    return updated || undefined;
  }

  // Patient Portal Queries
  async getPatientByUserId(userId: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients)
      .where(eq(patients.userId, userId));
    return patient || undefined;
  }

  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    return db.select().from(appointments)
      .where(eq(appointments.patientId, patientId))
      .orderBy(desc(appointments.appointmentDate));
  }

  async getPatientPrescriptions(patientId: string): Promise<Prescription[]> {
    return db.select().from(prescriptions)
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(desc(prescriptions.prescriptionDate));
  }

  async getPatientTestOrders(patientId: string): Promise<TestOrder[]> {
    return db.select().from(testOrders)
      .where(eq(testOrders.patientId, patientId))
      .orderBy(desc(testOrders.orderDate));
  }

  async getPatientBills(patientId: string): Promise<Bill[]> {
    return db.select().from(bills)
      .where(eq(bills.patientId, patientId))
      .orderBy(desc(bills.billDate));
  }

  // Doctor Queries
  async getDoctorByUserId(userId: string): Promise<any | undefined> {
    const results = await db.select({
      id: doctors.id,
      userId: doctors.userId,
      specialization: doctors.specialization,
      licenseNumber: doctors.licenseNumber,
      yearsOfExperience: doctors.yearsOfExperience,
      departmentId: doctors.departmentId,
      name: users.name,
      email: users.email,
    })
    .from(doctors)
    .leftJoin(users, eq(doctors.userId, users.id))
    .where(eq(doctors.userId, userId));
    
    return results[0] || undefined;
  }

  async getDoctorAppointments(doctorId: string, date?: string): Promise<Appointment[]> {
    if (date) {
      return db.select().from(appointments)
        .where(and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.appointmentDate, date)
        ))
        .orderBy(desc(appointments.appointmentDate));
    }
    
    return db.select().from(appointments)
      .where(eq(appointments.doctorId, doctorId))
      .orderBy(desc(appointments.appointmentDate));
  }

  async getDoctorPatients(doctorId: string): Promise<Patient[]> {
    const appointmentPatients = await db.select({
      patientId: appointments.patientId
    })
    .from(appointments)
    .where(eq(appointments.doctorId, doctorId));
    
    const uniquePatientIds = Array.from(new Set(appointmentPatients.map(a => a.patientId)));
    
    if (uniquePatientIds.length === 0) {
      return [];
    }
    
    return db.select().from(patients)
      .where(or(...uniquePatientIds.map(id => eq(patients.id, id))))
      .orderBy(desc(patients.createdAt));
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, 0)
      ))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const [updated] = await db.update(notifications)
      .set({ isRead: 1 })
      .where(eq(notifications.id, id))
      .returning();
    return updated || undefined;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: 1 })
      .where(eq(notifications.userId, userId));
  }

  // Inventory alerts
  async getExpiringMedications(days: number = 30): Promise<Medication[]> {
    const { sql: rawSql } = await import("drizzle-orm");
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const results = await db.select().from(medications)
      .where(rawSql`${medications.expiryDate} IS NOT NULL AND ${medications.expiryDate} >= ${today} AND ${medications.expiryDate} <= ${futureDate}`);
    
    return results;
  }

  async getLowStockMedications(): Promise<Medication[]> {
    const { sql: rawSql } = await import("drizzle-orm");
    return db.select().from(medications)
      .where(rawSql`${medications.stockQuantity} <= COALESCE(${medications.reorderThreshold}, 10)`);
  }
}

export const storage = new DatabaseStorage();

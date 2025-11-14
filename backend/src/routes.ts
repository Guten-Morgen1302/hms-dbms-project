import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, comparePassword, generateToken, authMiddleware, requireRole } from "./auth";
import { 
  insertUserSchema, insertPatientSchema, insertDoctorSchema,
  insertNurseSchema, insertTechnicianSchema, insertDepartmentSchema,
  insertRoomSchema, insertBedSchema, insertAppointmentSchema,
  insertMedicationSchema, insertPrescriptionSchema, insertPrescriptionMedicationSchema,
  insertLabTestSchema, insertTestOrderSchema, insertBillSchema, insertPaymentSchema,
  insertPrescriptionTemplateSchema, insertSoapNoteSchema, insertReferralSchema,
  insertMessageSchema, insertRefillRequestSchema, insertDoctorFeedbackSchema,
  insertRecurringAppointmentSchema, insertNotificationSchema
} from "./shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.extend({
        name: z.string().min(1),
        email: z.string().email(),
        dateOfBirth: z.string().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        address: z.string().optional(),
        bloodGroup: z.string().optional(),
        emergencyContactName: z.string().optional(),
        emergencyContactPhone: z.string().optional(),
      }).parse(req.body);

      const existing = await storage.getUserByUsername(data.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(data.password);
      // SECURITY: Force role to "patient" for all public registrations
      // Admin and doctor accounts can only be created by admins or via seed data
      const user = await storage.createUser({
        username: data.username,
        password: hashedPassword,
        role: "patient", // Hard-coded on server, ignore client-supplied role
        name: data.name,
        email: data.email,
        phone: data.phone,
      });

      // Auto-create patient record for patient users
      // Split name into firstName and lastName
      const nameParts = data.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || firstName;

      // Use a reasonable default for dateOfBirth if not provided (patient registration will improve later)
      const defaultBirthDate = new Date();
      defaultBirthDate.setFullYear(defaultBirthDate.getFullYear() - 30); // Default to 30 years old

      await storage.createPatient({
        userId: user.id,
        firstName,
        lastName,
        dateOfBirth: data.dateOfBirth || defaultBirthDate.toISOString().split('T')[0],
        gender: data.gender || "other",
        phone: data.phone || user.phone || "",
        email: data.email,
        address: data.address,
        bloodGroup: data.bloodGroup,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
      });

      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      res.json({ user: { ...user, password: undefined }, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = z.object({
        username: z.string(),
        password: z.string(),
      }).parse(req.body);

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const valid = await comparePassword(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      res.json({ user: { ...user, password: undefined }, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Patients endpoints (Admin and Doctor only - patients use patient portal routes)
  app.get("/api/patients", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/patients/:id", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/patients", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const data = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(data);
      res.status(201).json(patient);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/patients/:id", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const data = insertPatientSchema.partial().parse(req.body);
      const patient = await storage.updatePatient(req.params.id, data);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/patients/:id", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      await storage.deletePatient(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Doctors endpoints
  app.get("/api/doctors", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const doctors = await storage.getDoctors();
      res.json(doctors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/doctors", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const data = z.object({
        username: z.string().min(3),
        password: z.string().min(6),
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        specialization: z.string().min(1),
        licenseNumber: z.string().min(1),
        yearsOfExperience: z.number().min(0).optional(),
        departmentId: z.string().optional(),
      }).parse(req.body);

      const existing = await storage.getUserByUsername(data.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(data.password);
      const doctor = await storage.createDoctor({
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        yearsOfExperience: data.yearsOfExperience,
        departmentId: data.departmentId,
        userId: "", // will be set in storage
        user: {
          username: data.username,
          password: hashedPassword,
          role: "doctor",
          name: data.name,
          email: data.email,
          phone: data.phone,
        },
      });

      res.status(201).json(doctor);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Nurses endpoints
  app.get("/api/nurses", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const nurses = await storage.getNurses();
      res.json(nurses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Nurse creation endpoint removed - only 3 roles supported

  // Technicians endpoints
  app.get("/api/technicians", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const technicians = await storage.getTechnicians();
      res.json(technicians);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Technician creation endpoint removed - only 3 roles supported

  // Departments endpoints
  app.get("/api/departments", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/departments", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const data = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(data);
      res.status(201).json(department);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Rooms endpoints
  app.get("/api/rooms", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/rooms", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const data = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(data);
      res.status(201).json(room);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Beds endpoints
  app.get("/api/beds", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const beds = await storage.getBeds();
      res.json(beds);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/beds", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const data = insertBedSchema.parse(req.body);
      const bed = await storage.createBed(data);
      res.status(201).json(bed);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/beds/:id", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const data = insertBedSchema.partial().parse(req.body);
      const bed = await storage.updateBed(req.params.id, data);
      if (!bed) {
        return res.status(404).json({ message: "Bed not found" });
      }
      res.json(bed);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Appointments endpoints
  app.get("/api/appointments", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/appointments", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const data = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(data);
      res.status(201).json(appointment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Medications endpoints
  app.get("/api/medications", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const medications = await storage.getMedications();
      res.json(medications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/medications", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const data = insertMedicationSchema.parse(req.body);
      const medication = await storage.createMedication(data);
      res.status(201).json(medication);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Prescriptions endpoints
  app.get("/api/prescriptions", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const prescriptions = await storage.getPrescriptions();
      res.json(prescriptions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/prescriptions/:id", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const prescription = await storage.getPrescriptionWithDetails(req.params.id);
      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      res.json(prescription);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/prescriptions", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      const { medications, ...prescriptionData } = req.body;
      
      // Validate prescription data
      const validatedPrescription = insertPrescriptionSchema.parse(prescriptionData);
      
      // Create prescription
      const prescription = await storage.createPrescription(validatedPrescription);
      
      // Create prescription medications if provided
      if (medications && Array.isArray(medications)) {
        for (const med of medications) {
          const validatedMed = insertPrescriptionMedicationSchema.parse({
            ...med,
            prescriptionId: prescription.id
          });
          await storage.createPrescriptionMedication(validatedMed);
        }
      }
      
      res.status(201).json(prescription);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Lab Tests endpoints
  app.get("/api/lab-tests", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const labTests = await storage.getLabTests();
      res.json(labTests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/lab-tests", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const data = insertLabTestSchema.parse(req.body);
      const labTest = await storage.createLabTest(data);
      res.status(201).json(labTest);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Test Orders endpoints
  app.get("/api/test-orders", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const testOrders = await storage.getTestOrders();
      res.json(testOrders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/test-orders", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const data = insertTestOrderSchema.parse(req.body);
      const testOrder = await storage.createTestOrder(data);
      res.status(201).json(testOrder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/test-orders/:id", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const data = insertTestOrderSchema.partial().parse(req.body);
      const testOrder = await storage.updateTestOrder(req.params.id, data);
      if (!testOrder) {
        return res.status(404).json({ message: "Test order not found" });
      }
      res.json(testOrder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Bills endpoints
  app.get("/api/bills", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const bills = await storage.getBills();
      res.json(bills);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/bills", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const data = insertBillSchema.parse(req.body);
      const bill = await storage.createBill(data);
      res.status(201).json(bill);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Payments endpoints
  app.post("/api/payments", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const data = insertPaymentSchema.parse(req.body);
      
      // Validate payment doesn't exceed bill total
      const bills = await storage.getBills();
      const bill = bills.find(b => b.id === data.billId);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      const payments = await storage.getPayments(data.billId);
      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const newTotal = totalPaid + Number(data.amount);

      if (newTotal > Number(bill.totalAmount)) {
        return res.status(400).json({ 
          message: "Payment amount exceeds bill total" 
        });
      }

      const payment = await storage.createPayment(data);
      res.status(201).json(payment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Patient Alerts endpoints
  app.get("/api/patient-alerts/:patientId", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const alerts = await storage.getPatientAlerts(req.params.patientId);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Patient Events endpoints
  app.get("/api/patient-events/:patientId", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const events = await storage.getPatientEvents(req.params.patientId);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Health Vitals endpoints
  app.get("/api/health-vitals/:patientId", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const vitals = await storage.getHealthVitals(req.params.patientId);
      res.json(vitals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Vaccinations endpoints
  app.get("/api/vaccinations/:patientId", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const vaccinations = await storage.getVaccinations(req.params.patientId);
      res.json(vaccinations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Metrics endpoint
  app.get("/api/metrics", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const metrics = await storage.getMetrics();
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== PATIENT PORTAL ENDPOINTS ==========
  
  // Get patient data by user ID (for patient portal)
  app.get("/api/portal/patient", authMiddleware, requireRole("patient"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const patient = await storage.getPatientByUserId(userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }
      res.json(patient);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get patient's appointments
  app.get("/api/portal/appointments", authMiddleware, requireRole("patient"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const patient = await storage.getPatientByUserId(userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      const appointments = await storage.getPatientAppointments(patient.id);
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get patient's prescriptions
  app.get("/api/portal/prescriptions", authMiddleware, requireRole("patient"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const patient = await storage.getPatientByUserId(userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      const prescriptions = await storage.getPatientPrescriptions(patient.id);
      res.json(prescriptions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get patient's lab results
  app.get("/api/portal/lab-results", authMiddleware, requireRole("patient"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const patient = await storage.getPatientByUserId(userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      const testOrders = await storage.getPatientTestOrders(patient.id);
      res.json(testOrders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get patient's bills
  app.get("/api/portal/bills", authMiddleware, requireRole("patient"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const patient = await storage.getPatientByUserId(userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      const bills = await storage.getPatientBills(patient.id);
      res.json(bills);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get patient's health vitals
  app.get("/api/portal/vitals", authMiddleware, requireRole("patient"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const patient = await storage.getPatientByUserId(userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      const vitals = await storage.getHealthVitals(patient.id);
      res.json(vitals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get patient's vaccinations
  app.get("/api/portal/vaccinations", authMiddleware, requireRole("patient"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const patient = await storage.getPatientByUserId(userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      const vaccinations = await storage.getVaccinations(patient.id);
      res.json(vaccinations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get patient's timeline events
  app.get("/api/portal/timeline", authMiddleware, requireRole("patient"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const patient = await storage.getPatientByUserId(userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      const events = await storage.getPatientEvents(patient.id);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== PRESCRIPTION TEMPLATES ENDPOINTS ==========
  
  app.get("/api/prescription-templates", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      const templates = await storage.getPrescriptionTemplates(doctor.id);
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/prescription-templates", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      const data = insertPrescriptionTemplateSchema.parse({
        ...req.body,
        doctorId: doctor.id
      });
      const template = await storage.createPrescriptionTemplate(data);
      res.status(201).json(template);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/prescription-templates/:id", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      await storage.deletePrescriptionTemplate(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== SOAP NOTES ENDPOINTS ==========
  
  app.get("/api/soap-notes/appointment/:appointmentId", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      const soapNote = await storage.getSoapNoteByAppointment(req.params.appointmentId);
      res.json(soapNote || {});
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/soap-notes", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      const data = insertSoapNoteSchema.parse(req.body);
      const soapNote = await storage.createSoapNote(data);
      res.status(201).json(soapNote);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/soap-notes/:id", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      const data = insertSoapNoteSchema.partial().parse(req.body);
      const soapNote = await storage.updateSoapNote(req.params.id, data);
      if (!soapNote) {
        return res.status(404).json({ message: "SOAP note not found" });
      }
      res.json(soapNote);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ========== REFERRALS ENDPOINTS ==========
  
  app.get("/api/referrals/sent", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      const referrals = await storage.getReferralsByDoctor(doctor.id, "from");
      res.json(referrals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/referrals/received", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      const referrals = await storage.getReferralsByDoctor(doctor.id, "to");
      res.json(referrals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/referrals", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      const data = insertReferralSchema.parse({
        ...req.body,
        fromDoctorId: doctor.id
      });
      const referral = await storage.createReferral(data);
      res.status(201).json(referral);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/referrals/:id/status", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      const { status } = z.object({ status: z.string() }).parse(req.body);
      const referral = await storage.updateReferralStatus(req.params.id, status);
      if (!referral) {
        return res.status(404).json({ message: "Referral not found" });
      }
      res.json(referral);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ========== MESSAGES ENDPOINTS ==========
  
  app.get("/api/messages", authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const messages = await storage.getMessagesByUser(userId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/messages/conversation/:otherUserId", authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const conversation = await storage.getConversation(userId, req.params.otherUserId);
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/messages", authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const data = insertMessageSchema.parse({
        ...req.body,
        senderId: userId
      });
      const message = await storage.createMessage(data);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/messages/:id/read", authMiddleware, async (req, res) => {
    try {
      const message = await storage.markMessageAsRead(req.params.id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== REFILL REQUESTS ENDPOINTS ==========
  
  app.get("/api/refill-requests/patient", authMiddleware, requireRole("patient"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const patient = await storage.getPatientByUserId(userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      const requests = await storage.getRefillRequestsByPatient(patient.id);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/refill-requests/doctor", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      const requests = await storage.getRefillRequestsByDoctor(doctor.id);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/refill-requests", authMiddleware, requireRole("patient"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const patient = await storage.getPatientByUserId(userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      const data = insertRefillRequestSchema.parse({
        ...req.body,
        patientId: patient.id
      });
      const request = await storage.createRefillRequest(data);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/refill-requests/:id/status", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      const { status, newPrescriptionId } = z.object({
        status: z.string(),
        newPrescriptionId: z.string().optional()
      }).parse(req.body);
      const request = await storage.updateRefillRequestStatus(req.params.id, status, newPrescriptionId);
      if (!request) {
        return res.status(404).json({ message: "Refill request not found" });
      }
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ========== DOCTOR FEEDBACK ENDPOINTS ==========
  
  app.get("/api/feedback/doctor/:doctorId", authMiddleware, async (req, res) => {
    try {
      const feedback = await storage.getDoctorFeedback(req.params.doctorId);
      res.json(feedback);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/feedback", authMiddleware, requireRole("patient"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const patient = await storage.getPatientByUserId(userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      const data = insertDoctorFeedbackSchema.parse({
        ...req.body,
        patientId: patient.id
      });
      const feedback = await storage.createDoctorFeedback(data);
      res.status(201).json(feedback);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ========== RECURRING APPOINTMENTS ENDPOINTS ==========
  
  app.get("/api/recurring-appointments", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      const { patientId, doctorId } = req.query;
      const appointments = await storage.getRecurringAppointments(
        patientId as string | undefined,
        doctorId as string | undefined
      );
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/recurring-appointments", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      const data = insertRecurringAppointmentSchema.parse(req.body);
      const appointment = await storage.createRecurringAppointment(data);
      res.status(201).json(appointment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/recurring-appointments/:id", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      const data = insertRecurringAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateRecurringAppointment(req.params.id, data);
      if (!appointment) {
        return res.status(404).json({ message: "Recurring appointment not found" });
      }
      res.json(appointment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ========== DOCTOR-SPECIFIC ENDPOINTS ==========
  
  app.get("/api/doctor/profile", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      res.json(doctor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/doctor/appointments", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      const date = req.query.date as string | undefined;
      const appointments = await storage.getDoctorAppointments(doctor.id, date);
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/doctor/patients", authMiddleware, requireRole("doctor"), async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      const patients = await storage.getDoctorPatients(doctor.id);
      res.json(patients);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== NOTIFICATIONS ENDPOINTS ==========
  
  app.get("/api/notifications", authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/notifications/unread", authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const notifications = await storage.getUnreadNotifications(userId);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/notifications", authMiddleware, async (req, res) => {
    try {
      const data = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(data);
      res.status(201).json(notification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/notifications/:id/read", authMiddleware, async (req, res) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/notifications/read-all", authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      await storage.markAllNotificationsAsRead(userId);
      const updatedNotifications = await storage.getNotifications(userId);
      res.json({ message: "All notifications marked as read", notifications: updatedNotifications });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== INVENTORY ALERTS ENDPOINTS ==========
  
  app.get("/api/inventory/expiring", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const medications = await storage.getExpiringMedications(days);
      res.json(medications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inventory/low-stock", authMiddleware, requireRole("admin", "doctor"), async (req, res) => {
    try {
      const medications = await storage.getLowStockMedications();
      res.json(medications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

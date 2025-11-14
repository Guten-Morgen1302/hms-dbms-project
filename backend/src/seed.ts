import "dotenv/config";
import { db } from "./db";
import { 
  users, departments, doctors, patients, appointments, prescriptions, 
  prescriptionMedications, medications, labTests, testOrders, bills, 
  payments, rooms, beds, healthVitals, vaccinations, patientEvents,
  patientAlerts
} from "./shared/schema";
import { hashPassword } from "./auth";

const indianFirstNamesMale = [
  "Aarav", "Arjun", "Rohan", "Vikram", "Karan", "Aditya", "Aryan", "Kabir", "Sahil", "Dev",
  "Ishaan", "Vivaan", "Reyansh", "Ayaan", "Krishna", "Sai", "Advait", "Dhruv", "Aadhya", "Arnav",
  "Pranav", "Atharv", "Rudra", "Vihaan", "Shivansh", "Aarush", "Yash", "Raj", "Om", "Aadi",
  "Kartik", "Shaurya", "Tanish", "Lakshya", "Veer", "Manav", "Rishaan", "Krish", "Samar", "Neil"
];

const indianFirstNamesFemale = [
  "Diya", "Priyanka", "Ananya", "Ishita", "Simran", "Riya", "Meera", "Sneha", "Kavya", "Aadhya",
  "Pari", "Anvi", "Saanvi", "Kiara", "Avni", "Myra", "Aanya", "Sara", "Isha", "Navya",
  "Shanaya", "Larisa", "Jiya", "Reet", "Tara", "Naina", "Sia", "Mira", "Vanya", "Anaya",
  "Aradhya", "Aditi", "Suhana", "Shriya", "Nidhi", "Anjali", "Pooja", "Swati", "Neha", "Divya"
];

const indianLastNames = [
  "Sharma", "Verma", "Patel", "Kumar", "Singh", "Reddy", "Gupta", "Mehta", "Iyer", "Nair",
  "Joshi", "Rao", "Kapoor", "Malhotra", "Deshmukh", "Shah", "Agarwal", "Chopra", "Khanna", "Sinha",
  "Banerjee", "Mukherjee", "Das", "Roy", "Bose", "Ghosh", "Chatterjee", "Kaur", "Gill", "Sethi",
  "Bajaj", "Mittal", "Saxena", "Arora", "Bhatia", "Tiwari", "Pandey", "Mishra", "Dubey", "Jain"
];

const indianCities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
  "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
  "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana",
  "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivali", "Vasai-Virar", "Varanasi"
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const departmentList = [
  { name: "Cardiology", description: "Heart and cardiovascular system", floor: 3 },
  { name: "Neurology", description: "Brain and nervous system", floor: 4 },
  { name: "Orthopedics", description: "Bones and joints treatment", floor: 2 },
  { name: "Pediatrics", description: "Children's healthcare", floor: 1 },
  { name: "General Medicine", description: "General health and wellness", floor: 0 },
  { name: "Dermatology", description: "Skin and hair treatment", floor: 2 },
  { name: "Ophthalmology", description: "Eye care and vision", floor: 3 },
  { name: "ENT (Ear, Nose, Throat)", description: "ENT specialist care", floor: 2 },
  { name: "Psychiatry", description: "Mental health services", floor: 5 },
  { name: "Oncology", description: "Cancer treatment and care", floor: 4 },
  { name: "Nephrology", description: "Kidney diseases treatment", floor: 3 },
  { name: "Pulmonology", description: "Respiratory system care", floor: 3 },
  { name: "Gastroenterology", description: "Digestive system treatment", floor: 2 },
  { name: "Endocrinology", description: "Hormone and metabolism disorders", floor: 3 },
  { name: "Rheumatology", description: "Joint and autoimmune disorders", floor: 2 },
  { name: "Obstetrics & Gynecology", description: "Women's health", floor: 1 },
  { name: "Urology", description: "Urinary tract treatment", floor: 2 },
  { name: "Emergency Medicine", description: "24/7 emergency care", floor: 0 },
  { name: "Radiology", description: "Medical imaging services", floor: -1 },
  { name: "Anesthesiology", description: "Surgical anesthesia services", floor: 1 }
];

const indianMedicationList = [
  { name: "Crocin", genericName: "Paracetamol", dosageForm: "Tablet", strength: "500mg", manufacturer: "GlaxoSmithKline", price: "2.00" },
  { name: "Dolo", genericName: "Paracetamol", dosageForm: "Tablet", strength: "650mg", manufacturer: "Micro Labs", price: "3.00" },
  { name: "Azithral", genericName: "Azithromycin", dosageForm: "Tablet", strength: "250mg", manufacturer: "Alembic Pharmaceuticals", price: "15.00" },
  { name: "Augmentin", genericName: "Amoxicillin + Clavulanic Acid", dosageForm: "Tablet", strength: "625mg", manufacturer: "GlaxoSmithKline", price: "25.00" },
  { name: "Telma", genericName: "Telmisartan", dosageForm: "Tablet", strength: "40mg", manufacturer: "Glenmark Pharmaceuticals", price: "8.00" },
  { name: "Glycomet", genericName: "Metformin", dosageForm: "Tablet", strength: "500mg", manufacturer: "USV Private Limited", price: "3.00" },
  { name: "Ecosprin", genericName: "Aspirin", dosageForm: "Tablet", strength: "75mg", manufacturer: "USV Private Limited", price: "1.00" },
  { name: "Pantop", genericName: "Pantoprazole", dosageForm: "Tablet", strength: "40mg", manufacturer: "Aristo Pharmaceuticals", price: "6.00" },
  { name: "Allegra", genericName: "Fexofenadine", dosageForm: "Tablet", strength: "120mg", manufacturer: "Sanofi India", price: "12.00" },
  { name: "Combiflam", genericName: "Ibuprofen + Paracetamol", dosageForm: "Tablet", strength: "400mg + 325mg", manufacturer: "Sanofi India", price: "5.00" },
  { name: "Shelcal", genericName: "Calcium + Vitamin D3", dosageForm: "Tablet", strength: "500mg + 250 IU", manufacturer: "Torrent Pharmaceuticals", price: "10.00" },
  { name: "Becosules", genericName: "Vitamin B Complex", dosageForm: "Capsule", strength: "Multi", manufacturer: "Pfizer", price: "8.00" },
  { name: "Cetrizine", genericName: "Cetirizine", dosageForm: "Tablet", strength: "10mg", manufacturer: "Cipla", price: "4.00" },
  { name: "Montair", genericName: "Montelukast", dosageForm: "Tablet", strength: "10mg", manufacturer: "Cipla", price: "15.00" },
  { name: "Levolin", genericName: "Levosalbutamol", dosageForm: "Inhaler", strength: "50mcg", manufacturer: "Cipla", price: "120.00" },
  { name: "Asthalin", genericName: "Salbutamol", dosageForm: "Inhaler", strength: "100mcg", manufacturer: "Cipla", price: "110.00" },
  { name: "Omnacortil", genericName: "Prednisolone", dosageForm: "Tablet", strength: "5mg", manufacturer: "Macleods Pharmaceuticals", price: "7.00" },
  { name: "Wysolone", genericName: "Prednisolone", dosageForm: "Tablet", strength: "10mg", manufacturer: "Pfizer", price: "8.00" },
  { name: "Betnesol", genericName: "Betamethasone", dosageForm: "Tablet", strength: "0.5mg", manufacturer: "GlaxoSmithKline", price: "12.00" },
  { name: "Ciprofloxacin", genericName: "Ciprofloxacin", dosageForm: "Tablet", strength: "500mg", manufacturer: "Ranbaxy", price: "18.00" },
  { name: "Amoxicillin", genericName: "Amoxicillin", dosageForm: "Capsule", strength: "500mg", manufacturer: "Sun Pharma", price: "10.00" },
  { name: "Norflox", genericName: "Norfloxacin", dosageForm: "Tablet", strength: "400mg", manufacturer: "Cipla", price: "14.00" },
  { name: "Metrogyl", genericName: "Metronidazole", dosageForm: "Tablet", strength: "400mg", manufacturer: "J.B. Chemicals", price: "6.00" },
  { name: "Rantac", genericName: "Ranitidine", dosageForm: "Tablet", strength: "150mg", manufacturer: "J.B. Chemicals", price: "5.00" },
  { name: "Digene", genericName: "Aluminium Hydroxide + Magnesium Hydroxide", dosageForm: "Syrup", strength: "10ml", manufacturer: "Abbott", price: "65.00" },
  { name: "Gelusil", genericName: "Aluminium Hydroxide + Magnesium Hydroxide", dosageForm: "Tablet", strength: "Multi", manufacturer: "Pfizer", price: "3.00" },
  { name: "Avomine", genericName: "Promethazine", dosageForm: "Tablet", strength: "25mg", manufacturer: "Sanofi India", price: "9.00" },
  { name: "Cyclopam", genericName: "Dicyclomine + Paracetamol", dosageForm: "Tablet", strength: "20mg + 500mg", manufacturer: "Indoco Remedies", price: "11.00" },
  { name: "Buscopan", genericName: "Hyoscine Butylbromide", dosageForm: "Tablet", strength: "10mg", manufacturer: "Sanofi India", price: "13.00" },
  { name: "Disprin", genericName: "Aspirin", dosageForm: "Tablet", strength: "350mg", manufacturer: "Reckitt Benckiser", price: "2.50" },
  { name: "Brufen", genericName: "Ibuprofen", dosageForm: "Tablet", strength: "400mg", manufacturer: "Abbott", price: "6.00" },
  { name: "Voveran", genericName: "Diclofenac", dosageForm: "Tablet", strength: "50mg", manufacturer: "Novartis", price: "7.00" },
  { name: "Volini", genericName: "Diclofenac", dosageForm: "Gel", strength: "1%", manufacturer: "Ranbaxy", price: "95.00" },
  { name: "Moov", genericName: "Diclofenac + Menthol", dosageForm: "Cream", strength: "Multi", manufacturer: "Reckitt Benckiser", price: "85.00" },
  { name: "Iodex", genericName: "Povidone Iodine", dosageForm: "Ointment", strength: "5%", manufacturer: "GlaxoSmithKline", price: "55.00" },
  { name: "Lacto Calamine", genericName: "Calamine + Glycerine", dosageForm: "Lotion", strength: "Multi", manufacturer: "Piramal Healthcare", price: "105.00" },
  { name: "Dermicool", genericName: "Menthol + Camphor", dosageForm: "Powder", strength: "Multi", manufacturer: "Paras Pharmaceuticals", price: "75.00" },
  { name: "Candid", genericName: "Clotrimazole", dosageForm: "Cream", strength: "1%", manufacturer: "Glenmark Pharmaceuticals", price: "68.00" },
  { name: "Luliconazole", genericName: "Luliconazole", dosageForm: "Cream", strength: "1%", manufacturer: "Glenmark Pharmaceuticals", price: "115.00" },
  { name: "Terbinafine", genericName: "Terbinafine", dosageForm: "Cream", strength: "1%", manufacturer: "Novartis", price: "125.00" },
  { name: "Betadine", genericName: "Povidone Iodine", dosageForm: "Solution", strength: "10%", manufacturer: "Win-Medicare", price: "95.00" },
  { name: "Soframycin", genericName: "Framycetin", dosageForm: "Cream", strength: "1%", manufacturer: "Sanofi India", price: "58.00" },
  { name: "Neosporin", genericName: "Neomycin + Polymyxin B + Bacitracin", dosageForm: "Ointment", strength: "Multi", manufacturer: "Johnson & Johnson", price: "125.00" },
  { name: "Otrivin", genericName: "Xylometazoline", dosageForm: "Nasal Drops", strength: "0.1%", manufacturer: "Novartis", price: "72.00" },
  { name: "Nasivion", genericName: "Oxymetazoline", dosageForm: "Nasal Drops", strength: "0.05%", manufacturer: "Merck", price: "68.00" },
  { name: "Zyrtec", genericName: "Cetirizine", dosageForm: "Syrup", strength: "5mg/5ml", manufacturer: "UCB India", price: "85.00" },
  { name: "Benadryl", genericName: "Diphenhydramine", dosageForm: "Syrup", strength: "14mg/5ml", manufacturer: "Johnson & Johnson", price: "95.00" },
  { name: "Cheston Cold", genericName: "Paracetamol + Phenylephrine + Cetirizine", dosageForm: "Tablet", strength: "Multi", manufacturer: "Cipla", price: "14.00" },
  { name: "Sinarest", genericName: "Paracetamol + Phenylephrine + Chlorpheniramine", dosageForm: "Tablet", strength: "Multi", manufacturer: "Centaur Pharmaceuticals", price: "12.00" },
  { name: "D-Cold", genericName: "Paracetamol + Phenylephrine + Cetirizine", dosageForm: "Tablet", strength: "Multi", manufacturer: "Paras Pharmaceuticals", price: "11.00" }
];

const labTestsList = [
  { testName: "Complete Blood Count (CBC)", testCode: "CBC001", category: "Hematology", price: "250.00", normalRange: "WBC: 4000-11000/μL, RBC: 4.5-5.5 M/μL" },
  { testName: "Lipid Profile", testCode: "LIP001", category: "Biochemistry", price: "450.00", normalRange: "Total Cholesterol: <200 mg/dL, LDL: <100 mg/dL" },
  { testName: "Liver Function Test (LFT)", testCode: "LFT001", category: "Biochemistry", price: "400.00", normalRange: "SGOT: 5-40 U/L, SGPT: 7-56 U/L" },
  { testName: "Kidney Function Test (KFT)", testCode: "KFT001", category: "Biochemistry", price: "400.00", normalRange: "Creatinine: 0.7-1.3 mg/dL, Urea: 15-40 mg/dL" },
  { testName: "Thyroid Profile (T3, T4, TSH)", testCode: "THY001", category: "Endocrinology", price: "550.00", normalRange: "TSH: 0.4-4.0 mIU/L, T4: 5-12 μg/dL" },
  { testName: "Fasting Blood Sugar (FBS)", testCode: "FBS001", category: "Biochemistry", price: "80.00", normalRange: "70-100 mg/dL" },
  { testName: "HbA1c (Glycated Hemoglobin)", testCode: "HBA001", category: "Biochemistry", price: "350.00", normalRange: "<5.7% (Normal), 5.7-6.4% (Prediabetic)" },
  { testName: "Urine Routine & Microscopy", testCode: "URM001", category: "Pathology", price: "150.00", normalRange: "pH: 4.5-8.0, Specific Gravity: 1.005-1.030" },
  { testName: "ECG (Electrocardiogram)", testCode: "ECG001", category: "Cardiology", price: "200.00", normalRange: "Heart Rate: 60-100 bpm, Normal sinus rhythm" },
  { testName: "Chest X-Ray", testCode: "XRA001", category: "Radiology", price: "350.00", normalRange: "Normal lung fields, no abnormalities" },
  { testName: "Vitamin D Test", testCode: "VID001", category: "Biochemistry", price: "800.00", normalRange: "30-100 ng/mL (Sufficient)" },
  { testName: "Vitamin B12 Test", testCode: "VIB001", category: "Biochemistry", price: "650.00", normalRange: "200-900 pg/mL" },
  { testName: "Iron Studies", testCode: "IRN001", category: "Hematology", price: "550.00", normalRange: "Serum Iron: 60-170 μg/dL" },
  { testName: "ESR (Erythrocyte Sedimentation Rate)", testCode: "ESR001", category: "Hematology", price: "100.00", normalRange: "Men: <15 mm/hr, Women: <20 mm/hr" },
  { testName: "CRP (C-Reactive Protein)", testCode: "CRP001", category: "Immunology", price: "450.00", normalRange: "<3.0 mg/L" }
];

const medicalConditions = [
  "Hypertension", "Diabetes Mellitus Type 2", "Asthma", "Thyroid disorder", "High cholesterol",
  "Migraine", "GERD (Acid Reflux)", "Arthritis", "Anxiety", "Depression",
  "Chronic kidney disease", "COPD", "Obesity", "Anemia", "Healthy - no conditions"
];

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function randomTime(): string {
  const hour = Math.floor(Math.random() * 9) + 9;
  const minute = Math.random() < 0.5 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}:00`;
}

function getEndTime(startTime: string): string {
  const [hour, minute] = startTime.split(':').map(Number);
  const endHour = minute === 30 ? hour + 1 : hour;
  const endMinute = minute === 30 ? '00' : '30';
  return `${endHour.toString().padStart(2, '0')}:${endMinute}:00`;
}

async function seed() {
  console.log("🌱 Starting comprehensive Indian HMS database seeding...");
  
  try {
    console.log("Clearing existing data...");
    await db.delete(patientAlerts);
    await db.delete(patientEvents);
    await db.delete(vaccinations);
    await db.delete(healthVitals);
    await db.delete(payments);
    await db.delete(bills);
    await db.delete(testOrders);
    await db.delete(labTests);
    await db.delete(prescriptionMedications);
    await db.delete(prescriptions);
    await db.delete(appointments);
    await db.delete(beds);
    await db.delete(rooms);
    await db.delete(patients);
    await db.delete(doctors);
    await db.delete(departments);
    await db.delete(medications);
    await db.delete(users);
    console.log("✅ Cleared existing data");

    console.log("Creating departments...");
    const createdDepartments = await db.insert(departments).values(departmentList).returning();
    console.log(`✅ Created ${createdDepartments.length} departments`);

    console.log("Creating admin user...");
    const [adminUser] = await db.insert(users).values({
      username: "admin",
      password: await hashPassword("admin123"),
      role: "admin",
      name: "System Administrator",
      email: "admin@hospital.com",
      phone: "+91-9876543210",
    }).returning();
    console.log("✅ Created admin user (admin/admin123)");

    console.log("Creating doctor users...");
    const doctorUsersData = [];
    const doctorSpecializations = [
      "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "General Medicine",
      "Dermatology", "Ophthalmology", "ENT", "Psychiatry", "Oncology",
      "Nephrology", "Pulmonology", "Gastroenterology", "Endocrinology", "Rheumatology",
      "Obstetrics & Gynecology", "Urology", "Emergency Medicine"
    ];

    for (let i = 0; i < 18; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const firstName = gender === 'male' ? indianFirstNamesMale[i % indianFirstNamesMale.length] : indianFirstNamesFemale[i % indianFirstNamesFemale.length];
      const lastName = indianLastNames[i % indianLastNames.length];
      const username = `dr${firstName.toLowerCase()}${i}`;
      
      doctorUsersData.push({
        username,
        password: await hashPassword("doctor123"),
        role: "doctor" as const,
        name: `Dr. ${firstName} ${lastName}`,
        email: `${username}@hospital.com`,
        phone: `+91-98765432${(20 + i).toString().padStart(2, '0')}`,
      });
    }

    const createdDoctorUsers = await db.insert(users).values(doctorUsersData).returning();
    console.log(`✅ Created ${createdDoctorUsers.length} doctor users (doctor123)`);

    console.log("Creating doctor profiles...");
    const doctorProfilesData = createdDoctorUsers.map((user, i) => ({
      userId: user.id,
      departmentId: createdDepartments[i % createdDepartments.length].id,
      specialization: doctorSpecializations[i % doctorSpecializations.length],
      licenseNumber: `MCI-${10000 + i}`,
      yearsOfExperience: Math.floor(Math.random() * 20) + 5,
    }));

    const createdDoctors = await db.insert(doctors).values(doctorProfilesData).returning();
    console.log(`✅ Created ${createdDoctors.length} doctor profiles`);

    console.log("Creating default patient user...");
    const [defaultPatientUser] = await db.insert(users).values({
      username: "patient",
      password: await hashPassword("patient123"),
      role: "patient",
      name: "Test Patient",
      email: "patient@email.com",
      phone: "+91-9123456789",
    }).returning();
    console.log("✅ Created default patient user (patient/patient123)");

    console.log("Creating additional patient users...");
    const patientUsersData = [];
    
    for (let i = 0; i < 49; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const firstName = gender === 'male' ? indianFirstNamesMale[i % indianFirstNamesMale.length] : indianFirstNamesFemale[i % indianFirstNamesFemale.length];
      const lastName = indianLastNames[i % indianLastNames.length];
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`;
      
      patientUsersData.push({
        username,
        password: await hashPassword("patient123"),
        role: "patient" as const,
        name: `${firstName} ${lastName}`,
        email: `${username}@email.com`,
        phone: `+91-91234567${(80 + i).toString().padStart(2, '0')}`,
      });
    }

    const createdPatientUsers = await db.insert(users).values(patientUsersData).returning();
    console.log(`✅ Created ${createdPatientUsers.length} additional patient users (patient123)`);

    console.log("Creating patient profiles...");
    // Include default patient user in the list
    const allPatientUsers = [defaultPatientUser, ...createdPatientUsers];
    const patientProfilesData = allPatientUsers.map((user, i) => {
      const birthYear = 1950 + Math.floor(Math.random() * 50);
      const city = indianCities[i % indianCities.length];
      const condition = medicalConditions[i % medicalConditions.length];
      
      return {
        userId: user.id,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ')[1] || user.name.split(' ')[0],
        dateOfBirth: `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        gender: Math.random() > 0.5 ? ("male" as const) : ("female" as const),
        phone: user.phone || `+91-${9100000000 + i}`,
        email: user.email,
        address: `${Math.floor(Math.random() * 200) + 1}, ${city}, India - ${400000 + Math.floor(Math.random() * 100000)}`,
        bloodGroup: bloodGroups[i % bloodGroups.length],
        emergencyContactName: `Emergency Contact ${i + 1}`,
        emergencyContactPhone: `+91-${9000000000 + i}`,
        medicalHistory: condition,
        allergies: i % 7 === 0 ? "Penicillin" : (i % 11 === 0 ? "Sulfa drugs" : "None"),
      };
    });

    const createdPatients = await db.insert(patients).values(patientProfilesData).returning();
    console.log(`✅ Created ${createdPatients.length} patient profiles`);

    console.log("Creating medications...");
    const medicationsData = indianMedicationList.map(med => ({
      name: med.name,
      genericName: med.genericName,
      dosageForm: med.dosageForm,
      strength: med.strength,
      manufacturer: med.manufacturer,
      unitPrice: med.price,
      stockQuantity: Math.floor(Math.random() * 400) + 100,
      reorderLevel: 50,
      description: `${med.genericName} - ${med.dosageForm} ${med.strength}`,
    }));

    const createdMedications = await db.insert(medications).values(medicationsData).returning();
    console.log(`✅ Created ${createdMedications.length} medications`);

    console.log("Creating lab tests...");
    const labTestsData = labTestsList.map(test => ({
      testName: test.testName,
      testCode: test.testCode,
      category: test.category,
      price: test.price,
      normalRange: test.normalRange,
      description: test.testName,
      preparationInstructions: test.category === "Biochemistry" ? "Fasting required for 8-12 hours" : "No special preparation needed",
    }));

    const createdLabTests = await db.insert(labTests).values(labTestsData).returning();
    console.log(`✅ Created ${createdLabTests.length} lab tests`);

    console.log("Creating appointments...");
    const appointmentsData = [];
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < 120; i++) {
      const patient = createdPatients[i % createdPatients.length];
      const doctor = createdDoctors[Math.floor(Math.random() * createdDoctors.length)];
      const appointmentDate = randomDate(oneWeekAgo, twoWeeksFromNow);
      const startTime = randomTime();
      const status = new Date(appointmentDate) < today 
        ? (Math.random() > 0.2 ? "completed" as const : "cancelled" as const)
        : "scheduled" as const;

      appointmentsData.push({
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentDate,
        startTime,
        endTime: getEndTime(startTime),
        status,
        reason: ["Regular checkup", "Follow-up visit", "New symptoms", "Routine screening", "Medication review"][i % 5],
        notes: status === "completed" ? "Visit completed successfully" : null,
      });
    }

    const createdAppointments = await db.insert(appointments).values(appointmentsData).returning();
    console.log(`✅ Created ${createdAppointments.length} appointments`);

    console.log("Creating prescriptions with medications...");
    const prescriptionsData = [];
    const prescriptionMedicationsData: Array<{
      prescriptionId: string;
      medicationId: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }> = [];

    for (let i = 0; i < 80; i++) {
      const patient = createdPatients[i % createdPatients.length];
      const doctor = createdDoctors[Math.floor(Math.random() * createdDoctors.length)];
      const prescriptionDate = randomDate(oneWeekAgo, today);

      prescriptionsData.push({
        patientId: patient.id,
        doctorId: doctor.id,
        prescriptionDate,
        diagnosis: ["Viral fever", "Hypertension", "Diabetes management", "Respiratory infection", "Gastritis"][i % 5],
        notes: "Take medications as prescribed. Follow up if symptoms persist.",
      });
    }

    const createdPrescriptions = await db.insert(prescriptions).values(prescriptionsData).returning();

    createdPrescriptions.forEach((prescription, i) => {
      const numMeds = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numMeds; j++) {
        const medication = createdMedications[(i * numMeds + j) % createdMedications.length];
        prescriptionMedicationsData.push({
          prescriptionId: prescription.id,
          medicationId: medication.id,
          dosage: ["1 tablet", "2 tablets", "1 capsule", "5ml"][j % 4],
          frequency: ["OD (Once daily)", "BD (Twice daily)", "TDS (Three times daily)", "QID (Four times daily)"][j % 4],
          duration: ["5 days", "7 days", "10 days", "14 days", "1 month"][j % 5],
          instructions: ["Take after food", "Take before food", "Take with water", "Take at bedtime"][j % 4],
        });
      }
    });

    await db.insert(prescriptionMedications).values(prescriptionMedicationsData);
    console.log(`✅ Created ${createdPrescriptions.length} prescriptions with medications`);

    console.log("Creating test orders with results...");
    const testOrdersData = [];

    for (let i = 0; i < 100; i++) {
      const patient = createdPatients[i % createdPatients.length];
      const doctor = createdDoctors[Math.floor(Math.random() * createdDoctors.length)];
      const labTest = createdLabTests[i % createdLabTests.length];
      const orderDate = new Date(randomDate(oneWeekAgo, today));
      const status = orderDate < new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)
        ? "reported" as const
        : (orderDate < today ? "collected" as const : "ordered" as const);

      testOrdersData.push({
        patientId: patient.id,
        doctorId: doctor.id,
        labTestId: labTest.id,
        orderDate,
        status,
        collectedDate: status !== "ordered" ? new Date(orderDate.getTime() + 24 * 60 * 60 * 1000) : undefined,
        reportedDate: status === "reported" ? new Date(orderDate.getTime() + 48 * 60 * 60 * 1000) : undefined,
        results: status === "reported" ? `${labTest.testName}: Within normal limits. ${labTest.normalRange}` : undefined,
        notes: "Sample collected successfully",
      });
    }

    await db.insert(testOrders).values(testOrdersData);
    console.log(`✅ Created ${testOrdersData.length} test orders`);

    console.log("Creating vitals records...");
    const vitalsData = [];

    for (let i = 0; i < 150; i++) {
      const patient = createdPatients[i % createdPatients.length];
      const recordedDate = new Date(randomDate(oneWeekAgo, today));

      vitalsData.push({
        patientId: patient.id,
        recordedDate,
        bloodPressureSystolic: 110 + Math.floor(Math.random() * 30),
        bloodPressureDiastolic: 70 + Math.floor(Math.random() * 20),
        heartRate: 60 + Math.floor(Math.random() * 40),
        temperature: "97.5",
        bloodSugar: "95.5",
        weight: "65.50",
        height: "170.00",
        oxygenSaturation: 95 + Math.floor(Math.random() * 5),
        notes: "Vitals recorded during checkup",
      });
    }

    await db.insert(healthVitals).values(vitalsData);
    console.log(`✅ Created ${vitalsData.length} vitals records`);

    console.log("Creating vaccination records...");
    const vaccinationsData = [];
    const vaccineNames = ["COVID-19 Covishield", "COVID-19 Covaxin", "Influenza", "Hepatitis B", "Tetanus", "Pneumococcal"];

    for (let i = 0; i < 100; i++) {
      const patient = createdPatients[i % createdPatients.length];
      const doctor = createdDoctors[Math.floor(Math.random() * createdDoctors.length)];
      const administeredDate = randomDate(new Date(2022, 0, 1), today);

      vaccinationsData.push({
        patientId: patient.id,
        vaccineName: vaccineNames[i % vaccineNames.length],
        administeredDate,
        administeredBy: doctor.id,
        batchNumber: `BATCH-${10000 + i}`,
        notes: "Vaccination administered successfully",
      });
    }

    await db.insert(vaccinations).values(vaccinationsData);
    console.log(`✅ Created ${vaccinationsData.length} vaccination records`);

    console.log("Creating billing records...");
    const billsData = [];

    for (let i = 0; i < 70; i++) {
      const patient = createdPatients[i % createdPatients.length];
      const billDate = new Date(randomDate(oneWeekAgo, today));
      const totalAmount = (Math.floor(Math.random() * 10000) + 1000).toString();
      const paidAmount = Math.random() > 0.3 ? totalAmount : "0";
      const status = paidAmount === totalAmount ? "paid" as const : (Math.random() > 0.5 ? "pending" as const : "overdue" as const);

      billsData.push({
        patientId: patient.id,
        billDate,
        totalAmount,
        paidAmount,
        status,
        description: "Medical consultation and treatment charges",
      });
    }

    await db.insert(bills).values(billsData);
    console.log(`✅ Created ${billsData.length} billing records`);

    console.log("Creating rooms and beds...");
    const roomsData = [];
    const roomTypes = ["General Ward", "Private Room", "ICU", "Deluxe Room", "Semi-Private"];

    for (let i = 0; i < 50; i++) {
      const department = createdDepartments[i % createdDepartments.length];
      roomsData.push({
        roomNumber: `${department.floor}${(100 + i).toString().substring(1)}`,
        departmentId: department.id,
        roomType: roomTypes[i % roomTypes.length],
        floor: department.floor || 0,
        capacity: roomTypes[i % roomTypes.length] === "General Ward" ? 4 : (roomTypes[i % roomTypes.length] === "Semi-Private" ? 2 : 1),
      });
    }

    const createdRooms = await db.insert(rooms).values(roomsData).returning();
    console.log(`✅ Created ${createdRooms.length} rooms`);

    const bedsData: Array<{
      roomId: string;
      bedNumber: string;
      status: "available" | "occupied" | "maintenance";
      patientId: string | null;
      assignedDate: Date | null;
    }> = [];
    createdRooms.forEach(room => {
      for (let i = 0; i < (room.capacity || 1); i++) {
        const isOccupied = Math.random() > 0.6;
        bedsData.push({
          roomId: room.id,
          bedNumber: `${room.roomNumber}-${String.fromCharCode(65 + i)}`,
          status: isOccupied ? ("occupied" as const) : ("available" as const),
          patientId: isOccupied ? createdPatients[Math.floor(Math.random() * createdPatients.length)].id : null,
          assignedDate: isOccupied ? new Date() : null,
        });
      }
    });

    await db.insert(beds).values(bedsData);
    console.log(`✅ Created ${bedsData.length} beds`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`  - Departments: ${createdDepartments.length}`);
    console.log(`  - Doctors: ${createdDoctors.length}`);
    console.log(`  - Patients: ${createdPatients.length}`);
    console.log(`  - Medications: ${createdMedications.length}`);
    console.log(`  - Lab Tests: ${createdLabTests.length}`);
    console.log(`  - Appointments: ${createdAppointments.length}`);
    console.log(`  - Prescriptions: ${createdPrescriptions.length}`);
    console.log(`  - Test Orders: ${testOrdersData.length}`);
    console.log(`  - Vitals: ${vitalsData.length}`);
    console.log(`  - Vaccinations: ${vaccinationsData.length}`);
    console.log(`  - Bills: ${billsData.length}`);
    console.log(`  - Rooms: ${createdRooms.length}`);
    console.log(`  - Beds: ${bedsData.length}`);
    console.log(`\n🔐 Login Credentials:`);
    console.log(`  Admin: admin / admin123`);
    console.log(`  Doctor: Use any doctor username / doctor123`);
    console.log(`  Patient: Use any patient username / patient123`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .catch(console.error)
  .finally(() => process.exit());

import { db } from "./db";
import { patientEvents } from "../shared/schema";
import type { InsertPatientEvent } from "../shared/schema";

export class EventWriter {
  async recordAppointmentScheduled(
    patientId: string,
    appointmentId: string,
    appointmentDate: string,
    doctorName: string,
    reason?: string
  ) {
    const event: InsertPatientEvent = {
      patientId,
      eventType: "appointment_scheduled",
      eventDate: new Date(),
      title: "Appointment Scheduled",
      description: `Scheduled appointment with Dr. ${doctorName} on ${appointmentDate}${reason ? ` for ${reason}` : ""}`,
      relatedId: appointmentId,
    };
    await db.insert(patientEvents).values(event);
  }

  async recordAppointmentCompleted(
    patientId: string,
    appointmentId: string,
    doctorName: string
  ) {
    const event: InsertPatientEvent = {
      patientId,
      eventType: "appointment_completed",
      eventDate: new Date(),
      title: "Appointment Completed",
      description: `Completed appointment with Dr. ${doctorName}`,
      relatedId: appointmentId,
    };
    await db.insert(patientEvents).values(event);
  }

  async recordPrescriptionIssued(
    patientId: string,
    prescriptionId: string,
    diagnosis: string,
    doctorName: string
  ) {
    const event: InsertPatientEvent = {
      patientId,
      eventType: "prescription_issued",
      eventDate: new Date(),
      title: "Prescription Issued",
      description: `Dr. ${doctorName} prescribed medication for ${diagnosis}`,
      relatedId: prescriptionId,
    };
    await db.insert(patientEvents).values(event);
  }

  async recordLabTestOrdered(
    patientId: string,
    testOrderId: string,
    testName: string,
    doctorName: string
  ) {
    const event: InsertPatientEvent = {
      patientId,
      eventType: "lab_test_ordered",
      eventDate: new Date(),
      title: "Lab Test Ordered",
      description: `Dr. ${doctorName} ordered ${testName}`,
      relatedId: testOrderId,
    };
    await db.insert(patientEvents).values(event);
  }

  async recordLabResultsReported(
    patientId: string,
    testOrderId: string,
    testName: string
  ) {
    const event: InsertPatientEvent = {
      patientId,
      eventType: "lab_results_reported",
      eventDate: new Date(),
      title: "Lab Results Ready",
      description: `Results available for ${testName}`,
      relatedId: testOrderId,
    };
    await db.insert(patientEvents).values(event);
  }

  async recordVaccinationAdministered(
    patientId: string,
    vaccinationId: string,
    vaccineName: string
  ) {
    const event: InsertPatientEvent = {
      patientId,
      eventType: "vaccination_administered",
      eventDate: new Date(),
      title: "Vaccination Administered",
      description: `Administered ${vaccineName} vaccine`,
      relatedId: vaccinationId,
    };
    await db.insert(patientEvents).values(event);
  }

  async recordAlertCreated(
    patientId: string,
    alertId: string,
    alertType: string,
    message: string
  ) {
    const event: InsertPatientEvent = {
      patientId,
      eventType: "alert_created",
      eventDate: new Date(),
      title: `${alertType} Alert`,
      description: message,
      relatedId: alertId,
    };
    await db.insert(patientEvents).values(event);
  }

  async recordReferralCreated(
    patientId: string,
    referralId: string,
    toDoctorName: string,
    reason: string
  ) {
    const event: InsertPatientEvent = {
      patientId,
      eventType: "referral_created",
      eventDate: new Date(),
      title: "Referral Created",
      description: `Referred to Dr. ${toDoctorName} for ${reason}`,
      relatedId: referralId,
    };
    await db.insert(patientEvents).values(event);
  }

  async recordBedAssigned(
    patientId: string,
    bedId: string,
    roomNumber: string,
    bedNumber: string
  ) {
    const event: InsertPatientEvent = {
      patientId,
      eventType: "bed_assigned",
      eventDate: new Date(),
      title: "Bed Assigned",
      description: `Assigned to Room ${roomNumber}, Bed ${bedNumber}`,
      relatedId: bedId,
    };
    await db.insert(patientEvents).values(event);
  }

  async recordBillGenerated(
    patientId: string,
    billId: string,
    totalAmount: string
  ) {
    const event: InsertPatientEvent = {
      patientId,
      eventType: "bill_generated",
      eventDate: new Date(),
      title: "Bill Generated",
      description: `Bill generated for ₹${totalAmount}`,
      relatedId: billId,
    };
    await db.insert(patientEvents).values(event);
  }

  async recordPaymentReceived(
    patientId: string,
    paymentId: string,
    amount: string
  ) {
    const event: InsertPatientEvent = {
      patientId,
      eventType: "payment_received",
      eventDate: new Date(),
      title: "Payment Received",
      description: `Payment of ₹${amount} received`,
      relatedId: paymentId,
    };
    await db.insert(patientEvents).values(event);
  }
}

export const eventWriter = new EventWriter();

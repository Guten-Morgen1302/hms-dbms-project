import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  User, Calendar, Phone, Mail, MapPin, Droplet, AlertTriangle, 
  FileText, Pill, Activity, TestTube, DollarSign, Clock, ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import { format, formatDistanceToNow } from "date-fns";
import type { Patient, PatientAlert, PatientEvent, Prescription, TestOrder, Appointment, HealthVital, Vaccination } from "@shared/schema";

export default function PatientDetail() {
  const params = useParams();
  const patientId = params.id;

  const { data: patient, isLoading: loadingPatient } = useQuery<Patient>({
    queryKey: ["/api/patients", patientId],
    enabled: !!patientId,
  });

  const { data: alerts } = useQuery<PatientAlert[]>({
    queryKey: ["/api/patient-alerts", patientId],
    enabled: !!patientId,
  });

  const { data: timeline } = useQuery<PatientEvent[]>({
    queryKey: ["/api/patient-events", patientId],
    enabled: !!patientId,
  });

  const { data: prescriptions } = useQuery<any[]>({
    queryKey: ["/api/prescriptions", { patientId }],
    enabled: !!patientId,
  });

  const { data: testOrders } = useQuery<any[]>({
    queryKey: ["/api/test-orders", { patientId }],
    enabled: !!patientId,
  });

  const { data: appointments } = useQuery<any[]>({
    queryKey: ["/api/appointments", { patientId }],
    enabled: !!patientId,
  });

  const { data: vitals } = useQuery<HealthVital[]>({
    queryKey: ["/api/health-vitals", patientId],
    enabled: !!patientId,
  });

  const { data: vaccinations } = useQuery<Vaccination[]>({
    queryKey: ["/api/vaccinations", patientId],
    enabled: !!patientId,
  });

  if (loadingPatient) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const activeAlerts = alerts?.filter(a => a.isActive === 1) || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400";
      case "high": return "text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400";
      case "medium": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400";
      default: return "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400";
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/patients">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold" data-testid="text-patient-name">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-muted-foreground">
              Patient ID: {patient.id.slice(0, 8)}
            </p>
          </div>
        </div>
      </div>

      {activeAlerts.length > 0 && (
        <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-3 rounded-lg flex items-start gap-3 ${getSeverityColor(alert.severity)}`}
                data-testid={`alert-${alert.id}`}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{alert.alertType}</p>
                  <p className="text-sm opacity-90">{alert.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {patient.firstName[0]}{patient.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{age} years</p>
                  <p className="text-xs text-muted-foreground">
                    Born {format(new Date(patient.dateOfBirth), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{patient.gender}</p>
                </div>
              </div>

              {patient.bloodGroup && (
                <div className="flex items-start gap-3">
                  <Droplet className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Group</p>
                    <Badge variant="outline" className="mt-1">{patient.bloodGroup}</Badge>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>
              </div>

              {patient.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-sm break-all">{patient.email}</p>
                  </div>
                </div>
              )}

              {patient.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="text-sm">{patient.address}</p>
                  </div>
                </div>
              )}

              <Separator />

              {patient.emergencyContactName && (
                <>
                  <div>
                    <p className="text-sm font-semibold mb-2">Emergency Contact</p>
                    <p className="font-medium">{patient.emergencyContactName}</p>
                    {patient.emergencyContactPhone && (
                      <p className="text-sm text-muted-foreground">{patient.emergencyContactPhone}</p>
                    )}
                  </div>
                  <Separator />
                </>
              )}

              {patient.allergies && (
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Allergies</p>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      {patient.allergies}
                    </p>
                  </div>
                </div>
              )}

              {patient.medicalHistory && (
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Medical History</p>
                    <p className="text-sm mt-1">{patient.medicalHistory}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <Tabs defaultValue="timeline" className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-6 gap-2">
                <TabsTrigger value="timeline" className="text-xs sm:text-sm" data-testid="tab-timeline">
                  <Clock className="w-4 h-4 mr-1" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="prescriptions" className="text-xs sm:text-sm" data-testid="tab-prescriptions">
                  <Pill className="w-4 h-4 mr-1" />
                  Rx
                </TabsTrigger>
                <TabsTrigger value="labs" className="text-xs sm:text-sm" data-testid="tab-labs">
                  <TestTube className="w-4 h-4 mr-1" />
                  Labs
                </TabsTrigger>
                <TabsTrigger value="vitals" className="text-xs sm:text-sm" data-testid="tab-vitals">
                  <Activity className="w-4 h-4 mr-1" />
                  Vitals
                </TabsTrigger>
                <TabsTrigger value="vaccines" className="text-xs sm:text-sm" data-testid="tab-vaccines">
                  <Activity className="w-4 h-4 mr-1" />
                  Vaccines
                </TabsTrigger>
                <TabsTrigger value="appointments" className="text-xs sm:text-sm" data-testid="tab-appointments">
                  <Calendar className="w-4 h-4 mr-1" />
                  Visits
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="timeline" className="mt-0">
                <div className="space-y-4">
                  {timeline && timeline.length > 0 ? (
                    <div className="relative space-y-6">
                      <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border" />
                      {timeline.map((event) => (
                        <div key={event.id} className="relative flex gap-4" data-testid={`event-${event.id}`}>
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center relative z-10">
                            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-semibold">{event.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {event.description}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(event.eventDate), { addSuffix: true })}
                              </p>
                            </div>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {event.eventType}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No medical history recorded yet
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="prescriptions" className="mt-0">
                <div className="space-y-4">
                  {prescriptions && prescriptions.length > 0 ? (
                    prescriptions.map((rx: any) => (
                      <Card key={rx.id} data-testid={`prescription-${rx.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{rx.diagnosis}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Dr. {rx.doctorName} • {format(new Date(rx.prescriptionDate), "MMM dd, yyyy")}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        {rx.notes && (
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground">{rx.notes}</p>
                          </CardContent>
                        )}
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No prescriptions recorded
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="labs" className="mt-0">
                <div className="space-y-4">
                  {testOrders && testOrders.length > 0 ? (
                    testOrders.map((test: any) => (
                      <Card key={test.id} data-testid={`test-${test.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{test.testName}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Ordered by Dr. {test.doctorName}
                              </p>
                            </div>
                            <Badge variant={test.status === "reported" ? "default" : "outline"}>
                              {test.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        {test.results && (
                          <CardContent className="pt-0">
                            <p className="text-sm font-medium">Results:</p>
                            <p className="text-sm text-muted-foreground">{test.results}</p>
                          </CardContent>
                        )}
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No lab tests ordered
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="vitals" className="mt-0">
                <div className="space-y-4">
                  {vitals && vitals.length > 0 ? (
                    vitals.map((vital) => (
                      <Card key={vital.id} data-testid={`vital-${vital.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                              {format(new Date(vital.recordedDate), "MMM dd, yyyy HH:mm")}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                            {vital.bloodPressureSystolic && vital.bloodPressureDiastolic && (
                              <div>
                                <p className="text-muted-foreground">BP</p>
                                <p className="font-semibold">
                                  {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}
                                </p>
                              </div>
                            )}
                            {vital.heartRate && (
                              <div>
                                <p className="text-muted-foreground">Heart Rate</p>
                                <p className="font-semibold">{vital.heartRate} bpm</p>
                              </div>
                            )}
                            {vital.temperature && (
                              <div>
                                <p className="text-muted-foreground">Temperature</p>
                                <p className="font-semibold">{vital.temperature}°F</p>
                              </div>
                            )}
                            {vital.bloodSugar && (
                              <div>
                                <p className="text-muted-foreground">Blood Sugar</p>
                                <p className="font-semibold">{vital.bloodSugar} mg/dL</p>
                              </div>
                            )}
                            {vital.oxygenSaturation && (
                              <div>
                                <p className="text-muted-foreground">SpO2</p>
                                <p className="font-semibold">{vital.oxygenSaturation}%</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No vitals recorded
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="vaccines" className="mt-0">
                <div className="space-y-4">
                  {vaccinations && vaccinations.length > 0 ? (
                    vaccinations.map((vaccine) => (
                      <Card key={vaccine.id} data-testid={`vaccine-${vaccine.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{vaccine.vaccineName}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(vaccine.administeredDate), "MMM dd, yyyy")}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        {vaccine.nextDoseDate && (
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground">
                              Next dose: {format(new Date(vaccine.nextDoseDate), "MMM dd, yyyy")}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No vaccinations recorded
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="appointments" className="mt-0">
                <div className="space-y-4">
                  {appointments && appointments.length > 0 ? (
                    appointments.map((apt: any) => (
                      <Card key={apt.id} data-testid={`appointment-${apt.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">
                                {format(new Date(apt.appointmentDate), "MMM dd, yyyy")} at {apt.startTime}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Dr. {apt.doctorName}
                              </p>
                            </div>
                            <Badge variant={
                              apt.status === "completed" ? "default" :
                              apt.status === "cancelled" ? "outline" :
                              "secondary"
                            }>
                              {apt.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        {apt.reason && (
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground">{apt.reason}</p>
                          </CardContent>
                        )}
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No appointments scheduled
                    </p>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

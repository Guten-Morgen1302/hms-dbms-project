import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, TestTube, DollarSign, Activity, Bell, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";

export default function PatientDashboard() {
  const [, navigate] = useLocation();

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ["/api/portal/patient"],
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/portal/appointments"],
  });

  const { data: prescriptions = [], isLoading: prescriptionsLoading } = useQuery({
    queryKey: ["/api/portal/prescriptions"],
  });

  const { data: labResults = [], isLoading: labResultsLoading } = useQuery({
    queryKey: ["/api/portal/lab-results"],
  });

  const { data: bills = [], isLoading: billsLoading } = useQuery({
    queryKey: ["/api/portal/bills"],
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications/unread"],
  });

  const upcomingAppointments = appointments.filter(
    (apt: any) => new Date(apt.appointmentDate) >= new Date() && apt.status === "scheduled"
  ).slice(0, 3);

  const recentPrescriptions = prescriptions.slice(0, 3);
  const recentLabResults = labResults.slice(0, 3);
  const outstandingBills = bills.filter((bill: any) => bill.status === "pending" || bill.status === "overdue");

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading patient information...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Welcome Back, {patient?.firstName}!</h1>
          <p className="text-muted-foreground">Here's your health overview</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate("/patient/messages")} data-testid="button-messages">
            <MessageSquare className="w-4 h-4" />
            Messages
          </Button>
          <Button variant="outline" onClick={() => navigate("/patient/notifications")} data-testid="button-notifications">
            <Bell className="w-4 h-4" />
            Notifications
            {notifications.length > 0 && (
              <Badge variant="destructive" className="ml-2" data-testid="badge-notification-count">
                {notifications.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate" data-testid="card-upcoming-appointments">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">Next appointment scheduled</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-prescriptions">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prescriptions.length}</div>
            <p className="text-xs text-muted-foreground">Total prescriptions</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-lab-results">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lab Results</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{labResults.length}</div>
            <p className="text-xs text-muted-foreground">Available results</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-outstanding-bills">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Bills</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{outstandingBills.reduce((sum: number, bill: any) => sum + (parseFloat(bill.totalAmount) || 0) - (parseFloat(bill.paidAmount) || 0), 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{outstandingBills.length} pending bills</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card data-testid="card-upcoming-appointments-list">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled medical appointments</CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="text-sm text-muted-foreground">Loading appointments...</div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-sm text-muted-foreground">No upcoming appointments</div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((apt: any) => (
                  <div key={apt.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-md border" data-testid={`appointment-${apt.id}`}>
                    <div>
                      <p className="font-medium">{format(new Date(apt.appointmentDate), "PPP")}</p>
                      <p className="text-sm text-muted-foreground">{apt.startTime} - {apt.endTime}</p>
                      <p className="text-sm">{apt.reason}</p>
                    </div>
                    <Badge variant={apt.isEmergency ? "destructive" : "default"}>
                      {apt.isEmergency ? "Emergency" : "Regular"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Button variant="ghost" className="mt-4" onClick={() => navigate("/patient/appointments")} data-testid="button-view-all-appointments">
              View all appointments →
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="card-recent-prescriptions">
          <CardHeader>
            <CardTitle>Recent Prescriptions</CardTitle>
            <CardDescription>Your latest medication prescriptions</CardDescription>
          </CardHeader>
          <CardContent>
            {prescriptionsLoading ? (
              <div className="text-sm text-muted-foreground">Loading prescriptions...</div>
            ) : recentPrescriptions.length === 0 ? (
              <div className="text-sm text-muted-foreground">No prescriptions yet</div>
            ) : (
              <div className="space-y-3">
                {recentPrescriptions.map((rx: any) => (
                  <div key={rx.id} className="p-3 rounded-md border" data-testid={`prescription-${rx.id}`}>
                    <p className="font-medium">{rx.diagnosis}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(rx.prescriptionDate), "PPP")}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Button variant="ghost" className="mt-4" onClick={() => navigate("/patient/prescriptions")} data-testid="button-view-all-prescriptions">
              View all prescriptions →
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card data-testid="card-recent-lab-results">
          <CardHeader>
            <CardTitle>Recent Lab Results</CardTitle>
            <CardDescription>Your latest laboratory test results</CardDescription>
          </CardHeader>
          <CardContent>
            {labResultsLoading ? (
              <div className="text-sm text-muted-foreground">Loading lab results...</div>
            ) : recentLabResults.length === 0 ? (
              <div className="text-sm text-muted-foreground">No lab results yet</div>
            ) : (
              <div className="space-y-3">
                {recentLabResults.map((test: any) => (
                  <div key={test.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-md border" data-testid={`lab-result-${test.id}`}>
                    <div>
                      <p className="font-medium">{test.testName}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(test.orderDate), "PPP")}
                      </p>
                    </div>
                    <Badge variant={test.status === "reported" ? "default" : test.status === "collected" ? "secondary" : "outline"}>
                      {test.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Button variant="ghost" className="mt-4" onClick={() => navigate("/patient/lab-results")} data-testid="button-view-all-lab-results">
              View all results →
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="card-outstanding-bills-list">
          <CardHeader>
            <CardTitle>Billing Summary</CardTitle>
            <CardDescription>Your outstanding medical bills</CardDescription>
          </CardHeader>
          <CardContent>
            {billsLoading ? (
              <div className="text-sm text-muted-foreground">Loading bills...</div>
            ) : outstandingBills.length === 0 ? (
              <div className="text-sm text-muted-foreground">No outstanding bills</div>
            ) : (
              <div className="space-y-3">
                {outstandingBills.slice(0, 3).map((bill: any) => (
                  <div key={bill.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-md border" data-testid={`bill-${bill.id}`}>
                    <div>
                      <p className="font-medium">₹{parseFloat(bill.totalAmount - bill.paidAmount).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {format(new Date(bill.dueDate), "PP")}
                      </p>
                    </div>
                    <Badge variant={bill.status === "overdue" ? "destructive" : "secondary"}>
                      {bill.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Button variant="ghost" className="mt-4" onClick={() => navigate("/patient/billing")} data-testid="button-view-all-bills">
              View all bills →
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-quick-actions">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            <Button variant="outline" onClick={() => navigate("/patient/timeline")} data-testid="button-view-timeline">
              <Activity className="w-4 h-4" />
              Health Timeline
            </Button>
            <Button variant="outline" onClick={() => navigate("/patient/refill-requests")} data-testid="button-request-refill">
              <FileText className="w-4 h-4" />
              Request Refill
            </Button>
            <Button variant="outline" onClick={() => navigate("/patient/vitals")} data-testid="button-log-vitals">
              <Activity className="w-4 h-4" />
              Log Vitals
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

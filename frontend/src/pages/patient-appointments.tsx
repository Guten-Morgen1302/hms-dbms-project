import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

export default function PatientAppointments() {
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["/api/portal/appointments"],
  });

  const upcoming = appointments.filter(
    (apt: any) => new Date(apt.appointmentDate) >= new Date() && apt.status === "scheduled"
  );
  
  const past = appointments.filter(
    (apt: any) => new Date(apt.appointmentDate) < new Date() || apt.status !== "scheduled"
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading appointments...</div>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "scheduled":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "no_show":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-appointments-title">My Appointments</h1>
        <p className="text-muted-foreground">View your medical appointments</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled future appointments</CardDescription>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming appointments
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((apt: any) => (
                  <Card key={apt.id} className="hover-elevate" data-testid={`appointment-${apt.id}`}>
                    <CardContent className="pt-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <h3 className="font-semibold" data-testid={`appointment-date-${apt.id}`}>
                              {format(new Date(apt.appointmentDate), "PPPP")}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2" data-testid={`appointment-time-${apt.id}`}>
                            {apt.startTime} - {apt.endTime}
                          </p>
                          {apt.reason && (
                            <p className="text-sm" data-testid={`appointment-reason-${apt.id}`}>
                              Reason: {apt.reason}
                            </p>
                          )}
                          {apt.notes && (
                            <p className="text-sm text-muted-foreground mt-1" data-testid={`appointment-notes-${apt.id}`}>
                              Notes: {apt.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={getStatusVariant(apt.status)} data-testid={`appointment-status-${apt.id}`}>
                            {apt.status}
                          </Badge>
                          {apt.isEmergency === 1 && (
                            <Badge variant="destructive">Emergency</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Past Appointments</CardTitle>
            <CardDescription>Your appointment history</CardDescription>
          </CardHeader>
          <CardContent>
            {past.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No past appointments
              </div>
            ) : (
              <div className="space-y-3">
                {past.map((apt: any) => (
                  <Card key={apt.id} className="hover-elevate" data-testid={`past-appointment-${apt.id}`}>
                    <CardContent className="pt-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <h3 className="font-semibold" data-testid={`past-appointment-date-${apt.id}`}>
                              {format(new Date(apt.appointmentDate), "PPPP")}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2" data-testid={`past-appointment-time-${apt.id}`}>
                            {apt.startTime} - {apt.endTime}
                          </p>
                          {apt.reason && (
                            <p className="text-sm" data-testid={`past-appointment-reason-${apt.id}`}>
                              Reason: {apt.reason}
                            </p>
                          )}
                        </div>
                        <Badge variant={getStatusVariant(apt.status)} data-testid={`past-appointment-status-${apt.id}`}>
                          {apt.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

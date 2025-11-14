import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, TestTube, DollarSign, Pill, Syringe, Activity } from "lucide-react";
import { format } from "date-fns";

const getEventIcon = (type: string) => {
  switch (type) {
    case "appointment":
      return <Calendar className="w-5 h-5 text-blue-500" />;
    case "prescription":
      return <FileText className="w-5 h-5 text-green-500" />;
    case "lab_test":
      return <TestTube className="w-5 h-5 text-purple-500" />;
    case "bill":
      return <DollarSign className="w-5 h-5 text-orange-500" />;
    case "medication":
      return <Pill className="w-5 h-5 text-pink-500" />;
    case "vaccination":
      return <Syringe className="w-5 h-5 text-red-500" />;
    case "vital":
      return <Activity className="w-5 h-5 text-teal-500" />;
    default:
      return <Calendar className="w-5 h-5 text-gray-500" />;
  }
};

export default function PatientTimeline() {
  const { data: timeline = [], isLoading } = useQuery({
    queryKey: ["/api/portal/timeline"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading health timeline...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-timeline-title">Health Timeline</h1>
        <p className="text-muted-foreground">Your complete medical history at a glance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medical Events</CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No medical events recorded yet
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {timeline.map((event: any, index: number) => (
                  <div key={event.id || index} className="relative pl-16" data-testid={`event-${event.id || index}`}>
                    <div className="absolute left-6 -translate-x-1/2 rounded-full bg-background p-2 border-2 border-border">
                      {getEventIcon(event.eventType)}
                    </div>
                    <Card className="hover-elevate">
                      <CardContent className="pt-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg" data-testid={`event-title-${event.id || index}`}>{event.title}</h3>
                              <Badge variant="outline" data-testid={`event-type-${event.id || index}`}>{event.eventType}</Badge>
                            </div>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mb-2" data-testid={`event-description-${event.id || index}`}>
                                {event.description}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground" data-testid={`event-date-${event.id || index}`}>
                              {format(new Date(event.eventDate), "PPP 'at' p")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

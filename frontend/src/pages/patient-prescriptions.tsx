import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";
import { format } from "date-fns";

export default function PatientPrescriptions() {
  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ["/api/portal/prescriptions"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading prescriptions...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-prescriptions-title">My Prescriptions</h1>
        <p className="text-muted-foreground">View and download your medical prescriptions</p>
      </div>

      {prescriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No prescriptions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {prescriptions.map((prescription: any) => (
            <Card key={prescription.id} className="hover-elevate" data-testid={`prescription-card-${prescription.id}`}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle data-testid={`prescription-diagnosis-${prescription.id}`}>{prescription.diagnosis}</CardTitle>
                    <CardDescription data-testid={`prescription-date-${prescription.id}`}>
                      Prescribed on {format(new Date(prescription.prescriptionDate), "PPP")}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" data-testid={`button-download-${prescription.id}`}>
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {prescription.notes && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Doctor's Notes:</h4>
                    <p className="text-sm text-muted-foreground" data-testid={`prescription-notes-${prescription.id}`}>{prescription.notes}</p>
                  </div>
                )}
                {prescription.medications && prescription.medications.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Medications:</h4>
                    <div className="space-y-2">
                      {prescription.medications.map((med: any, index: number) => (
                        <div key={index} className="p-3 rounded-md border" data-testid={`medication-${prescription.id}-${index}`}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="font-medium">{med.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {med.dosage} • {med.frequency} • {med.duration}
                              </p>
                              {med.instructions && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Instructions: {med.instructions}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

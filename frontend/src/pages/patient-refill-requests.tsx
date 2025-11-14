import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function PatientRefillRequests() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<string>("");
  const [notes, setNotes] = useState("");

  const { data: refillRequests = [], isLoading } = useQuery({
    queryKey: ["/api/refill-requests/patient"],
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ["/api/portal/prescriptions"],
  });

  const createRefillMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/refill-requests", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/refill-requests/patient"] });
      setIsDialogOpen(false);
      setSelectedPrescription("");
      setNotes("");
      toast({
        title: "Refill request submitted",
        description: "Your doctor will review your request soon.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit refill request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitRefill = () => {
    if (!selectedPrescription) {
      toast({
        title: "Error",
        description: "Please select a prescription",
        variant: "destructive",
      });
      return;
    }

    const prescription = prescriptions.find((p: any) => p.id === selectedPrescription);
    if (!prescription) return;

    createRefillMutation.mutate({
      prescriptionId: selectedPrescription,
      doctorId: prescription.doctorId,
      notes,
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "denied":
        return "destructive";
      case "completed":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading refill requests...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-refill-title">Prescription Refill Requests</h1>
          <p className="text-muted-foreground">Request refills for your medications</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-refill-request">
              <Plus className="w-4 h-4" />
              New Refill Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Prescription Refill</DialogTitle>
              <DialogDescription>
                Select a prescription and provide any additional notes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="prescription">Select Prescription</Label>
                <select
                  id="prescription"
                  className="w-full rounded-md border bg-background px-3 py-2"
                  value={selectedPrescription}
                  onChange={(e) => setSelectedPrescription(e.target.value)}
                  data-testid="select-prescription"
                >
                  <option value="">Choose a prescription</option>
                  {prescriptions.map((rx: any) => (
                    <option key={rx.id} value={rx.id}>
                      {rx.diagnosis} - {format(new Date(rx.prescriptionDate), "PP")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information for your doctor..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  data-testid="textarea-notes"
                />
              </div>
              <Button
                onClick={handleSubmitRefill}
                disabled={createRefillMutation.isPending}
                className="w-full"
                data-testid="button-submit-refill"
              >
                {createRefillMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {refillRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No refill requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {refillRequests.map((request: any) => (
            <Card key={request.id} className="hover-elevate" data-testid={`refill-request-${request.id}`}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle data-testid={`refill-prescription-${request.id}`}>
                      {request.prescriptionDiagnosis || "Prescription Refill"}
                    </CardTitle>
                    <CardDescription data-testid={`refill-date-${request.id}`}>
                      Requested on {format(new Date(request.requestDate), "PPP")}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(request.status)} data-testid={`refill-status-${request.id}`}>
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              {request.notes && (
                <CardContent>
                  <p className="text-sm text-muted-foreground" data-testid={`refill-notes-${request.id}`}>
                    Notes: {request.notes}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

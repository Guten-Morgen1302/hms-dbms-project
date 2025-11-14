import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPrescriptionSchema } from "@shared/schema";
import type { PrescriptionListItem, PrescriptionDetail, Patient, Medication } from "@shared/schema";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const newPrescriptionSchema = insertPrescriptionSchema.extend({
  medications: z.array(z.object({
    medicationId: z.string(),
    dosage: z.string().min(1, "Dosage is required"),
    frequency: z.string().min(1, "Frequency is required"),
    duration: z.string().min(1, "Duration is required"),
    instructions: z.string().optional(),
  })).min(1, "At least one medication is required"),
});

type NewPrescriptionForm = z.infer<typeof newPrescriptionSchema>;

export default function Prescriptions() {
  const { toast } = useToast();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);

  const { data: prescriptions, isLoading } = useQuery<PrescriptionListItem[]>({ 
    queryKey: ["/api/prescriptions"] 
  });

  const { data: prescriptionDetail } = useQuery<PrescriptionDetail>({ 
    queryKey: ["/api/prescriptions", selectedPrescriptionId],
    enabled: !!selectedPrescriptionId && viewDialogOpen,
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: createDialogOpen,
  });

  const { data: medications = [] } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
    enabled: createDialogOpen,
  });

  const form = useForm<NewPrescriptionForm>({
    resolver: zodResolver(newPrescriptionSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      prescriptionDate: format(new Date(), "yyyy-MM-dd"),
      diagnosis: "",
      notes: "",
      medications: [{ medicationId: "", dosage: "", frequency: "", duration: "", instructions: "" }],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: NewPrescriptionForm) => {
      return await apiRequest("POST", "/api/prescriptions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      toast({
        title: "Success",
        description: "Prescription created successfully",
      });
      setCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create prescription",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (id: string) => {
    setSelectedPrescriptionId(id);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedPrescriptionId(null);
  };

  const addMedicationRow = () => {
    const current = form.getValues("medications");
    form.setValue("medications", [...current, { medicationId: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  };

  const removeMedicationRow = (index: number) => {
    const current = form.getValues("medications");
    if (current.length > 1) {
      form.setValue("medications", current.filter((_, i) => i !== index));
    }
  };

  const onSubmit = (data: NewPrescriptionForm) => {
    createMutation.mutate(data);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Prescriptions</h1>
          <p className="text-muted-foreground">Manage patient prescriptions and medications</p>
        </div>
        <Button 
          className="h-11 px-6 rounded-lg font-semibold" 
          onClick={() => setCreateDialogOpen(true)}
          data-testid="button-add-prescription"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Prescription
        </Button>
      </div>

      <Card className="p-6 rounded-2xl">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !prescriptions || prescriptions.length === 0 ? (
          <EmptyState
            title="No prescriptions found"
            description="Start managing patient medications by creating prescriptions"
            icon={FileText}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Date</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Patient</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Doctor</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Diagnosis</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptions.map((prescription, index) => (
                  <motion.tr
                    key={prescription.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover-elevate"
                    data-testid={`row-prescription-${prescription.id}`}
                  >
                    <TableCell>{format(new Date(prescription.prescriptionDate), "PP")}</TableCell>
                    <TableCell className="font-medium">{prescription.patientName || "Unknown Patient"}</TableCell>
                    <TableCell>{prescription.doctorName || "Unknown Doctor"}</TableCell>
                    <TableCell>{prescription.diagnosis}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDetails(prescription.id)}
                        data-testid={`button-view-prescription-${prescription.id}`}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={handleCloseViewDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>Complete prescription information and medications</DialogDescription>
          </DialogHeader>
          
          {prescriptionDetail && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="font-medium">{prescriptionDetail.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-medium">{prescriptionDetail.doctorName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(prescriptionDetail.prescriptionDate), "PPP")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diagnosis</p>
                  <p className="font-medium">{prescriptionDetail.diagnosis}</p>
                </div>
              </div>

              {prescriptionDetail.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{prescriptionDetail.notes}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-3">Medications</h3>
                {prescriptionDetail.medications && prescriptionDetail.medications.length > 0 ? (
                  <div className="space-y-3">
                    {prescriptionDetail.medications.map((med) => (
                      <Card key={med.id} className="p-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Medication</p>
                            <p className="font-medium">{med.medicationName || "N/A"}</p>
                            {med.genericName && (
                              <p className="text-sm text-muted-foreground">{med.genericName}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Form & Strength</p>
                            <p className="text-sm">{med.dosageForm || "N/A"} - {med.strength || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Dosage</p>
                            <p className="text-sm">{med.dosage}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Frequency</p>
                            <p className="text-sm">{med.frequency}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Duration</p>
                            <p className="text-sm">{med.duration}</p>
                          </div>
                          {med.instructions && (
                            <div className="col-span-2">
                              <p className="text-sm text-muted-foreground">Instructions</p>
                              <p className="text-sm">{med.instructions}</p>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No medications prescribed</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Prescription Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Prescription</DialogTitle>
            <DialogDescription>Create a new prescription for a patient</DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-patient">
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.firstName} {patient.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prescriptionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prescription Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-prescription-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter diagnosis" {...field} data-testid="input-diagnosis" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes" {...field} value={field.value || ""} data-testid="textarea-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <FormLabel>Medications</FormLabel>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addMedicationRow}
                    data-testid="button-add-medication-row"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Medication
                  </Button>
                </div>

                {form.watch("medications").map((_, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm">Medication {index + 1}</h4>
                        {form.watch("medications").length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMedicationRow(index)}
                            data-testid={`button-remove-medication-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name={`medications.${index}.medicationId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medication</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid={`select-medication-${index}`}>
                                  <SelectValue placeholder="Select medication" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {medications.map((med) => (
                                  <SelectItem key={med.id} value={med.id}>
                                    {med.name} ({med.genericName || "Generic"})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-3">
                        <FormField
                          control={form.control}
                          name={`medications.${index}.dosage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dosage</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 500mg" {...field} data-testid={`input-dosage-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`medications.${index}.frequency`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequency</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Twice daily" {...field} data-testid={`input-frequency-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`medications.${index}.duration`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 7 days" {...field} data-testid={`input-duration-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`medications.${index}.instructions`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructions (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Take after meals" {...field} data-testid={`input-instructions-${index}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(false)}
                  data-testid="button-cancel-prescription"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  data-testid="button-submit-prescription"
                >
                  {createMutation.isPending ? "Creating..." : "Create Prescription"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

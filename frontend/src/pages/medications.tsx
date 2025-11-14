import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pill, Plus } from "lucide-react";
import type { Medication, InsertMedication } from "@shared/schema";
import { insertMedicationSchema } from "@shared/schema";
import { motion } from "framer-motion";
import { formatINR } from "@/lib/format";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const medicationFormSchema = insertMedicationSchema.extend({
  unitPrice: z.string().optional(),
  stockQuantity: z.string().optional(),
});

type MedicationFormData = z.infer<typeof medicationFormSchema>;

export default function Medications() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: medications, isLoading } = useQuery<Medication[]>({ 
    queryKey: ["/api/medications"] 
  });

  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      name: "",
      manufacturer: "",
      unitPrice: "",
      stockQuantity: "0",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: MedicationFormData) => {
      const payload: InsertMedication = {
        ...data,
        unitPrice: data.unitPrice ? data.unitPrice : undefined,
        stockQuantity: data.stockQuantity ? parseInt(data.stockQuantity) : 0,
      };
      return apiRequest("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      toast({ title: "Medication added successfully" });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error adding medication", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Medications</h1>
          <p className="text-muted-foreground">Manage medication inventory and pricing</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-6 rounded-lg font-semibold" data-testid="button-add-medication">
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medication Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Crocin" data-testid="input-medication-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. GlaxoSmithKline" data-testid="input-manufacturer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="unitPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price (₹)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-unit-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stockQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="0" data-testid="input-stock-quantity" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Medication description" data-testid="input-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-medication">
                    {createMutation.isPending ? "Adding..." : "Add Medication"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6 rounded-2xl">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !medications || medications.length === 0 ? (
          <EmptyState
            title="No medications found"
            description="Start managing medication inventory"
            icon={Pill}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Name</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Manufacturer</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Price</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Stock</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications.map((med, index) => (
                  <motion.tr
                    key={med.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover-elevate"
                    data-testid={`row-medication-${med.id}`}
                  >
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell>{med.manufacturer || "N/A"}</TableCell>
                    <TableCell className="font-mono">
                      {med.unitPrice ? formatINR(med.unitPrice) : "N/A"}
                    </TableCell>
                    <TableCell>
                      <span className={med.stockQuantity && med.stockQuantity < 10 ? "text-destructive font-semibold" : ""}>
                        {med.stockQuantity || 0}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{med.description || "No description"}</TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

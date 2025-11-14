import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestTube2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTestOrderSchema } from "@shared/schema";
import type { TestOrderListItem, Patient, LabTest } from "@shared/schema";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const newTestOrderSchema = insertTestOrderSchema.extend({
  testId: z.string().min(1, "Test is required"),
});

type NewTestOrderForm = z.infer<typeof newTestOrderSchema>;

function getStatusVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "pending":
      return "secondary";
    case "in_progress":
      return "outline";
    default:
      return "secondary";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "pending":
      return "Pending";
    default:
      return status;
  }
}

export default function TestOrders() {
  const { toast } = useToast();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTestOrder, setSelectedTestOrder] = useState<TestOrderListItem | null>(null);

  const { data: testOrders, isLoading } = useQuery<TestOrderListItem[]>({ 
    queryKey: ["/api/test-orders"] 
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: createDialogOpen,
  });

  const { data: labTests = [] } = useQuery<LabTest[]>({
    queryKey: ["/api/lab-tests"],
    enabled: createDialogOpen,
  });

  const form = useForm<NewTestOrderForm>({
    resolver: zodResolver(newTestOrderSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      testId: "",
      orderDate: format(new Date(), "yyyy-MM-dd"),
      status: "pending",
      results: "",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: NewTestOrderForm) => {
      return await apiRequest("POST", "/api/test-orders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/test-orders"] });
      toast({
        title: "Success",
        description: "Test order created successfully",
      });
      setCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create test order",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (testOrder: TestOrderListItem) => {
    setSelectedTestOrder(testOrder);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedTestOrder(null);
  };

  const onSubmit = (data: NewTestOrderForm) => {
    createMutation.mutate(data);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Lab Test Orders</h1>
          <p className="text-muted-foreground">Manage patient lab test orders and results</p>
        </div>
        <Button 
          className="h-11 px-6 rounded-lg font-semibold" 
          onClick={() => setCreateDialogOpen(true)}
          data-testid="button-add-test-order"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Test Order
        </Button>
      </div>

      <Card className="p-6 rounded-2xl">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !testOrders || testOrders.length === 0 ? (
          <EmptyState
            title="No test orders found"
            description="Start managing lab tests by creating test orders"
            icon={TestTube2}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Order Date</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Patient</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Doctor</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Test</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Status</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testOrders.map((testOrder, index) => (
                  <motion.tr
                    key={testOrder.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover-elevate"
                    data-testid={`row-test-order-${testOrder.id}`}
                  >
                    <TableCell>{format(new Date(testOrder.orderDate), "PP")}</TableCell>
                    <TableCell className="font-medium">{testOrder.patientName || "Unknown Patient"}</TableCell>
                    <TableCell>{testOrder.doctorName || "N/A"}</TableCell>
                    <TableCell>{testOrder.testName || "Unknown Test"}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(testOrder.status)} data-testid={`badge-status-${testOrder.id}`}>
                        {getStatusLabel(testOrder.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDetails(testOrder)}
                        data-testid={`button-view-test-order-${testOrder.id}`}
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Test Order Details</DialogTitle>
            <DialogDescription>Complete test order information and results</DialogDescription>
          </DialogHeader>
          
          {selectedTestOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="font-medium">{selectedTestOrder.patientName || "Unknown Patient"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-medium">{selectedTestOrder.doctorName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">{format(new Date(selectedTestOrder.orderDate), "PPP")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={getStatusVariant(selectedTestOrder.status)}>
                    {getStatusLabel(selectedTestOrder.status)}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Test</p>
                <Card className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Test Name</p>
                      <p className="font-medium">{selectedTestOrder.testName || "Unknown Test"}</p>
                    </div>
                    {selectedTestOrder.testCategory && (
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="text-sm">{selectedTestOrder.testCategory}</p>
                      </div>
                    )}
                    {selectedTestOrder.testDescription && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="text-sm">{selectedTestOrder.testDescription}</p>
                      </div>
                    )}
                    {selectedTestOrder.normalRange && (
                      <div>
                        <p className="text-sm text-muted-foreground">Normal Range</p>
                        <p className="text-sm">{selectedTestOrder.normalRange}</p>
                      </div>
                    )}
                    {selectedTestOrder.testPrice && (
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="text-sm font-medium">₹{selectedTestOrder.testPrice}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {selectedTestOrder.results && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Results</p>
                  <Card className="p-4 bg-muted/30">
                    <p className="text-sm whitespace-pre-wrap">{selectedTestOrder.results}</p>
                  </Card>
                </div>
              )}

              {selectedTestOrder.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedTestOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Test Order Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Test Order</DialogTitle>
            <DialogDescription>Create a new lab test order for a patient</DialogDescription>
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
                  name="orderDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-order-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="testId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lab Test</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-test">
                          <SelectValue placeholder="Select test" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {labTests.map((test) => (
                          <SelectItem key={test.id} value={test.id}>
                            {test.name} - ₹{test.price}
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="results"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Results (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter test results" 
                        {...field} 
                        value={field.value || ""} 
                        data-testid="textarea-results" 
                      />
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
                      <Textarea 
                        placeholder="Additional notes" 
                        {...field} 
                        value={field.value || ""} 
                        data-testid="textarea-notes" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(false)}
                  data-testid="button-cancel-test-order"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  data-testid="button-submit-test-order"
                >
                  {createMutation.isPending ? "Creating..." : "Create Test Order"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/layout";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients";
import PatientDetail from "@/pages/patient-detail";
import Doctors from "@/pages/doctors";
import Appointments from "@/pages/appointments";
import Prescriptions from "@/pages/prescriptions";
import Billing from "@/pages/billing";
import TestOrders from "@/pages/test-orders";
import Rooms from "@/pages/rooms";
import Departments from "@/pages/departments";
// Nurses and Technicians pages removed - only 3 roles supported
import Medications from "@/pages/medications";
import PatientDashboard from "@/pages/patient-dashboard";
import PatientTimeline from "@/pages/patient-timeline";
import PatientPrescriptions from "@/pages/patient-prescriptions";
import PatientRefillRequests from "@/pages/patient-refill-requests";
import PatientAppointments from "@/pages/patient-appointments";
import NotFound from "@/pages/not-found";
import type { User } from "@shared/schema";

function ProtectedRoute({ 
  component: Component, 
  allowedRoles 
}: { 
  component: React.ComponentType; 
  allowedRoles?: Array<"admin" | "doctor" | "patient">;
}) {
  const { data: user, isLoading } = useQuery<User>({ 
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // Role-based access control
  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === "patient") {
      return <Redirect to="/patient/dashboard" />;
    }
    return <Redirect to="/" />;
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      {/* Admin & Doctor Dashboard */}
      <Route path="/">
        {() => <ProtectedRoute component={Dashboard} allowedRoles={["admin", "doctor"]} />}
      </Route>
      {/* Patient Portal Routes - Patients only */}
      <Route path="/patient/dashboard">
        {() => <ProtectedRoute component={PatientDashboard} allowedRoles={["patient"]} />}
      </Route>
      <Route path="/patient/timeline">
        {() => <ProtectedRoute component={PatientTimeline} allowedRoles={["patient"]} />}
      </Route>
      <Route path="/patient/prescriptions">
        {() => <ProtectedRoute component={PatientPrescriptions} allowedRoles={["patient"]} />}
      </Route>
      <Route path="/patient/appointments">
        {() => <ProtectedRoute component={PatientAppointments} allowedRoles={["patient"]} />}
      </Route>
      <Route path="/patient/refill-requests">
        {() => <ProtectedRoute component={PatientRefillRequests} allowedRoles={["patient"]} />}
      </Route>
      
      {/* Admin & Doctor Routes */}
      <Route path="/patients">
        {() => <ProtectedRoute component={Patients} allowedRoles={["admin", "doctor"]} />}
      </Route>
      <Route path="/patients/:id">
        {() => <ProtectedRoute component={PatientDetail} allowedRoles={["admin", "doctor"]} />}
      </Route>
      <Route path="/doctors">
        {() => <ProtectedRoute component={Doctors} allowedRoles={["admin", "doctor"]} />}
      </Route>
      <Route path="/appointments">
        {() => <ProtectedRoute component={Appointments} allowedRoles={["admin", "doctor"]} />}
      </Route>
      <Route path="/prescriptions">
        {() => <ProtectedRoute component={Prescriptions} allowedRoles={["admin", "doctor"]} />}
      </Route>
      <Route path="/test-orders">
        {() => <ProtectedRoute component={TestOrders} allowedRoles={["admin", "doctor"]} />}
      </Route>
      <Route path="/departments">
        {() => <ProtectedRoute component={Departments} allowedRoles={["admin", "doctor"]} />}
      </Route>
      
      {/* Admin Only Routes */}
      <Route path="/billing">
        {() => <ProtectedRoute component={Billing} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/rooms">
        {() => <ProtectedRoute component={Rooms} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/medications">
        {() => <ProtectedRoute component={Medications} allowedRoles={["admin"]} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Calendar, 
  FileText, 
  CreditCard, 
  TestTube,
  BedDouble,
  Building2,
  Pill,
  Activity,
  Clock,
  MessageSquare,
  RefreshCw
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

const menuItems = {
  admin: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Patients", url: "/patients", icon: Users },
    { title: "Doctors", url: "/doctors", icon: Stethoscope },
    { title: "Appointments", url: "/appointments", icon: Calendar },
    { title: "Prescriptions", url: "/prescriptions", icon: FileText },
    { title: "Billing", url: "/billing", icon: CreditCard },
    { title: "Lab Tests", url: "/test-orders", icon: TestTube },
    { title: "Rooms & Beds", url: "/rooms", icon: BedDouble },
    { title: "Departments", url: "/departments", icon: Building2 },
    { title: "Medications", url: "/medications", icon: Pill },
  ],
  doctor: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "My Appointments", url: "/appointments", icon: Calendar },
    { title: "My Patients", url: "/patients", icon: Users },
    { title: "Prescriptions", url: "/prescriptions", icon: FileText },
    { title: "Lab Tests", url: "/test-orders", icon: TestTube },
  ],
  patient: [
    { title: "Dashboard", url: "/patient/dashboard", icon: LayoutDashboard },
    { title: "Medical Timeline", url: "/patient/timeline", icon: Activity },
    { title: "Appointments", url: "/patient/appointments", icon: Calendar },
    { title: "Prescriptions", url: "/patient/prescriptions", icon: FileText },
    { title: "Refill Requests", url: "/patient/refill-requests", icon: RefreshCw },
  ],
};

export function AppSidebar() {
  const [location] = useLocation();
  const { data: currentUser } = useQuery<User>({ queryKey: ["/api/auth/me"] });

  const items = currentUser?.role ? menuItems[currentUser.role as keyof typeof menuItems] || menuItems.patient : menuItems.patient;

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
            <Stethoscope className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight" data-testid="text-app-title">HMS</h2>
            <p className="text-xs text-sidebar-foreground/60">Hospital Management</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 px-3 mb-2">
            {currentUser?.role === "admin" ? "Administration" : "Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={isActive ? "bg-sidebar-accent" : ""}
                      data-testid={`link-nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
            {currentUser?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">{currentUser?.name || "User"}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{currentUser?.role || "Doctor"}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

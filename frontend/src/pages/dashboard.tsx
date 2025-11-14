import { useQuery } from "@tanstack/react-query";
import { KPICard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { 
  DollarSign, 
  Users, 
  BedDouble, 
  Calendar,
  TrendingUp,
  Activity
} from "lucide-react";
import type { User } from "@shared/schema";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";


const COLORS = {
  primary: "hsl(var(--chart-1))",
  jade: "hsl(var(--chart-2))",
  gold: "hsl(var(--chart-3))",
  muted: "hsl(var(--muted))",
};

export default function Dashboard() {
  const { data: currentUser } = useQuery<User>({ queryKey: ["/api/auth/me"] });
  
  // Admin dashboard metrics with auto-refresh every 30 seconds
  const { data: metricsData } = useQuery<any>({ 
    queryKey: ["/api/metrics"],
    enabled: currentUser?.role === "admin",
    refetchInterval: 30000, // Auto-refresh every 30 seconds for live updates
  });
  
  // Doctor dashboard data with auto-refresh every 30 seconds
  const { data: doctorData } = useQuery<any>({
    queryKey: ["/api/doctor/dashboard"],
    enabled: currentUser?.role === "doctor",
    refetchInterval: 30000, // Auto-refresh every 30 seconds for live updates
  });

  const metrics = metricsData || {
    totalRevenue: 0,
    activePatients: 0,
    bedOccupancy: 0,
    pendingAppointments: 0,
    revenueData: [],
    departmentData: [],
    occupancyData: [],
  };

  const revenueData = metrics.revenueData || [];
  const departmentData = metrics.departmentData || [];
  const occupancyData = metrics.occupancyData || [];

  return (
    <div className="p-8 max-w-screen-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">
          {currentUser?.role === "admin" ? "Admin Dashboard" : 
           currentUser?.role === "doctor" ? "Doctor Dashboard" :
           "Patient Dashboard"}
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {currentUser?.name}. Here's what's happening today.
        </p>
      </div>

      {currentUser?.role === "admin" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Total Revenue"
              value={`₹${metrics.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              trend={{ value: "+12.5%", isPositive: true }}
              delay={0}
            />
            <KPICard
              title="Active Patients"
              value={metrics.activePatients}
              icon={Users}
              trend={{ value: "+8.2%", isPositive: true }}
              delay={0.05}
            />
            <KPICard
              title="Bed Occupancy"
              value={`${metrics.bedOccupancy}%`}
              icon={BedDouble}
              trend={{ value: "+5.1%", isPositive: true }}
              delay={0.1}
            />
            <KPICard
              title="Pending Appointments"
              value={metrics.pendingAppointments}
              icon={Calendar}
              delay={0.15}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Revenue Trends</h3>
                  <p className="text-sm text-muted-foreground">Monthly revenue over the past 6 months</p>
                </div>
                <TrendingUp className="w-5 h-5 text-chart-2" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={COLORS.primary} 
                    fillOpacity={1} 
                    fill="url(#revenueGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Bed Occupancy</h3>
                  <p className="text-sm text-muted-foreground">Current status</p>
                </div>
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.primary : COLORS.jade} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Department Load</h3>
                <p className="text-sm text-muted-foreground">Number of patients by department</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="patients" fill={COLORS.jade} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}

      {currentUser?.role === "doctor" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <KPICard
            title="Today's Appointments"
            value={doctorData?.todaysAppointments || 0}
            icon={Calendar}
            delay={0}
          />
          <KPICard
            title="Pending Prescriptions"
            value={doctorData?.pendingPrescriptions || 0}
            icon={Activity}
            delay={0.05}
          />
        </div>
      )}

    </div>
  );
}

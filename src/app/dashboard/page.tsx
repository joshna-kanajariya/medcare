import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { HospitalStatCard } from "@/components/ui/hospital-stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Bed, 
  Clock, 
  Activity, 
  Calendar, 
  FileText, 
  Plus,
  TrendingUp,
  AlertCircle,
  Heart,
  Stethoscope,
  Pill,
  UserCheck,
  ClipboardList
} from "lucide-react";

// Mock data for hospital metrics
const hospitalMetrics = {
  totalPatients: {
    current: 1847,
    change: { value: "+12%", trend: "up" as const, period: "vs last month" },
    status: "good" as const
  },
  bedOccupancy: {
    current: "78%",
    change: { value: "-5%", trend: "down" as const, period: "week over week" },
    status: "normal" as const
  },
  avgWaitTime: {
    current: "23 min",
    change: { value: "+8 min", trend: "up" as const, period: "vs yesterday" },
    status: "warning" as const
  },
  emergencyAlerts: {
    current: 3,
    change: { value: "+2", trend: "up" as const, period: "active now" },
    status: "critical" as const
  },
  appointmentsToday: {
    current: 127,
    change: { value: "+15", trend: "up" as const, period: "vs avg day" },
    status: "good" as const
  },
  staffOnDuty: {
    current: 84,
    change: { value: "2", trend: "neutral" as const, period: "shift changes" },
    status: "normal" as const
  }
};

async function DashboardContent() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const userRole = session.user?.role;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {session?.user?.profile?.firstName || session?.user?.email?.split('@')[0]}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening at MedCare Hospital today.
        </p>
      </div>

      {/* Hospital-wide Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <HospitalStatCard
          title="Total Patients"
          value={hospitalMetrics.totalPatients.current}
          change={hospitalMetrics.totalPatients.change}
          status={hospitalMetrics.totalPatients.status}
          icon={<Users className="h-4 w-4" />}
          description="Active patients in system"
        />
        <HospitalStatCard
          title="Bed Occupancy"
          value={hospitalMetrics.bedOccupancy.current}
          change={hospitalMetrics.bedOccupancy.change}
          status={hospitalMetrics.bedOccupancy.status}
          icon={<Bed className="h-4 w-4" />}
          description="Hospital capacity utilization"
        />
        <HospitalStatCard
          title="Avg Wait Time"
          value={hospitalMetrics.avgWaitTime.current}
          change={hospitalMetrics.avgWaitTime.change}
          status={hospitalMetrics.avgWaitTime.status}
          icon={<Clock className="h-4 w-4" />}
          description="Emergency department"
        />
        <HospitalStatCard
          title="Emergency Alerts"
          value={hospitalMetrics.emergencyAlerts.current}
          change={hospitalMetrics.emergencyAlerts.change}
          status={hospitalMetrics.emergencyAlerts.status}
          icon={<AlertCircle className="h-4 w-4" />}
          description="Critical situations active"
        />
        <HospitalStatCard
          title="Appointments Today"
          value={hospitalMetrics.appointmentsToday.current}
          change={hospitalMetrics.appointmentsToday.change}
          status={hospitalMetrics.appointmentsToday.status}
          icon={<Calendar className="h-4 w-4" />}
          description="Scheduled for today"
        />
        <HospitalStatCard
          title="Staff on Duty"
          value={hospitalMetrics.staffOnDuty.current}
          change={hospitalMetrics.staffOnDuty.change}
          status={hospitalMetrics.staffOnDuty.status}
          icon={<UserCheck className="h-4 w-4" />}
          description="Current shift"
        />
      </div>

      {/* Role-specific Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Patient Role */}
        {userRole === 'PATIENT' && (
          <>
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>My Appointments</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="font-medium">Next: Dr. Johnson</p>
                  <p className="text-sm text-muted-foreground">Tomorrow at 2:00 PM</p>
                  <p className="text-xs text-muted-foreground">Cardiology Check-up</p>
                </div>
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Book New Appointment
                </Button>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Recent Records</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 hover:bg-accent rounded">
                    <span className="text-sm">Blood Test Results</span>
                    <span className="text-xs text-muted-foreground">2 days ago</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-accent rounded">
                    <span className="text-sm">X-Ray Report</span>
                    <span className="text-xs text-muted-foreground">1 week ago</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  View All Records
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Doctor/Nurse Role */}
        {(userRole === 'DOCTOR' || userRole === 'NURSE') && (
          <>
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  <span>Today's Patients</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                    <div>
                      <p className="font-medium">Room 302</p>
                      <p className="text-sm text-muted-foreground">Jane Smith - Post-op</p>
                    </div>
                    <span className="status-indicator status-warning"></span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                    <div>
                      <p className="font-medium">Room 205</p>
                      <p className="text-sm text-muted-foreground">John Doe - Recovery</p>
                    </div>
                    <span className="status-indicator status-stable"></span>
                  </div>
                </div>
                <Button className="w-full" variant="medical">
                  View All Patients
                </Button>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <span>Pending Tasks</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="p-2 border-l-4 border-l-danger">
                    <p className="text-sm font-medium">Medication Review</p>
                    <p className="text-xs text-muted-foreground">Room 401 - Due in 30 min</p>
                  </div>
                  <div className="p-2 border-l-4 border-l-warning">
                    <p className="text-sm font-medium">Lab Results Review</p>
                    <p className="text-xs text-muted-foreground">3 results pending</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  View All Tasks
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Pharmacist Role */}
        {userRole === 'PHARMACIST' && (
          <>
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Pill className="h-5 w-5 text-primary" />
                  <span>Pending Prescriptions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">23</div>
                  <p className="text-sm text-muted-foreground">Awaiting preparation</p>
                </div>
                <Button className="w-full" variant="medical">
                  Process Prescriptions
                </Button>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Inventory Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="p-2 bg-danger/10 text-danger rounded">
                    <p className="text-sm font-medium">Low Stock: Insulin</p>
                    <p className="text-xs">Only 5 units remaining</p>
                  </div>
                  <div className="p-2 bg-warning/10 text-warning rounded">
                    <p className="text-sm font-medium">Expiring: Antibiotics</p>
                    <p className="text-xs">Expires in 2 weeks</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  Manage Inventory
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Admin Role */}
        {userRole === 'ADMIN' && (
          <>
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">EHR System</span>
                    <span className="status-indicator status-stable"></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Lab Integration</span>
                    <span className="status-indicator status-stable"></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pharmacy System</span>
                    <span className="status-indicator status-warning"></span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  View System Health
                </Button>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>User Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold">42</div>
                    <p className="text-xs text-muted-foreground">Active Users</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold">3</div>
                    <p className="text-xs text-muted-foreground">Pending Approvals</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  Manage Users
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Recent Activity - Common for all roles */}
        <Card className="medical-card lg:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-primary" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="status-indicator status-info mt-1"></span>
                <div className="flex-1">
                  <p className="text-sm font-medium">Patient checked in</p>
                  <p className="text-xs text-muted-foreground">Room 104 - 5 min ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="status-indicator status-stable mt-1"></span>
                <div className="flex-1">
                  <p className="text-sm font-medium">Lab results uploaded</p>
                  <p className="text-xs text-muted-foreground">Patient ID: 789 - 12 min ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="status-indicator status-warning mt-1"></span>
                <div className="flex-1">
                  <p className="text-sm font-medium">Medication due</p>
                  <p className="text-xs text-muted-foreground">Room 205 - 15 min ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <SessionProvider session={session}>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </SessionProvider>
  );
}
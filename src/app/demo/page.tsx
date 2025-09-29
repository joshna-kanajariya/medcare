"use client";

import React, { useState } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { HospitalStatCard } from "@/components/ui/hospital-stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/ui/notification-center";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GlobalSearch } from "@/components/ui/global-search";
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
  ClipboardList,
  Menu,
  X,
  Home,
  Shield,
  BarChart3,
  Building2,
  ChevronRight,
  ChevronDown,
  User,
  LogOut,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

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

// Simple Sidebar for Demo
function DemoSidebar({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean; setIsCollapsed: (collapsed: boolean) => void }) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (title: string) => {
    setExpandedSections(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const navigationItems = [
    { title: "Dashboard", href: "/dashboard", icon: Home },
    { 
      title: "Patient Management", 
      href: "/patients", 
      icon: UserCheck,
      children: [
        { title: "All Patients", href: "/patients", icon: Users },
        { title: "Admissions", href: "/patients/admissions", icon: Building2 },
        { title: "Discharges", href: "/patients/discharges", icon: Activity }
      ]
    },
    { title: "Appointments", href: "/appointments", icon: Calendar },
    { title: "Medical Records", href: "/medical-records", icon: FileText },
    { 
      title: "Clinical Tools", 
      href: "/clinical", 
      icon: Stethoscope,
      children: [
        { title: "Lab Results", href: "/clinical/labs", icon: Activity },
        { title: "Prescriptions", href: "/clinical/prescriptions", icon: Pill },
        { title: "Procedures", href: "/clinical/procedures", icon: FileText }
      ]
    },
    { 
      title: "Administration", 
      href: "/admin", 
      icon: Shield,
      children: [
        { title: "User Management", href: "/admin/users", icon: Users },
        { title: "System Settings", href: "/admin/settings", icon: Activity },
        { title: "Analytics", href: "/admin/analytics", icon: BarChart3 }
      ]
    }
  ];

  return (
    <div className={cn(
      "relative flex h-full flex-col border-r bg-surface transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground">MedCare</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("ml-auto", isCollapsed && "mx-auto")}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4">
          <GlobalSearch placeholder="Search patients, records..." />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navigationItems.map((item) => (
          <div key={item.title}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleSection(item.title)}
                  className={cn(
                    "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground focus:outline-none"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {expandedSections.includes(item.title) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </>
                  )}
                </button>
                {!isCollapsed && expandedSections.includes(item.title) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <button
                        key={child.href}
                        className={cn(
                          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors w-full text-left",
                          "hover:bg-accent hover:text-accent-foreground",
                          "focus:bg-accent focus:text-accent-foreground"
                        )}
                      >
                        <child.icon className="mr-3 h-3 w-3" />
                        {child.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors w-full text-left",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span>{item.title}</span>}
              </button>
            )}
          </div>
        ))}
      </nav>

      {/* User Info */}
      {!isCollapsed && (
        <div className="border-t p-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">DS</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Dr. Sarah</p>
              <p className="text-xs text-muted-foreground">Doctor</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Demo Content
function DemoContent() {
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, Dr. Sarah!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s what&apos;s happening at MedCare Hospital today.
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
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <span>Today&apos;s Patients</span>
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

// Main Demo Dashboard
export default function DemoDashboardPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <DemoSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation Bar */}
          <header className="flex h-16 items-center justify-between border-b bg-surface px-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-foreground">
                Hospital Management Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <NotificationCenter />
              
              {/* User Menu */}
              <div className="flex items-center space-x-2 pl-4 border-l">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">Dr. Sarah</p>
                  <p className="text-xs text-muted-foreground">Doctor</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.location.href = "/"}
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            <DemoContent />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
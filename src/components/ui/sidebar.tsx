"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  Bell, 
  Search,
  Menu,
  X,
  Home,
  UserCheck,
  Pill,
  Activity,
  Shield,
  BarChart3,
  Stethoscope,
  Building2,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "./global-search";

interface SidebarProps {
  className?: string;
  session?: any; // For demo purposes
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["PATIENT", "DOCTOR", "NURSE", "ADMIN", "PHARMACIST"]
  },
  {
    title: "Patient Management",
    href: "/patients",
    icon: UserCheck,
    roles: ["DOCTOR", "NURSE", "ADMIN"],
    children: [
      { title: "All Patients", href: "/patients", icon: Users },
      { title: "Admissions", href: "/patients/admissions", icon: Building2 },
      { title: "Discharges", href: "/patients/discharges", icon: Activity }
    ]
  },
  {
    title: "Appointments",
    href: "/appointments",
    icon: Calendar,
    roles: ["PATIENT", "DOCTOR", "NURSE", "ADMIN"]
  },
  {
    title: "Medical Records",
    href: "/medical-records",
    icon: FileText,
    roles: ["PATIENT", "DOCTOR", "NURSE", "ADMIN"]
  },
  {
    title: "Clinical Tools",
    href: "/clinical",
    icon: Stethoscope,
    roles: ["DOCTOR", "NURSE"],
    children: [
      { title: "Lab Results", href: "/clinical/labs", icon: Activity },
      { title: "Prescriptions", href: "/clinical/prescriptions", icon: Pill },
      { title: "Procedures", href: "/clinical/procedures", icon: FileText }
    ]
  },
  {
    title: "Pharmacy",
    href: "/pharmacy",
    icon: Pill,
    roles: ["PHARMACIST", "ADMIN"],
    children: [
      { title: "Prescriptions", href: "/pharmacy/prescriptions", icon: FileText },
      { title: "Inventory", href: "/pharmacy/inventory", icon: BarChart3 }
    ]
  },
  {
    title: "Administration",
    href: "/admin",
    icon: Shield,
    roles: ["ADMIN"],
    children: [
      { title: "User Management", href: "/admin/users", icon: Users },
      { title: "System Settings", href: "/admin/settings", icon: Settings },
      { title: "Audit Logs", href: "/admin/audit", icon: FileText },
      { title: "Analytics", href: "/admin/analytics", icon: BarChart3 }
    ]
  }
];

export function Sidebar({ className, session: propSession }: SidebarProps) {
  const { data: sessionData } = useSession();
  const session = propSession || sessionData; // Use prop session if provided, otherwise use hook
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (title: string) => {
    setExpandedSections(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const filteredNavItems = navigationItems.filter(item => 
    !item.roles || item.roles.includes(session?.user?.role || "")
  );

  return (
    <div className={cn(
      "relative flex h-full flex-col border-r bg-surface transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground">MedCare</span>
          </Link>
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
        {filteredNavItems.map((item) => (
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
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          "focus:bg-accent focus:text-accent-foreground"
                        )}
                      >
                        <child.icon className="mr-3 h-3 w-3" />
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User Info */}
      {!isCollapsed && session && (
        <div className="border-t p-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {session.user?.profile?.firstName?.[0] || session.user?.email?.[0] || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {session.user?.profile?.firstName || session.user?.email}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {session.user?.role?.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  if (!session) {
    return null;
  }

  return (
    <nav className="bg-surface border-b border-outline/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              MedCare
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/dashboard"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              
              {session.user?.role === 'PATIENT' && (
                <>
                  <Link
                    href="/appointments"
                    className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  >
                    My Appointments
                  </Link>
                  <Link
                    href="/medical-records"
                    className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Medical Records
                  </Link>
                </>
              )}

              {(session.user?.role === 'DOCTOR' || session.user?.role === 'NURSE') && (
                <>
                  <Link
                    href="/patients"
                    className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Patients
                  </Link>
                  <Link
                    href="/appointments"
                    className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Appointments
                  </Link>
                  <Link
                    href="/medical-records"
                    className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Medical Records
                  </Link>
                </>
              )}

              {session.user?.role === 'ADMIN' && (
                <>
                  <Link
                    href="/admin/users"
                    className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  >
                    User Management
                  </Link>
                  <Link
                    href="/admin/audit"
                    className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Audit Logs
                  </Link>
                </>
              )}

              {session.user?.role === 'PHARMACIST' && (
                <>
                  <Link
                    href="/pharmacy/prescriptions"
                    className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Prescriptions
                  </Link>
                  <Link
                    href="/pharmacy/inventory"
                    className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Inventory
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="mr-2">
                {session.user?.profile?.firstName || session.user?.email}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                {session.user?.role?.toLowerCase()}
              </span>
            </div>
            
            <button
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
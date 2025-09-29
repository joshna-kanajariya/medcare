import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to MedCare Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Hello, {session?.user?.profile?.firstName || session?.user?.email}! 
            You are logged in as a {session?.user?.role?.toLowerCase()}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-surface rounded-lg p-6 shadow-sm border border-outline/20">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Account Status
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium text-foreground capitalize">
                  {session?.user?.role?.toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verified:</span>
                <span className={`font-medium ${session?.user?.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                  {session?.user?.isVerified ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Role-specific features */}
          {session?.user?.role === 'PATIENT' && (
            <div className="bg-surface rounded-lg p-6 shadow-sm border border-outline/20">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Patient Services
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground">
                  View My Appointments
                </button>
                <button className="w-full text-left p-3 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground">
                  Medical Records
                </button>
                <button className="w-full text-left p-3 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground">
                  Book Appointment
                </button>
              </div>
            </div>
          )}

          {(session?.user?.role === 'DOCTOR' || session?.user?.role === 'NURSE') && (
            <div className="bg-surface rounded-lg p-6 shadow-sm border border-outline/20">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Clinical Tools
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground">
                  Patient Dashboard
                </button>
                <button className="w-full text-left p-3 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground">
                  Appointments Today
                </button>
                <button className="w-full text-left p-3 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground">
                  Medical Records
                </button>
              </div>
            </div>
          )}

          {session?.user?.role === 'ADMIN' && (
            <div className="bg-surface rounded-lg p-6 shadow-sm border border-outline/20">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Administration
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground">
                  User Management
                </button>
                <button className="w-full text-left p-3 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground">
                  System Settings
                </button>
                <button className="w-full text-left p-3 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground">
                  Audit Logs
                </button>
              </div>
            </div>
          )}

          {session?.user?.role === 'PHARMACIST' && (
            <div className="bg-surface rounded-lg p-6 shadow-sm border border-outline/20">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Pharmacy Tools
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground">
                  Prescription Queue
                </button>
                <button className="w-full text-left p-3 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground">
                  Inventory Management
                </button>
                <button className="w-full text-left p-3 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground">
                  Drug Interactions
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          <div className="bg-surface rounded-lg p-6 shadow-sm border border-outline/20">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Security
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground">
                Change Password
              </button>
              <button className="w-full text-left p-3 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground">
                Two-Factor Auth
              </button>
              <button className="w-full text-left p-3 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground">
                Active Sessions
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-surface rounded-lg p-6 shadow-sm border border-outline/20">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Recent Activity
            </h3>
            <div className="text-muted-foreground">
              <p>No recent activity to display.</p>
              <p className="text-sm mt-2">
                Activity logs and system events will appear here once you start using the system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
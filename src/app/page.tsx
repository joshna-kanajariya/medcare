export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-medical">MedCare</h1>
          <p className="text-muted-foreground mt-2">Hospital Management System</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="medical-card p-8 mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Welcome to MedCare
          </h2>
          <p className="text-muted-foreground mb-6">
            A modern hospital management system built with Next.js 15, TypeScript, and Prisma.
            Manage patients, appointments, medical records, and staff with ease.
          </p>
          
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="medical-card p-4">
              <h3 className="font-semibold text-stable mb-2">System Status</h3>
              <p className="text-sm text-muted-foreground">All systems operational</p>
            </div>
            <div className="medical-card p-4">
              <h3 className="font-semibold text-medical mb-2">Database</h3>
              <p className="text-sm text-muted-foreground">MySQL 8.0+ with Prisma ORM</p>
            </div>
            <div className="medical-card p-4">
              <h3 className="font-semibold text-info-500 mb-2">API Endpoints</h3>
              <p className="text-sm text-muted-foreground">Health checks available</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/api/health"
              className="medical-button px-6 py-3 text-center rounded-lg font-medium transition-all"
            >
              Check System Health
            </a>
            <a
              href="/api/db-health"
              className="px-6 py-3 text-center rounded-lg font-medium border border-border bg-card text-card-foreground hover:bg-muted transition-all"
            >
              Check Database Health
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="medical-card p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Patient Management</h3>
            <p className="text-sm text-muted-foreground">Complete patient records and history management</p>
          </div>

          <div className="medical-card p-6">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Appointments</h3>
            <p className="text-sm text-muted-foreground">Efficient scheduling and booking system</p>
          </div>

          <div className="medical-card p-6">
            <div className="w-12 h-12 bg-info-50 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-info-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Medical Records</h3>
            <p className="text-sm text-muted-foreground">Secure and comprehensive documentation</p>
          </div>

          <div className="medical-card p-6">
            <div className="w-12 h-12 bg-warning-50 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Staff Management</h3>
            <p className="text-sm text-muted-foreground">Healthcare provider profiles and scheduling</p>
          </div>

          <div className="medical-card p-6">
            <div className="w-12 h-12 bg-success-50 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Analytics</h3>
            <p className="text-sm text-muted-foreground">Real-time insights and reporting dashboard</p>
          </div>

          <div className="medical-card p-6">
            <div className="w-12 h-12 bg-error-50 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Billing</h3>
            <p className="text-sm text-muted-foreground">Integrated billing and insurance processing</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
              © 2024 MedCare. Built with Next.js 15, TypeScript, and Prisma.
            </p>
            <div className="flex space-x-4">
              <span className="text-xs text-muted-foreground">
                Health checks: <a href="/api/health" className="text-medical hover:underline">/api/health</a>
              </span>
              <span className="text-xs text-muted-foreground">
                Database: <a href="/api/db-health" className="text-medical hover:underline">/api/db-health</a>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

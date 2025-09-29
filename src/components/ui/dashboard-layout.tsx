"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "./sidebar";
import { NotificationCenter } from "./notification-center";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./button";
import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
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
            
            {session && (
              <>
                {/* User Menu */}
                <div className="flex items-center space-x-2 pl-4 border-l">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {session.user?.profile?.firstName || session.user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {session.user?.role?.toLowerCase()}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    aria-label="Sign out"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
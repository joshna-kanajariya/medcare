"use client";

import React, { useState } from "react";
import { Bell, X, AlertCircle, Info, CheckCircle, Clock } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high";
}

// Mock notifications - in a real app, these would come from an API
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Emergency Alert",
    message: "Code Blue in Room 302 - Immediate response required",
    type: "error",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    read: false,
    priority: "high"
  },
  {
    id: "2",
    title: "Lab Results Ready",
    message: "Blood work results for Patient ID 12345 are now available",
    type: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    read: false,
    priority: "medium"
  },
  {
    id: "3",
    title: "Appointment Reminder",
    message: "Dr. Smith has an appointment in 30 minutes",
    type: "warning",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: true,
    priority: "medium"
  },
  {
    id: "4",
    title: "Medication Administered",
    message: "Patient in Room 205 has received their 2PM medication",
    type: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    read: true,
    priority: "low"
  },
  {
    id: "5",
    title: "System Maintenance",
    message: "Scheduled maintenance will begin at 2 AM tonight",
    type: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    priority: "low"
  }
];

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-danger" />;
      case "warning":
        return <Clock className="h-4 w-4 text-warning" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "info":
      default:
        return <Info className="h-4 w-4 text-info" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const sortedNotifications = notifications.sort((a, b) => {
    // First sort by read status (unread first)
    if (a.read !== b.read) return a.read ? 1 : -1;
    // Then by priority
    if (a.priority !== b.priority) return priorityOrder[b.priority] - priorityOrder[a.priority];
    // Finally by timestamp (newest first)
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-danger text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Notification Panel */}
          <Card className="absolute right-0 top-12 z-50 w-96 max-h-96 overflow-hidden shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-80 overflow-y-auto">
                {sortedNotifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  sortedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "border-b border-border/50 p-4 hover:bg-accent/50 transition-colors cursor-pointer",
                        !notification.read && "bg-primary/5"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={cn(
                              "text-sm font-medium",
                              !notification.read && "font-semibold"
                            )}>
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="h-4 w-4 hover:bg-danger/20"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            {!notification.read && (
                              <span className="h-2 w-2 bg-primary rounded-full"></span>
                            )}
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              notification.priority === "high" && "bg-danger/20 text-danger",
                              notification.priority === "medium" && "bg-warning/20 text-warning",
                              notification.priority === "low" && "bg-muted/20 text-muted-foreground"
                            )}>
                              {notification.priority} priority
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface HospitalStatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
    period: string;
  };
  icon?: React.ReactNode;
  description?: string;
  status?: "normal" | "warning" | "critical" | "good";
  className?: string;
}

export function HospitalStatCard({
  title,
  value,
  change,
  icon,
  description,
  status = "normal",
  className,
}: HospitalStatCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "critical":
        return "border-danger/50 bg-danger/5";
      case "warning":
        return "border-warning/50 bg-warning/5";
      case "good":
        return "border-success/50 bg-success/5";
      default:
        return "border-border";
    }
  };

  const getTrendIcon = () => {
    switch (change?.trend) {
      case "up":
        return <TrendingUp className="h-3 w-3" />;
      case "down":
        return <TrendingDown className="h-3 w-3" />;
      case "neutral":
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = () => {
    switch (change?.trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-danger";
      case "neutral":
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", getStatusColor(), className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && (
          <div className={cn("flex items-center text-xs mt-1", getTrendColor())}>
            {getTrendIcon()}
            <span className="ml-1">
              {change.value} {change.period}
            </span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
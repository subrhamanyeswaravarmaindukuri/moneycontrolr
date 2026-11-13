"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WeeklySpendItem } from "@/lib/calculations/analytics";
import { Calendar, TrendingUp } from "lucide-react";

interface WeeklyVelocityCardProps {
  weeks: WeeklySpendItem[];
}

export function WeeklyVelocityCard({ weeks }: WeeklyVelocityCardProps) {
  const maxWeeklySpent = Math.max(...weeks.map((w) => w.totalSpent), 1);

  return (
    <Card variant="default" className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border-subtle pb-4">
        <div>
          <CardTitle className="text-lg font-black text-apptext flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Weekly Spending Velocity
          </CardTitle>
          <p className="text-xs text-apptext-muted font-medium mt-0.5">
            Spending distribution and daily run-rates across the 4 weeks of the month
          </p>
        </div>
        <Badge variant="neutral" className="text-xs font-bold">
          Chronological
        </Badge>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {weeks.map((week) => (
            <div
              key={week.weekLabel}
              className={`p-4 rounded-2xl border transition-all ${
                week.isCurrentWeek
                  ? "bg-primary/5 border-primary/40 ring-2 ring-primary/20"
                  : "bg-surface border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-extrabold text-apptext">{week.weekLabel}</span>
                {week.isCurrentWeek ? (
                  <Badge className="bg-primary text-white text-[10px] font-bold py-0.5 px-2">
                    Active Week
                  </Badge>
                ) : (
                  <span className="text-[11px] font-medium text-apptext-muted">{week.weekRange}</span>
                )}
              </div>

              <div className="space-y-1 mb-3">
                <p className="text-2xl font-black text-apptext">
                  ₹{week.totalSpent.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-apptext-muted font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-primary" />
                  ~₹{week.dailyAverage.toLocaleString("en-IN")}/day
                </p>
              </div>

              {/* Mini Relative Velocity Bar */}
              <div className="w-full h-2 rounded-full bg-border-subtle overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    week.isCurrentWeek ? "bg-primary" : "bg-apptext-muted/40"
                  }`}
                  style={{
                    width: `${Math.min(100, (week.totalSpent / maxWeeklySpent) * 100)}%`,
                  }}
                />
              </div>

              <p className="text-[10px] text-apptext-muted mt-2">
                {week.transactionCount} transaction{week.transactionCount !== 1 ? "s" : ""} recorded
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

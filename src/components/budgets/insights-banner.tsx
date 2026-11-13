"use client";

import { Card } from "@/components/ui/card";
import { FinancialHealth } from "@/lib/calculations/analytics";
import { CheckCircle2, AlertTriangle, Info, Lightbulb } from "lucide-react";

interface InsightsBannerProps {
  insights: FinancialHealth["insights"];
}

export function InsightsBanner({ insights }: InsightsBannerProps) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="text-base font-black text-apptext">Smart Student Insights & Recommendations</h3>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {insights.map((item, idx) => {
          let borderClass = "border-border";
          let bgClass = "bg-surface";
          let icon = <Info className="w-4 h-4 text-primary" />;

          if (item.type === "positive") {
            borderClass = "border-primary/30";
            bgClass = "bg-primary-light/50";
            icon = <CheckCircle2 className="w-4 h-4 text-primary" />;
          } else if (item.type === "warning") {
            borderClass = "border-amber-300";
            bgClass = "bg-amber-50/70";
            icon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
          }

          return (
            <Card
              key={idx}
              className={`p-4 rounded-2xl border ${borderClass} ${bgClass} space-y-1.5 shadow-xs`}
            >
              <div className="flex items-center gap-2">
                {icon}
                <span className="text-xs font-black text-apptext">{item.title}</span>
              </div>
              <p className="text-xs text-apptext-muted leading-relaxed">{item.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategorySpend } from "@/lib/calculations/analytics";
import {
  Utensils,
  ShoppingBag,
  Bus,
  Receipt,
  GraduationCap,
  Film,
  HeartPulse,
  MoreHorizontal,
  FolderOpen,
} from "lucide-react";

interface CategoryBreakdownCardProps {
  categories: CategorySpend[];
}

export function CategoryBreakdownCard({ categories }: CategoryBreakdownCardProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Utensils":
        return <Utensils className="w-4 h-4" />;
      case "ShoppingBag":
        return <ShoppingBag className="w-4 h-4" />;
      case "Bus":
        return <Bus className="w-4 h-4" />;
      case "Receipt":
        return <Receipt className="w-4 h-4" />;
      case "GraduationCap":
        return <GraduationCap className="w-4 h-4" />;
      case "Film":
        return <Film className="w-4 h-4" />;
      case "HeartPulse":
        return <HeartPulse className="w-4 h-4" />;
      default:
        return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  if (categories.length === 0) {
    return (
      <Card variant="flat" className="p-8 text-center bg-surface">
        <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center mx-auto mb-3">
          <FolderOpen className="w-6 h-6" />
        </div>
        <p className="text-base font-bold text-apptext">No categorized expenses yet</p>
        <p className="text-xs text-apptext-muted mt-1">
          Record your daily spending to see an automatic breakdown of your top expense areas.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="default" className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border-subtle pb-4">
        <div>
          <CardTitle className="text-lg font-black text-apptext">Spending by Category</CardTitle>
          <p className="text-xs text-apptext-muted font-medium mt-0.5">
            Ranked by total money spent this monthly billing cycle
          </p>
        </div>
        <Badge variant="neutral" className="text-xs font-bold">
          {categories.length} Categories Active
        </Badge>
      </CardHeader>

      <CardContent className="pt-6 space-y-5">
        {categories.map((cat) => (
          <div key={cat.categoryId} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: cat.categoryColor || "#145C43" }}
                >
                  {getIcon(cat.categoryIcon)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-apptext">{cat.categoryName}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        cat.classification === "needs"
                          ? "bg-primary-light text-primary"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {cat.classification}
                    </span>
                  </div>
                  <p className="text-[11px] text-apptext-muted">
                    {cat.transactionCount} spend{cat.transactionCount > 1 ? "s" : ""} • avg. ₹
                    {cat.averageTransaction.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-black text-apptext">
                  ₹{cat.totalSpent.toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] font-semibold text-apptext-muted">
                  {cat.percentageOfTotal}% of total
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-border-subtle overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, cat.percentageOfTotal)}%`,
                  backgroundColor: cat.categoryColor || "#145C43",
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

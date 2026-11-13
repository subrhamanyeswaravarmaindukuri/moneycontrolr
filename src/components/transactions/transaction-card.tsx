"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/types/database.types";
import {
  Utensils,
  ShoppingBag,
  Bus,
  Receipt,
  GraduationCap,
  Film,
  HeartPulse,
  MoreHorizontal,
  Briefcase,
  Award,
  Clock,
  Laptop,
  PlusCircle,
  HeartHandshake,
  Trash2,
  Edit2,
  Calendar,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  ShoppingBag,
  Bus,
  Receipt,
  GraduationCap,
  Film,
  HeartPulse,
  MoreHorizontal,
  Briefcase,
  Award,
  Clock,
  Laptop,
  PlusCircle,
  HeartHandshake,
};

interface TransactionCardProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

export function TransactionCard({
  transaction,
  onEdit,
  onDelete,
}: TransactionCardProps) {
  const IconComponent = transaction.category?.icon
    ? ICON_MAP[transaction.category.icon] || MoreHorizontal
    : MoreHorizontal;

  const isExpense = transaction.type === "expense";

  return (
    <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-surface border border-border-subtle hover:border-border hover:shadow-sm transition-all group">
      {/* Left: Category Icon & Details */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
            isExpense
              ? "bg-primary-light text-primary"
              : "bg-status-successLight text-status-success"
          }`}
        >
          <IconComponent className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm sm:text-base font-bold text-apptext truncate">
              {transaction.category?.name || "General"}
            </h4>
            <Badge variant={isExpense ? "neutral" : "success"} size="sm" className="hidden sm:inline-flex uppercase text-[10px] tracking-wider">
              {transaction.payment_source}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-apptext-muted mt-0.5">
            <span className="sm:hidden font-medium uppercase text-[10px] text-apptext-light">
              {transaction.payment_source} •
            </span>
            {transaction.note ? (
              <span className="truncate italic text-apptext-muted font-normal max-w-[200px] sm:max-w-xs">
                "{transaction.note}"
              </span>
            ) : (
              <span>No memo</span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Amount & Actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="text-right">
          <p
            className={`text-sm sm:text-base font-black tracking-tight ${
              isExpense ? "text-apptext" : "text-status-success font-bold"
            }`}
          >
            {isExpense ? "-" : "+"}
            {formatCurrency(transaction.amount)}
          </p>
        </div>

        {/* Action Buttons (Edit / Delete) */}
        <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(transaction)}
              className="p-1.5 sm:p-2 rounded-lg text-apptext-muted hover:text-primary hover:bg-background transition-colors"
              title="Edit transaction"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(transaction)}
              className="p-1.5 sm:p-2 rounded-lg text-apptext-muted hover:text-status-danger hover:bg-status-dangerLight transition-colors"
              title="Delete transaction"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Transaction } from "@/types/database.types";
import { deleteTransaction } from "@/app/transactions/actions";

interface DeleteDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteDialog({ transaction, isOpen, onClose, onDeleted }: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !transaction) return null;

  async function handleDelete() {
    if (!transaction) return;
    setIsDeleting(true);
    setError(null);

    const res = await deleteTransaction(transaction.id);
    if (res.error) {
      setError(res.error);
      setIsDeleting(false);
    } else {
      setIsDeleting(false);
      onDeleted();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <Card variant="elevated" className="w-full max-w-md bg-surface border-border shadow-xl">
        <CardHeader className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-status-dangerLight text-status-danger flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <CardTitle className="text-xl font-bold text-apptext">
            Delete Transaction?
          </CardTitle>
          <CardDescription className="text-sm text-apptext-muted">
            Are you sure you want to delete this record? This action will permanently remove it from your history and recalculate your daily allowance.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Summary Box */}
          <div className="p-3.5 rounded-xl bg-background border border-border flex items-center justify-between text-sm">
            <div>
              <p className="font-bold text-apptext">{transaction.category?.name || "Transaction"}</p>
              <p className="text-xs text-apptext-muted">
                {transaction.transaction_date} • {transaction.payment_source.toUpperCase()}
              </p>
            </div>
            <p className={`font-bold ${transaction.type === "expense" ? "text-status-danger" : "text-status-success"}`}>
              {transaction.type === "expense" ? "-" : "+"}
              {formatCurrency(transaction.amount)}
            </p>
          </div>

          {error && (
            <p className="text-xs font-semibold text-status-danger bg-status-dangerLight p-2.5 rounded-lg border border-status-danger/20">
              {error}
            </p>
          )}

          <div className="flex gap-2.5 pt-2">
            <Button
              variant="outline"
              size="md"
              className="flex-1 font-semibold"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              className="flex-1 font-semibold"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete Permanently
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


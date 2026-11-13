import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/types/database.types";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { ArrowRight, Receipt, Plus } from "lucide-react";

interface RecentActivityProps {
  transactions: Transaction[];
}

export function RecentActivity({ transactions }: RecentActivityProps) {
  return (
    <Card variant="flat" className="p-5 sm:p-6 border-border bg-surface space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-apptext uppercase tracking-wider">
            Recent Activity
          </h3>
        </div>

        <Link
          href="/transactions"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 space-y-3">
          <p className="text-xs text-apptext-muted font-medium">
            No transactions logged in this cycle yet.
          </p>
          <Link href="/transactions/new">
            <Button size="sm" className="font-bold">
              <Plus className="w-4 h-4 mr-1" />
              Log Your First Expense
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          {transactions.map((tx) => (
            <TransactionCard key={tx.id} transaction={tx} />
          ))}
        </div>
      )}
    </Card>
  );
}


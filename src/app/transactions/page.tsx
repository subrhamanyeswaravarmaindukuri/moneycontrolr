import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";
import { requireVerifiedUser } from "@/lib/security/server-auth";
import { TransactionsView } from "@/components/transactions/transactions-view";
import { getCategories, getTransactions } from "./actions";

export const metadata: Metadata = {
  title: "Transactions",
  robots: NOINDEX_ROBOTS,
};

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  await requireVerifiedUser("/transactions");

  const [categories, transactions] = await Promise.all([
    getCategories(),
    getTransactions(),
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-[1440px] mx-auto">
          <TransactionsView
            initialTransactions={transactions}
            categories={categories}
          />
        </div>
      </main>
    </div>
  );
}

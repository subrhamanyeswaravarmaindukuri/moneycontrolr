import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Compass, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <Card variant="flat" className="max-w-md w-full p-8 text-center bg-surface border-border shadow-card space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-primary-light text-primary flex items-center justify-center mx-auto shadow-sm">
            <Compass className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              404 • Page Not Found
            </span>
            <h1 className="text-2xl font-black text-apptext">Lost in Your Finances?</h1>
            <p className="text-xs sm:text-sm text-apptext-muted leading-relaxed">
              The page or route you were looking for doesn't exist or has moved. Let's get you back on track.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" className="flex-1">
              <Button size="md" className="w-full font-bold shadow-sm">
                <Home className="w-4 h-4 mr-1.5" />
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" size="md" className="w-full font-bold">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Homepage
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}


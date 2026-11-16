"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected errors for diagnostic purposes
    console.error("Global application runtime error:", error);
  }, [error]);

  const handleRetry = () => {
    // If an error occurs during an active deployment switchover or cold boot,
    // reloading the window fetches the newest deployment manifest automatically.
    if (typeof window !== "undefined") {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-8">
      <Card variant="flat" className="max-w-md w-full p-8 text-center bg-surface border-border shadow-card space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
            Application Notice
          </span>
          <h1 className="text-2xl font-black text-apptext">Update in Progress</h1>
          <p className="text-xs sm:text-sm text-apptext-muted leading-relaxed">
            The app was just updated on the server. Please reload the page to continue. Your financial data is completely safe in the database.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleRetry} size="md" className="flex-1 font-bold shadow-sm">
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Reload & Continue
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" size="md" className="w-full font-bold">
              <Home className="w-4 h-4 mr-1.5" />
              Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}


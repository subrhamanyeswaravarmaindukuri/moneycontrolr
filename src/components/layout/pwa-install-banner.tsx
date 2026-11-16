"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isIos, setIsIos] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("mc_pwa_dismissed");
      if (!dismissed) {
        setIsDismissed(false);
      }

      // Check if iOS
      const ua = window.navigator.userAgent.toLowerCase();
      const isAppleMobile = /iphone|ipad|ipod/.test(ua);
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as unknown as { standalone?: boolean }).standalone;
      
      if (isAppleMobile && !isStandalone) {
        setIsIos(true);
      }
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsDismissed(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
        setIsDismissed(true);
      }
    } else if (isIos) {
      setShowIosTip(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("mc_pwa_dismissed", "true");
    }
  };

  if (isDismissed || (!deferredPrompt && !isIos)) {
    return null;
  }

  return (
    <aside
      aria-label="Install App"
      className="bg-primary/95 text-white px-4 py-2.5 sm:py-3 shadow-md relative z-40 transition-all border-b border-primary/20"
    >
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-emerald-200" />
          </div>
          <div>
            <span className="font-bold">Install MoneyControlr:</span>{" "}
            <span className="text-white/80">Add to your phone for instant 1-tap daily expense tracking.</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="bg-white text-primary hover:bg-emerald-50 font-bold text-xs h-8 px-3 shadow-sm border-0"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Install App
          </Button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="p-1 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIosTip && (
        <div className="max-w-[1440px] mx-auto mt-2 pt-2 border-t border-white/15 text-xs text-emerald-100 flex items-center justify-between">
          <span>
            To install on iPhone: Tap the <strong>Share</strong> button (box with arrow) at the bottom of Safari, then choose <strong>&quot;Add to Home Screen&quot;</strong>.
          </span>
          <button
            onClick={() => setShowIosTip(false)}
            className="underline ml-2 hover:text-white font-semibold"
          >
            Got it
          </button>
        </div>
      )}
    </aside>
  );
}

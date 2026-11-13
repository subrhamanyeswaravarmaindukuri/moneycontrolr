import { Wallet } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-card animate-pulse">
          <Wallet className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
        </div>
        <p className="text-xs font-bold text-apptext-muted tracking-wider uppercase">
          Calculating financial metrics...
        </p>
      </div>
    </div>
  );
}


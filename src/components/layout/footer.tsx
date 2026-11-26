import Link from "next/link";
import { BrandEmblem } from "./brand-logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-10 sm:py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-apptext-muted">
        <Link href="/" className="flex items-center gap-3 group">
          <BrandEmblem size="sm" className="group-hover:scale-105 transition-transform" />
          <div>
            <span className="font-bold text-sm text-apptext">MoneyControlr</span>
            <p className="text-[11px] text-apptext-light">Student Expense Tracker &amp; Budget Planner</p>
          </div>
        </Link>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link
            href="/features"
            className="text-xs sm:text-sm font-semibold text-apptext-muted hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="/calculator"
            className="text-xs sm:text-sm font-semibold text-apptext-muted hover:text-primary transition-colors"
          >
            Calculator
          </Link>
          <Link
            href="/guide"
            className="text-xs sm:text-sm font-semibold text-apptext-muted hover:text-primary transition-colors"
          >
            Guide
          </Link>
          <Link
            href="/about"
            className="text-xs sm:text-sm font-semibold text-apptext-muted hover:text-primary transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-xs sm:text-sm font-semibold text-apptext-muted hover:text-primary transition-colors"
          >
            Contact
          </Link>
          <Link
            href="/login"
            className="text-xs sm:text-sm font-semibold text-apptext-muted hover:text-primary transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="text-xs sm:text-sm font-semibold text-primary hover:underline transition-colors"
          >
            Get Started
          </Link>
        </nav>
      </div>

      {/* Trust & Independence Disclaimer */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-6 mt-6 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-apptext-muted leading-relaxed">
        <p className="text-center md:text-left max-w-3xl">
          <strong className="text-apptext">Independence Disclaimer:</strong> MoneyControlr is an independent student budgeting and expense tracking tool. We are not affiliated with, endorsed by, or connected to Moneycontrol.com or Network18. We do not provide stock trading, demat accounts, mutual funds, or financial investment advice. All expense tracking is 100% manual.
        </p>
        <p className="text-center md:text-right shrink-0">
          © 2026 MoneyControlr. Built for college students everywhere.
        </p>
      </div>
    </footer>
  );
}

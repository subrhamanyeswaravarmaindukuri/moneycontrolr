"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { BrandEmblem } from "./brand-logo";
import { Menu, X, ArrowRight, LogOut, User as UserIcon, Settings } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoggingOut, startLogoutTransition] = useTransition();

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/onboarding" ||
    pathname === "/verify-email" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/budgets") ||
    pathname.startsWith("/settings");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        setUser(user ?? null);
        setIsLoadingAuth(false);
      })
      .catch(() => {
        setUser(null);
        setIsLoadingAuth(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoadingAuth(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = () => {
    startLogoutTransition(async () => {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } finally {
        setUser(null);
        setMobileMenuOpen(false);
        router.push("/login");
        router.refresh();
      }
    });
  };

  const isVerifiedUser = Boolean(user && user.email_confirmed_at);

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "Student";

  const showAppNav = isVerifiedUser || isProtectedRoute;
  const navLinks = showAppNav
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/transactions", label: "Transactions" },
        { href: "/budgets", label: "Budgets & Analytics" },
        { href: "/onboarding", label: "Budget Setup" },
        { href: "/settings", label: "Settings" },
      ]
    : [
        { href: "/features", label: "Features" },
        { href: "/calculator", label: "Calculator" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
      ];

  return (
    <header className="sticky top-0 z-50 w-full bg-surface/90 backdrop-blur-md border-b border-border/80">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <BrandEmblem size="md" className="group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-primary">
                  MoneyControlr
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider bg-primary-light text-primary px-2 py-0.5 rounded-full">
                  Fintech
                </span>
              </div>
              <p className="text-[11px] text-apptext-muted hidden sm:block font-medium">
                Know your money. Control your day.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {!isAuthPage && (
            <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-8">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-semibold text-apptext hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Desktop Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {!isLoadingAuth && isVerifiedUser ? (
              /* Verified Authenticated User View: User badge + Log Out */
              <div className="flex items-center gap-3">
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light border border-primary/20 text-xs font-bold text-primary max-w-[200px] hover:bg-primary/15 transition-colors"
                  title="Account & Security Settings"
                >
                  <UserIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{displayName}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="font-semibold text-xs text-apptext hover:text-status-danger"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  {isLoggingOut ? "Logging out..." : "Log Out"}
                </Button>
              </div>
            ) : !isLoadingAuth && user && !isVerifiedUser ? (
              /* Unverified Session View: Do not grant app nav; nudge to verify or log out */
              <div className="flex items-center gap-2">
                <Link href={`/verify-email${user.email ? `?email=${encodeURIComponent(user.email)}` : ""}`}>
                  <Button size="sm" className="font-semibold text-xs">
                    Verify Email
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="font-semibold text-xs text-apptext-muted hover:text-status-danger"
                >
                  Log Out
                </Button>
              </div>
            ) : !isLoadingAuth && !user ? (
              /* Unauthenticated View: Log In + Get Started */
              <>
                <Link href="/login">
                  <Button variant="ghost" size="md" className="font-semibold text-apptext hover:text-primary">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="md" className="font-semibold shadow-sm">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </>
            ) : (
              /* Hydration placeholder preventing flicker */
              <div className="w-24 h-9" />
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="sm:hidden flex items-center gap-2">
            {!isLoadingAuth && !user && (
              <Link href="/signup">
                <Button size="sm" className="font-semibold text-xs">
                  Get Started
                </Button>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-apptext hover:bg-background"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-border bg-surface px-4 pt-3 pb-5 space-y-3">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-apptext hover:text-primary"
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-3 border-t border-border">
            {!isLoadingAuth && isVerifiedUser && user ? (
              <div className="space-y-3">
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-light text-xs font-bold text-primary"
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <span className="truncate">{displayName}</span>
                  <span className="text-[10px] text-apptext-muted font-normal ml-auto truncate">
                    {user.email}
                  </span>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full font-bold text-status-danger border-status-danger/30 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  {isLoggingOut ? "Logging out..." : "Log Out"}
                </Button>
              </div>
            ) : !isLoadingAuth && user && !isVerifiedUser ? (
              <div className="space-y-2">
                <Link
                  href={`/verify-email${user.email ? `?email=${encodeURIComponent(user.email)}` : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <Button size="sm" className="w-full font-semibold">
                    Verify Email
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full font-bold text-status-danger border-status-danger/30 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full font-semibold">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                  <Button size="sm" className="w-full font-semibold">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

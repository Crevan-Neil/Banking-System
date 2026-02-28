"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Shield,
  ArrowRight,
  Lock,
  Zap,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description:
      "256-bit encryption with JWT authentication and token blacklisting to keep your data safe.",
  },
  {
    icon: Zap,
    title: "Instant Transfers",
    description:
      "Send money to any VaultBank account in real-time with idempotent transaction processing.",
  },
  {
    icon: Globe,
    title: "Ledger-Based Accounting",
    description:
      "Double-entry bookkeeping with immutable ledger entries ensures accurate balance tracking.",
  },
];

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground tracking-tight">
              VaultBank
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-foreground">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            Secure banking, built for the modern era
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-xl mx-auto text-pretty">
            Manage your accounts, track balances, and transfer funds with
            enterprise-grade security and real-time processing.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Open an Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-card">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl tracking-tight">
              Why VaultBank
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Built on robust financial infrastructure with security at every
              layer.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-4 rounded-xl border border-border/50 bg-background p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
                  <feature.icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                VaultBank
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Protected by 256-bit encryption. All transfers are processed with
              idempotency guarantees.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

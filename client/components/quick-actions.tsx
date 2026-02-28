"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeftRight, History, ShieldCheck } from "lucide-react";

const actions = [
  {
    title: "Transfer Funds",
    description: "Send money to another account securely with real-time processing.",
    href: "/dashboard/transfer",
    icon: ArrowLeftRight,
  },
  {
    title: "Transaction History",
    description: "View your past transactions and track all account activity.",
    href: "/dashboard",
    icon: History,
  },
  {
    title: "Account Security",
    description: "Review your security settings and active sessions.",
    href: "/dashboard",
    icon: ShieldCheck,
  },
];

export function QuickActions() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Quick Actions
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Card className="border-border/50 transition-colors hover:bg-secondary/50 cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <action.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <CardTitle className="text-base font-medium text-foreground">
                    {action.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {action.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useAuth } from "@/lib/auth-context";
import { AccountOverview } from "@/components/account-overview";
import { QuickActions } from "@/components/quick-actions";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          {"Welcome back, "}
          {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {"Here's an overview of your banking account"}
        </p>
      </div>

      {/* Account Overview */}
      <AccountOverview />

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { accountApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  IndianRupee,
  RefreshCw,
  Plus,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

interface Account {
  _id: string;
  user: string;
  status: string;
  currency: string;
}

export function AccountOverview() {
  const [account, setAccount] = useState<Account | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAccount = useCallback(async () => {
    const { data, error } = await accountApi.get();
    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }
    if (data?.account) {
      setAccount(data.account);
      // Fetch balance
      const balRes = await accountApi.getBalance(data.account._id);
      if (balRes.data) {
        setBalance(balRes.data.balance);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  async function handleCreateAccount() {
    setCreatingAccount(true);
    const { data, error } = await accountApi.create();
    setCreatingAccount(false);
    if (error) {
      toast.error(error);
      return;
    }
    if (data?.account) {
      setAccount(data.account);
      setBalance(0);
      toast.success("Account created successfully!");
    }
  }

  async function handleRefreshBalance() {
    if (!account) return;
    setRefreshing(true);
    const { data, error } = await accountApi.getBalance(account._id);
    setRefreshing(false);
    if (error) {
      toast.error(error);
      return;
    }
    if (data) {
      setBalance(data.balance);
      toast.success("Balance refreshed");
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/50">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!account) {
    return (
      <Card className="border-border/50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <CreditCard className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-foreground">
              No account yet
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Create a banking account to start managing your finances, check
              balances, and transfer funds.
            </p>
          </div>
          <Button onClick={handleCreateAccount} disabled={creatingAccount}>
            {creatingAccount ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusColor =
    account.status === "ACTIVE"
      ? "default"
      : account.status === "FROZEN"
        ? "secondary"
        : "destructive";

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* Balance Card */}
      <Card className="border-border/50 sm:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex flex-col gap-1">
            <CardDescription className="text-muted-foreground">
              Available Balance
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-foreground tabular-nums">
              <span className="flex items-center gap-1">
                <IndianRupee className="h-6 w-6" />
                {balance !== null ? balance.toLocaleString("en-IN") : "---"}
              </span>
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefreshBalance}
            disabled={refreshing}
            aria-label="Refresh balance"
          >
            <RefreshCw
              className={`h-4 w-4 text-muted-foreground ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Currency: {account.currency}
          </p>
        </CardContent>
      </Card>

      {/* Account Status Card */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardDescription className="text-muted-foreground">
            Account Status
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Badge variant={statusColor} className="w-fit">
            {account.status}
          </Badge>
          <p className="text-xs text-muted-foreground">
            Account is fully operational
          </p>
        </CardContent>
      </Card>

      {/* Account ID Card */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardDescription className="text-muted-foreground">
            Account ID
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <code className="text-xs font-mono text-foreground bg-secondary px-2 py-1 rounded">
              {account._id}
            </code>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this ID to receive transfers
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

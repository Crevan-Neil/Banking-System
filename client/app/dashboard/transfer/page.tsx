"use client";

import { useEffect, useState, useCallback } from "react";
import { accountApi, transactionApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  CheckCircle2,
  IndianRupee,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Step = "form" | "confirm" | "success";

interface TransactionResult {
  _id: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  status: string;
}

export default function TransferPage() {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [submitting, setSubmitting] = useState(false);
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);

  const fetchAccount = useCallback(async () => {
    const { data } = await accountApi.get();
    if (data?.account) {
      setAccountId(data.account._id);
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

  function generateIdempotencyKey() {
    return `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  async function handleSubmit() {
    if (!accountId) {
      toast.error("No account found. Please create an account first.");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (balance !== null && numAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }
    if (!toAccount.trim()) {
      toast.error("Please enter the recipient account ID");
      return;
    }
    if (toAccount.trim() === accountId) {
      toast.error("Cannot transfer to your own account");
      return;
    }
    setStep("confirm");
  }

  async function handleConfirm() {
    if (!accountId) return;
    setSubmitting(true);
    const { data, error } = await transactionApi.create({
      fromAccount: accountId,
      toAccount: toAccount.trim(),
      amount: parseFloat(amount),
      idempotencyKey: generateIdempotencyKey(),
    });
    setSubmitting(false);
    if (error) {
      toast.error(error);
      setStep("form");
      return;
    }
    if (data?.transaction) {
      setTxResult(data.transaction);
      setStep("success");
      // Refresh balance
      const balRes = await accountApi.getBalance(accountId);
      if (balRes.data) {
        setBalance(balRes.data.balance);
      }
    }
  }

  function handleNewTransfer() {
    setToAccount("");
    setAmount("");
    setStep("form");
    setTxResult(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Loading account details...
          </p>
        </div>
      </div>
    );
  }

  if (!accountId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">
            No Account Found
          </h2>
          <p className="mt-1 text-muted-foreground">
            Please create an account from the dashboard first.
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Step: Form */}
      {step === "form" && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">
              Transfer Funds
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Send money to another VaultBank account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Current balance */}
            <div className="mb-6 flex items-center justify-between rounded-lg bg-secondary p-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  Available Balance
                </p>
                <p className="text-lg font-semibold text-foreground tabular-nums flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  {balance !== null ? balance.toLocaleString("en-IN") : "---"}
                </p>
              </div>
              <code className="text-xs font-mono text-muted-foreground">
                {accountId.slice(0, 8)}...
              </code>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="toAccount" className="text-foreground">
                  Recipient Account ID
                </Label>
                <Input
                  id="toAccount"
                  type="text"
                  placeholder="Enter recipient's account ID"
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  required
                  className="bg-background font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Ask the recipient for their VaultBank account ID
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="amount" className="text-foreground">
                  Amount (INR)
                </Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="1"
                    step="0.01"
                    className="bg-background pl-10 tabular-nums"
                  />
                </div>
              </div>

              <Button type="submit" className="mt-2 w-full">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step: Confirm */}
      {step === "confirm" && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">
              Confirm Transfer
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Please review the details before confirming
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="rounded-lg bg-secondary p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">From</span>
                <code className="text-sm font-mono text-foreground">
                  {accountId.slice(0, 12)}...
                </code>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">To</span>
                <code className="text-sm font-mono text-foreground">
                  {toAccount.slice(0, 12)}
                  {toAccount.length > 12 ? "..." : ""}
                </code>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-xl font-bold text-foreground tabular-nums flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  {parseFloat(amount).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("form")}
                disabled={submitting}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Transfer"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Success */}
      {step === "success" && txResult && (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center py-10 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Transfer Successful
              </h2>
              <p className="mt-1 text-muted-foreground">
                Your transaction has been processed
              </p>
            </div>

            <div className="w-full rounded-lg bg-secondary p-5 flex flex-col gap-3 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Transaction ID
                </span>
                <code className="text-xs font-mono text-foreground">
                  {txResult._id}
                </code>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-semibold text-foreground tabular-nums flex items-center gap-1">
                  <IndianRupee className="h-3.5 w-3.5" />
                  {txResult.amount.toLocaleString("en-IN")}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium text-success">
                  {txResult.status}
                </span>
              </div>
            </div>

            <div className="flex gap-3 w-full mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleNewTransfer}
              >
                New Transfer
              </Button>
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full">Back to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

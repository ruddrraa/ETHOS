"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type TodayAttendance = {
  id: string;
  checkIn: Date | null;
  checkOut: Date | null;
  status: string;
} | null;

interface CheckInOutButtonProps {
  todayAttendance: TodayAttendance;
}

export function CheckInOutButton({ todayAttendance }: CheckInOutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasCheckedIn = Boolean(todayAttendance?.checkIn);
  const hasCheckedOut = Boolean(todayAttendance?.checkOut);

  const handleCheckIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/attendance/checkin", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        startTransition(() => router.refresh());
      } else {
        setError(data.error ?? "Failed to check in");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/attendance/checkout", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        startTransition(() => router.refresh());
      } else {
        setError(data.error ?? "Failed to check out");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm text-destructive font-medium">{error}</p>}
      
      {hasCheckedOut ? (
        <Button id="checkin-done-btn" variant="outline" className="w-full h-12" disabled>
          <LogOut className="h-4 w-4 mr-2" />
          Shift Completed
        </Button>
      ) : hasCheckedIn ? (
        <Button
          id="checkout-btn"
          variant="destructive"
          onClick={handleCheckOut}
          disabled={isLoading || isPending}
          className="w-full h-12 font-semibold shadow-md"
        >
          {isLoading || isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
          Check Out
        </Button>
      ) : (
        <Button
          id="checkin-btn"
          onClick={handleCheckIn}
          disabled={isLoading || isPending}
          className="w-full h-12 font-semibold shadow-md"
        >
          {isLoading || isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
          Check In
        </Button>
      )}
    </div>
  );
}

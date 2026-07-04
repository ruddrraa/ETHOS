"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { checkInAction, checkOutAction } from "@/features/attendance/actions/attendance.actions";

interface AttendanceWidgetProps {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  checkInTime?: Date | null;
}

export function AttendanceWidget({ hasCheckedIn, hasCheckedOut, checkInTime }: AttendanceWidgetProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckIn = async () => {
    setIsLoading(true);
    const res = await checkInAction();
    setIsLoading(false);
    if (res.success) {
      toast.success("Successfully checked in for today!");
    } else {
      toast.error(res.error);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    const res = await checkOutAction();
    setIsLoading(false);
    if (res.success) {
      toast.success("Successfully checked out. Have a good evening!");
    } else {
      toast.error(res.error);
    }
  };

  const formatTime = (d?: Date | null) => {
    if (!d) return "--:--";
    return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-xl bg-card">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-full">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Today&apos;s Attendance</h3>
          <p className="text-sm text-muted-foreground">
            {hasCheckedIn ? `Checked in at ${formatTime(checkInTime)}` : "You haven't checked in yet."}
          </p>
        </div>
      </div>
      <div className="sm:ml-auto flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
        {!hasCheckedIn ? (
          <Button onClick={handleCheckIn} disabled={isLoading} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
            Check In
          </Button>
        ) : !hasCheckedOut ? (
          <Button onClick={handleCheckOut} disabled={isLoading} variant="destructive" className="w-full sm:w-auto">
            Check Out
          </Button>
        ) : (
          <Button disabled variant="outline" className="w-full sm:w-auto">
            Completed for today
          </Button>
        )}
      </div>
    </div>
  );
}

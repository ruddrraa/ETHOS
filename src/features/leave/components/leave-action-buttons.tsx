"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { approveLeaveAction, rejectLeaveAction } from "@/features/leave/actions/leave.actions";
import { Check, X } from "lucide-react";

interface LeaveActionButtonsProps {
  leaveId: string;
}

export function LeaveActionButtons({ leaveId }: LeaveActionButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    const res = await approveLeaveAction(leaveId);
    setIsLoading(false);
    if (res.success) {
      toast.success("Leave approved");
    } else {
      toast.error(res.error);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this leave request?")) return;
    setIsLoading(true);
    const res = await rejectLeaveAction(leaveId);
    setIsLoading(false);
    if (res.success) {
      toast.success("Leave rejected");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" className="h-8 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200" onClick={handleApprove} disabled={isLoading}>
        <Check className="h-4 w-4 mr-1" /> Approve
      </Button>
      <Button size="sm" variant="outline" className="h-8 bg-red-50 text-red-600 hover:bg-red-100 border-red-200" onClick={handleReject} disabled={isLoading}>
        <X className="h-4 w-4 mr-1" /> Reject
      </Button>
    </div>
  );
}

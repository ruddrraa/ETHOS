"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateAnnouncementForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  async function onSubmit() {
    setIsLoading(true);
    
    // Simulating the server action
    setTimeout(() => {
      toast.success("Announcement published successfully!");
      setIsLoading(false);
      reset();
      if (onSuccess) onSuccess();
    }, 1000);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title", { required: true })} placeholder="E.g. Company Townhall" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" {...register("content", { required: true })} rows={4} placeholder="Type your announcement here..." />
      </div>

      <div className="flex items-center space-x-2">
        <input type="checkbox" id="isPinned" {...register("isPinned")} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
        <Label htmlFor="isPinned" className="font-normal">Pin this announcement to the top</Label>
      </div>

      <Button type="submit" isLoading={isLoading}>
        Publish Announcement
      </Button>
    </form>
  );
}

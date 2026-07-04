"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";

export function DocumentUploadForm({ employeeId, onSuccess }: { employeeId?: string, onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      toast.success("Document uploaded successfully (Mock)");
      setIsLoading(false);
      if (onSuccess) onSuccess();
    }, 1500);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 pt-4">
      <div className="space-y-2">
        <Label htmlFor="title">Document Title (e.g. Offer Letter, Resume)</Label>
        <Input id="title" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Document Type</Label>
        <select id="type" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required>
          <option value="ID_PROOF">ID Proof (Aadhaar, PAN)</option>
          <option value="RESUME">Resume</option>
          <option value="OFFER_LETTER">Offer Letter</option>
          <option value="CONTRACT">Contract</option>
          <option value="CERTIFICATE">Certificate</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
          <UploadCloud className="h-8 w-8 mb-2 text-primary/60" />
          <p className="text-sm font-medium">Click to upload or drag and drop</p>
          <p className="text-xs mt-1">PDF, JPG, PNG (Max 5MB)</p>
          <Input id="file" type="file" className="hidden" />
          <Button type="button" variant="outline" className="mt-4" onClick={() => document.getElementById('file')?.click()}>
            Select File
          </Button>
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">
          Note: Cloudinary integration is pending API credentials.
        </p>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Upload Document
      </Button>
    </form>
  );
}

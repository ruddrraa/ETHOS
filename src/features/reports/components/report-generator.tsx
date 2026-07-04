"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DownloadCloud } from "lucide-react";

export function ReportGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState("ATTENDANCE");
  const [exportFormat, setExportFormat] = useState("CSV");

  async function handleExport() {
    setIsLoading(true);
    
    // Simulate generation time
    setTimeout(() => {
      // Generate some basic CSV data based on the report type so it's not a blank file
      let csvContent = "";
      if (reportType === "ATTENDANCE") {
        csvContent = "Date,Employee Name,Status,Check In,Check Out,Hours Worked\n2026-07-04,Jane Smith,PRESENT,09:00 AM,05:00 PM,8\n2026-07-03,Jane Smith,PRESENT,08:50 AM,05:10 PM,8.3\n";
      } else if (reportType === "LEAVE") {
        csvContent = "Start Date,End Date,Employee Name,Leave Type,Status,Days\n2026-06-10,2026-06-12,Jane Smith,SICK,APPROVED,3\n";
      } else {
        csvContent = "Report Type,Generated Date,Status\n" + reportType + "," + new Date().toLocaleDateString() + ",Completed\n";
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${reportType.toLowerCase()}_report.${exportFormat.toLowerCase()}`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${reportType} report exported as ${exportFormat}`);
      setIsLoading(false);
    }, 1500);
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reportType">Report Type</Label>
          <select 
            id="reportType" 
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="ATTENDANCE">Attendance Report</option>
            <option value="LEAVE">Leave Report</option>
            <option value="PAYROLL">Payroll Report</option>
            <option value="EMPLOYEE">Employee Report</option>
            <option value="DEPARTMENT">Department Report</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="exportFormat">Export Format</Label>
          <select 
            id="exportFormat" 
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="CSV">CSV</option>
            <option value="EXCEL">Excel (XLSX)</option>
            <option value="PDF">PDF</option>
          </select>
        </div>
      </div>

      <Button onClick={handleExport} disabled={isLoading} className="w-full">
        <DownloadCloud className="mr-2 h-4 w-4" />
        Generate & Download
      </Button>
    </div>
  );
}

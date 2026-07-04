"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function GlobalExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      // Generate some basic CSV data for the global report
      const csvContent = "Metric,Value,Trend\nTotal Reports Generated,142,+12%\nAvg. Daily Attendance,94%,+2.1%\nMonthly Attrition Rate,1.2%,-0.4%\nTotal Payroll Exp.,$124.5k,+4.5%\n";
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "Global_Analytics_Report.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Global report exported successfully.");
      setIsExporting(false);
    }, 1200);
  };

  return (
    <Button 
      className="rounded-xl shadow-sm" 
      onClick={handleExport}
      disabled={isExporting}
    >
      <Download className={`mr-2 h-4 w-4 ${isExporting ? "animate-pulse" : ""}`} />
      {isExporting ? "Exporting..." : "Export Global Report (CSV)"}
    </Button>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DialogProps } from "@radix-ui/react-dialog";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Users,
  FileText,
  Building,
  BarChart3,
  MessageSquare,
  Loader2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = React.useState<any[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.results) {
          setResults(data.results);
        }
      } catch (error) {
        console.error("Search error", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    setQuery("");
    command();
  }, []);

  return (
    <>
      <div className="w-full flex-1 md:w-auto md:flex-none">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-9 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        >
          <span className="hidden lg:inline-flex">Search anything...</span>
          <span className="inline-flex lg:hidden">Search...</span>
          <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Type a command or search..." 
          value={query} 
          onValueChange={setQuery} 
        />
        <CommandList>
          <CommandEmpty>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              "No results found."
            )}
          </CommandEmpty>
          
          {results.length > 0 && (
            <CommandGroup heading="Search Results">
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => runCommand(() => router.push(result.href))}
                >
                  {result.type === "employee" ? (
                    <Avatar className="mr-3 h-6 w-6">
                      <AvatarImage src={result.image} />
                      <AvatarFallback className="text-[10px]">{getInitials(result.title)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Building className="mr-3 h-4 w-4 text-muted-foreground" />
                  )}
                  <div className="flex flex-col">
                    <span>{result.title}</span>
                    {result.subtitle && (
                      <span className="text-[10px] text-muted-foreground">{result.subtitle}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!query && (
            <>
              <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => runCommand(() => router.push("/employees"))}>
              <Users className="mr-2 h-4 w-4" />
              <span>Employees Directory</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/attendance"))}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Attendance & Leaves</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/payroll"))}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Payroll Runs</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/ai"))}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Ask AI Copilot</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Modules">
            <CommandItem onSelect={() => runCommand(() => router.push("/departments"))}>
              <Building className="mr-2 h-4 w-4" />
              <span>Departments</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/reports"))}>
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Analytics & Reports</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/documents"))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Documents</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => router.push("/profile"))}>
              <User className="mr-2 h-4 w-4" />
              <span>My Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>System Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

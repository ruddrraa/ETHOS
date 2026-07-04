"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Search, ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { DeleteDepartmentButton } from "@/features/departments/components/delete-department-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DepartmentListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  userRole: string;
}

export function DepartmentList({ data, userRole }: DepartmentListProps) {
  const [globalFilter, setGlobalFilter] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Department Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.description || "N/A"}</span>,
    },
    {
      id: "manager",
      header: "Manager",
      accessorFn: row => row.manager?.user?.name,
      cell: ({ row }) => {
        const manager = row.original.manager?.user;
        if (!manager) return <span className="text-muted-foreground">Unassigned</span>;
        
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={manager.image ?? undefined} />
              <AvatarFallback>{getInitials(manager.name ?? "")}</AvatarFallback>
            </Avatar>
            <span>{manager.name}</span>
          </div>
        );
      },
    },
    {
      id: "headcount",
      header: "Headcount",
      accessorFn: row => row._count?.employees,
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original._count.employees} employees</Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        return (
          <Badge variant={row.original.isActive ? "success" : "secondary"}>
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const canManage = ["SUPER_ADMIN", "HR"].includes(userRole);
        return (
          <div className="flex items-center gap-2">
            <Link href={`/departments/${row.original.id}`}>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </Link>
            {canManage && (
              <DeleteDepartmentButton departmentId={row.original.id} departmentName={row.original.name} />
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground absolute ml-3" />
          <Input
            placeholder="Search departments..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9 max-w-sm"
          />
        </div>
        {["SUPER_ADMIN", "HR"].includes(userRole) && (
          <Link href="/departments/new">
            <Button>Add Department</Button>
          </Link>
        )}
      </div>
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

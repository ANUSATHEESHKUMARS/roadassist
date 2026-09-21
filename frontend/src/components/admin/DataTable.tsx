import React from "react";
import type { ColumnDef } from "@/types/admin";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
}

export function DataTable<T>({ columns, data, isLoading = false }: DataTableProps<T>) {
  return (
    <div className="w-full overflow-hidden border border-border bg-card rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {columns.map((col) => (
                <th key={col.key} className={`py-3 px-4 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length}>
                  <LoadingState />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState />
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3 px-4 align-middle ${col.className || ""}`}
                    >
                      {col.cell(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
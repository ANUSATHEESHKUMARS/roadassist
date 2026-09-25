import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserPaginationProps {
  currentPage?: number;
  totalPages?: number;
  totalRecords?: number;
  pageSize?: number;
}

export const UserPagination: React.FC<UserPaginationProps> = ({
  currentPage = 1,
  totalPages = 5,
  totalRecords = 48,
  pageSize = 10,
}) => {
  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalRecords);
  const endItem = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-1 text-xs text-muted-foreground border-t border-border/50">
      <div className="flex items-center gap-3">
        <span>Rows per page:</span>
        <select
          defaultValue={pageSize}
          className="h-7 px-2 rounded-md border border-border bg-input text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span>
          Showing <strong className="text-foreground">{startItem}</strong>-
          <strong className="text-foreground">{endItem}</strong> of{" "}
          <strong className="text-foreground">{totalRecords}</strong> users
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={currentPage <= 1}
          className="h-8 w-8 border-border bg-card hover:bg-muted text-muted-foreground disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <button
          type="button"
          className="h-8 w-8 rounded-lg text-xs font-semibold bg-primary text-primary-foreground flex items-center justify-center shadow-xs cursor-pointer"
        >
          1
        </button>
        <button
          type="button"
          className="h-8 w-8 rounded-lg text-xs font-medium hover:bg-muted text-muted-foreground flex items-center justify-center cursor-pointer"
        >
          2
        </button>
        <button
          type="button"
          className="h-8 w-8 rounded-lg text-xs font-medium hover:bg-muted text-muted-foreground flex items-center justify-center cursor-pointer"
        >
          3
        </button>
        <span className="px-1 text-muted-foreground">...</span>
        <button
          type="button"
          className="h-8 w-8 rounded-lg text-xs font-medium hover:bg-muted text-muted-foreground flex items-center justify-center cursor-pointer"
        >
          {totalPages}
        </button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={currentPage >= totalPages}
          className="h-8 w-8 border-border bg-card hover:bg-muted text-muted-foreground disabled:opacity-30 cursor-pointer"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
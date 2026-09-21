import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 20,
  onPageChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <span>Rows per page:</span>
        <span className="font-semibold text-foreground bg-card border border-border px-2 py-0.5 rounded text-xs">
          {pageSize}
        </span>
        <span>
          Showing <strong className="text-foreground">{Math.min(totalItems, 1)} - {Math.min(pageSize, totalItems)}</strong> of{" "}
          <strong className="text-foreground">{totalItems.toLocaleString()}</strong> users
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          className="h-8 w-8 border-border bg-card hover:bg-muted text-muted-foreground disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <button
          type="button"
          className="h-8 w-8 rounded text-xs font-semibold bg-primary text-primary-foreground flex items-center justify-center shadow-sm"
        >
          {currentPage}
        </button>

        {totalPages > 1 && (
          <button
            type="button"
            onClick={() => onPageChange?.(currentPage + 1)}
            className="h-8 w-8 rounded text-xs font-medium hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors"
          >
            {currentPage + 1}
          </button>
        )}

        <Button
          variant="outline"
          size="icon"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          className="h-8 w-8 border-border bg-card hover:bg-muted text-muted-foreground disabled:opacity-30"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
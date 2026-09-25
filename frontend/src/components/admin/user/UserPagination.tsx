import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const UserPagination: React.FC<UserPaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const startItem =
    totalRecords === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const endItem = Math.min(
    currentPage * pageSize,
    totalRecords
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-1 text-xs text-muted-foreground border-t border-border/50">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        <span>Rows per page:</span>

        <select
          value={pageSize}
          onChange={(e) =>
            onPageSizeChange(Number(e.target.value))
          }
          className="h-7 px-2 rounded-md border border-border bg-input text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>

        <span>
          Showing{" "}
          <strong className="text-foreground">
            {startItem}
          </strong>
          -
          <strong className="text-foreground">
            {endItem}
          </strong>{" "}
          of{" "}
          <strong className="text-foreground">
            {totalRecords}
          </strong>{" "}
          users
        </span>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-1.5">

        {/* PREVIOUS */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 w-8 border-border bg-card hover:bg-muted text-muted-foreground disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {/* PAGE NUMBERS */}
        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        ).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`h-8 w-8 rounded-lg text-xs flex items-center justify-center cursor-pointer ${
              page === currentPage
                ? "font-semibold bg-primary text-primary-foreground shadow-xs"
                : "font-medium hover:bg-muted text-muted-foreground"
            }`}
          >
            {page}
          </button>
        ))}

        {/* NEXT */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 w-8 border-border bg-card hover:bg-muted text-muted-foreground disabled:opacity-30 cursor-pointer"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

      </div>
    </div>
  );
};
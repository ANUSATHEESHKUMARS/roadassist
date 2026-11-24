
import { Pencil, Power, Tags } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import type { MechanicCategory } from "@/types/admin/mechanicCategory.types";

interface CategoryTableProps {
    categories: MechanicCategory[];
    onEdit: (category: MechanicCategory) => void;
    onToggleStatus: (category: MechanicCategory) => void;
}

export const CategoryTable = ({
    categories,
    onEdit,
    onToggleStatus,
}: CategoryTableProps) => {

    if (categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center">
                <div className="mb-3 rounded-full bg-primary/10 p-3">
                    <Tags className="h-6 w-6 text-primary" />
                </div>

                <h3 className="font-semibold text-foreground">
                    No categories found
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                    Create your first mechanic category to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Subcategories</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {categories.map((category) => {

                        // Safely handle missing subcategories
                        const subcategories = category.subcategories ?? [];

                        const activeSubcategories = subcategories.filter(
                            (item) => item.isActive
                        );

                        const inactiveSubcategories = subcategories.filter(
                            (item) => !item.isActive
                        );

                        return (
                            <TableRow key={category.id}>

                                {/* Category */}
                                <TableCell>
                                    <div className="min-w-[150px]">
                                        <p className="font-medium text-foreground">
                                            {category.name}
                                        </p>

                                        {category.description && (
                                            <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
                                                {category.description}
                                            </p>
                                        )}
                                    </div>
                                </TableCell>

                                {/* Slug */}
                                <TableCell>
                                    <span className="text-sm text-muted-foreground">
                                        {category.slug}
                                    </span>
                                </TableCell>

                                {/* Subcategories */}
                                <TableCell>
                                    <div className="min-w-[180px] space-y-2">

                                        <div className="flex flex-wrap gap-1">
                                            {activeSubcategories.length > 0 ? (
                                                activeSubcategories.map((item) => (
                                                    <span
                                                        key={item.id ?? item.slug}
                                                        className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                                                    >
                                                        {item.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    No active subcategories
                                                </span>
                                            )}
                                        </div>

                                        {inactiveSubcategories.length > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                {inactiveSubcategories.length} inactive
                                            </p>
                                        )}

                                        <p className="text-xs text-muted-foreground">
                                            {subcategories.length} total
                                        </p>

                                    </div>
                                </TableCell>

                                {/* Category status */}
                                <TableCell>
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                            category.isActive
                                                ? "bg-green-500/10 text-green-500"
                                                : "bg-muted text-muted-foreground"
                                        }`}
                                    >
                                        {category.isActive ? "Active" : "Inactive"}
                                    </span>
                                </TableCell>

                                {/* Actions */}
                                <TableCell>
                                    <div className="flex justify-end gap-2">

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => onEdit(category)}
                                            aria-label={`Edit ${category.name}`}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => onToggleStatus(category)}
                                            aria-label={`${
                                                category.isActive
                                                    ? "Deactivate"
                                                    : "Activate"
                                            } ${category.name}`}
                                        >
                                            <Power
                                                className={`h-4 w-4 ${
                                                    category.isActive
                                                        ? "text-green-500"
                                                        : "text-muted-foreground"
                                                }`}
                                            />
                                        </Button>

                                    </div>
                                </TableCell>

                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

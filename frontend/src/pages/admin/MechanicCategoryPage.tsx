
import { useState } from "react";
import { Plus, RefreshCw, Tags } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Use your custom Toast Context import.
// Adjust this path if your ToastProvider file is elsewhere.
import { useToast } from "@/components/ui/toast/ToastProvider";
import { CategoryTable } from "@/components/admin/mechanic-category/CategoryTable";
import { CategoryFormDialog } from "@/components/admin/mechanic-category/CategoryFormDialog";
import { CategoryStatusDialog } from "@/components/admin/mechanic-category/CategoryStatusDialog";

import { useMechanicCategories } from "@/hooks/useMechanicCategories";
import type { MechanicCategory, MechanicSubcategory } from "@/types/admin/mechanicCategory.types";

const MechanicCategoryPage = () => {
    const { showToast } = useToast();

    const {
        categories,
        loading,
        error,
        fetchCategories,
        createCategory,
        updateCategory,
        updateCategoryStatus,
    } = useMechanicCategories();

    const [formOpen, setFormOpen] = useState(false);

    const [editingCategory, setEditingCategory] =
        useState<MechanicCategory | null>(null);

    const [statusCategory, setStatusCategory] =
        useState<MechanicCategory | null>(null);

    const [includeInactive, setIncludeInactive] = useState(true);

    // Open create dialog
    const handleCreate = () => {
        setEditingCategory(null);
        setFormOpen(true);
    };

    // Open edit dialog
    const handleEdit = (category: MechanicCategory) => {
        setEditingCategory(category);
        setFormOpen(true);
    };

    // Create category
    const handleCreateCategory = async (
        data: Parameters<typeof createCategory>[0]
    ) => {
        try {
            await createCategory(data);

            showToast(
                "Mechanic category created successfully.",
                "success"
            );
        } catch (error) {
            showToast(
                error instanceof Error
                    ? error.message
                    : "Unable to create category.",
                "error"
            );

            throw error;
        }
    };

    // Update category
    const handleUpdateCategory = async (
        id: string,
        data: Parameters<typeof updateCategory>[1]
    ) => {
        try {
            await updateCategory(id, data);

            showToast(
                "Mechanic category updated successfully.",
                "success"
            );
        } catch (error) {
            showToast(
                error instanceof Error
                    ? error.message
                    : "Unable to update category.",
                "error"
            );

            throw error;
        }
    };

    // Activate / deactivate category
    const handleStatusChange = async (
        id: string,
        isActive: boolean
    ) => {
        try {
            await updateCategoryStatus(id, {isActive});

            showToast(
                `Category ${isActive ? "activated" : "deactivated"} successfully.`,
                "success"
            );

            setStatusCategory(null);
        } catch (error) {
            showToast(
                error instanceof Error
                    ? error.message
                    : "Unable to update category status.",
                "error"
            );

            throw error;
        }
    };

    // Show inactive categories
    const handleInactiveToggle = async (checked: boolean) => {
        setIncludeInactive(checked);

        try {
            await fetchCategories(checked);
        } catch {
            showToast(
                "Unable to load categories.",
                "error"
            );
        }
    };

    // Refresh categories
    const handleRefresh = async () => {
        try {
            await fetchCategories(includeInactive);
            showToast("Categories refreshed successfully.", "success");
        } catch {
            showToast("Unable to refresh categories.", "error");
        }
    };

    return (
        <div className="space-y-6">

            {/* Page heading */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <Tags className="h-6 w-6 text-primary" />

                        <h1 className="text-2xl font-bold text-foreground">
                            Mechanic Categories
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage mechanic service categories and specializations.
                    </p>
                </div>

                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                <div className="rounded-lg border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground">
                        Total Categories
                    </p>

                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {categories.length}
                    </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground">
                        Active Categories
                    </p>

                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {categories.filter((item) => item.isActive).length}
                    </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground">
                        Active Subcategories
                    </p>

                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {categories.reduce(
                            (total: number, category: MechanicCategory) =>
                                total +
                                category.subcategories.filter(
                                    (item: MechanicSubcategory) => item.isActive
                                ).length,
                            0
                        )}
                    </p>
                </div>

            </div>

            {/* Table heading and controls */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                <div>
                    <h2 className="font-semibold text-foreground">
                        All Categories
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        View and manage your mechanic categories.
                    </p>
                </div>

                <div className="flex items-center gap-3">

                    <div className="flex items-center gap-2">
                        <Switch
                            id="include-inactive"
                            checked={includeInactive}
                            onCheckedChange={handleInactiveToggle}
                        />

                        <Label htmlFor="include-inactive">
                            Show inactive
                        </Label>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={loading}
                        aria-label="Refresh categories"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${loading ? "animate-spin" : ""
                                }`}
                        />
                    </Button>

                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                    Loading mechanic categories...
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
                    <p className="font-medium text-destructive">
                        Failed to load categories
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {error}
                    </p>

                    <Button
                        variant="outline"
                        className="mt-3"
                        onClick={handleRefresh}
                    >
                        Try Again
                    </Button>
                </div>
            )}

            {/* Category table */}
            {!loading && !error && (
                <CategoryTable
                    categories={categories}
                    onEdit={handleEdit}
                    onToggleStatus={setStatusCategory}
                />
            )}

            {/* Create / Edit dialog */}
            <CategoryFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                category={editingCategory}
                onCreate={handleCreateCategory}
                onUpdate={handleUpdateCategory}
            />

            {/* Activate / Deactivate dialog */}
            <CategoryStatusDialog
                open={Boolean(statusCategory)}
                onOpenChange={(open) => {
                    if (!open) {
                        setStatusCategory(null);
                    }
                }}
                category={statusCategory}
                onConfirm={handleStatusChange}
            />

        </div>
    );
};

export default MechanicCategoryPage;

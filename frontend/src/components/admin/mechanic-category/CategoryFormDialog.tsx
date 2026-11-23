
import { useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { SubcategoryFields } from "./SubcategoryFields";

import type {
    MechanicCategory,
    MechanicSubcategory,
    CreateMechanicCategoryDto,
    UpdateMechanicCategoryDto,
} from "@/types/admin/mechanicCategory.types";

interface CategoryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: MechanicCategory | null;
    onCreate: (data: CreateMechanicCategoryDto) => Promise<void>;
    onUpdate: (
        id: string,
        data: UpdateMechanicCategoryDto
    ) => Promise<void>;
}

const createSlug = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

export const CategoryFormDialog = ({
    open,
    onOpenChange,
    category,
    onCreate,
    onUpdate,
}: CategoryFormDialogProps) => {

    const isEditing = Boolean(category);

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");

    const [subcategories, setSubcategories] =
        useState<MechanicSubcategory[]>([]);

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;

        if (category) {
            setName(category.name);
            setSlug(category.slug);
            setDescription(category.description ?? "");

            setSubcategories(
                category.subcategories.map((item) => ({ ...item }))
            );
        } else {
            setName("");
            setSlug("");
            setDescription("");
            setSubcategories([]);
        }
    }, [category, open]);

    const handleNameChange = (value: string) => {
        setName(value);

        if (!isEditing) {
            setSlug(createSlug(value));
        }
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!name.trim() || !slug.trim()) return;

        const hasInvalidSubcategory = subcategories.some(
            (item) => !item.name.trim() || !item.slug.trim()
        );

        if (hasInvalidSubcategory) {
            return;
        }

        const normalizedSubcategories = subcategories.map((item) => ({
            ...(item.id ? { id: item.id } : {}),
            name: item.name.trim(),
            slug: item.slug.trim().toLowerCase(),

            ...(item.description?.trim()
                ? { description: item.description.trim() }
                : {}),

            ...(item.id ? { isActive: item.isActive } : {}),
        }));

        try {
            setSubmitting(true);

            if (category) {
                const payload: UpdateMechanicCategoryDto = {
                    name: name.trim(),
                    slug: slug.trim().toLowerCase(),
                    description: description.trim() || null,
                    subcategories: normalizedSubcategories,
                };

                await onUpdate(category.id, payload);

            } else {
                const payload: CreateMechanicCategoryDto = {
                    name: name.trim(),
                    slug: slug.trim().toLowerCase(),

                    ...(description.trim()
                        ? { description: description.trim() }
                        : {}),

                    subcategories: normalizedSubcategories.map((item) => ({
                        name: item.name,
                        slug: item.slug,

                        ...(item.description
                            ? { description: item.description }
                            : {}),
                    })),
                };

                await onCreate(payload);
            }

            onOpenChange(false);

        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">

                <DialogHeader>
                    <DialogTitle>
                        {isEditing
                            ? "Edit Mechanic Category"
                            : "Create Mechanic Category"}
                    </DialogTitle>

                    <DialogDescription>
                        Configure the category and its mechanic specializations.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">

                    <fieldset disabled={submitting} className="space-y-6">

                        <div className="space-y-2">
                            <Label>Category Name</Label>

                            <Input
                                value={name}
                                onChange={(e) =>
                                    handleNameChange(e.target.value)
                                }
                                placeholder="e.g. Engine / Mechanical"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Slug</Label>

                            <Input
                                value={slug}
                                onChange={(e) =>
                                    setSlug(createSlug(e.target.value))
                                }
                                placeholder="e.g. engine-mechanical"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>

                            <textarea
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                                placeholder="Enter category description"
                                rows={3}
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <SubcategoryFields
                            subcategories={subcategories}
                            onChange={setSubcategories}
                        />

                    </fieldset>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>

                        <Button type="submit" disabled={submitting}>
                            {submitting
                                ? "Saving..."
                                : isEditing
                                    ? "Save Changes"
                                    : "Create Category"}
                        </Button>
                    </DialogFooter>

                </form>
            </DialogContent>
        </Dialog>
    );
};

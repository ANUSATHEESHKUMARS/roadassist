
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MechanicSubcategory } from "@/types/admin/mechanicCategory.types";

interface SubcategoryFieldsProps {
  subcategories: MechanicSubcategory[];
  onChange: (subcategories: MechanicSubcategory[]) => void;
}

export const SubcategoryFields = ({
  subcategories,
  onChange,
}: SubcategoryFieldsProps) => {
  const addSubcategory = () => {
    onChange([
      ...subcategories,
      {
        name: "",
        slug: "",
        description: "",
        isActive: true,
      },
    ]);
  };

  const updateSubcategory = (
    index: number,
    field: keyof MechanicSubcategory,
    value: string | boolean
  ) => {
    const updated = [...subcategories];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    onChange(updated);
  };

  const removeSubcategory = (index: number) => {
    const updated = [...subcategories];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">
            Subcategories
          </h3>
          <p className="text-sm text-muted-foreground">
            Add the specializations under this category.
          </p>
        </div>

        <Button type="button" variant="outline" onClick={addSubcategory}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subcategory
        </Button>
      </div>

      {subcategories.map((subcategory, index) => (
        <div
          key={subcategory.id ?? `new-${index}`}
          className="space-y-3 rounded-lg border border-border bg-background p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              Subcategory {index + 1}
            </p>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeSubcategory(index)}
              aria-label={`Remove subcategory ${index + 1}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={subcategory.name}
                placeholder="e.g. Engine Repair"
                onChange={(e) =>
                  updateSubcategory(index, "name", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={subcategory.slug}
                placeholder="e.g. engine-repair"
                onChange={(e) =>
                  updateSubcategory(index, "slug", e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
              value={subcategory.description ?? ""}
              onChange={(e) =>
                updateSubcategory(index, "description", e.target.value)
              }
              placeholder="Describe this specialization"
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {subcategory.id && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={subcategory.isActive}
                onChange={(e) =>
                  updateSubcategory(index, "isActive", e.target.checked)
                }
              />
              Active
            </label>
          )}
        </div>
      ))}

      {subcategories.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No subcategories added yet.
        </p>
      )}
    </div>
  );
};

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Category, TransactionType } from "@/types/database.types";
import { deleteCustomCategory } from "@/app/transactions/actions";
import { CreateCategoryDialog, AVAILABLE_CATEGORY_ICONS } from "@/components/transactions/create-category-dialog";
import {
  FolderPlus,
  Trash2,
  Lock,
  Plus,
  Utensils,
  Coffee,
  Pizza,
  ShoppingBag,
  Shirt,
  Home,
  Wifi,
  Bus,
  Car,
  Fuel,
  Dumbbell,
  GraduationCap,
  Book,
  Laptop,
  Gamepad,
  Film,
  HeartPulse,
  Gift,
  Briefcase,
  Sparkles,
  MoreHorizontal,
  Receipt,
  HeartHandshake,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Coffee,
  Pizza,
  ShoppingBag,
  Shirt,
  Home,
  Wifi,
  Bus,
  Car,
  Fuel,
  Dumbbell,
  GraduationCap,
  Book,
  Laptop,
  Gamepad,
  Film,
  HeartPulse,
  Gift,
  Briefcase,
  Sparkles,
  MoreHorizontal,
  Receipt,
  HeartHandshake,
};

interface CategoryManagerProps {
  initialCategories: Category[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<TransactionType>("expense");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  const handleDelete = (category: Category) => {
    if (category.user_id === null) return;
    if (!confirm(`Are you sure you want to delete the category "${category.name}"?`)) return;

    setError(null);
    setDeletingId(category.id);

    startTransition(async () => {
      const result = await deleteCustomCategory(category.id);
      setDeletingId(null);

      if (result.error) {
        setError(result.error);
      } else {
        setCategories((prev) => prev.filter((c) => c.id !== category.id));
        router.refresh();
      }
    });
  };

  const handleCreated = (newCat: Category) => {
    setCategories((prev) => [...prev, newCat]);
    setActiveTab(newCat.type);
    router.refresh();
  };

  return (
    <Card variant="flat" className="p-6 bg-surface border-border shadow-card space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-apptext">Custom Categories</h3>
          </div>
          <p className="text-xs text-apptext-muted">
            Personalize your spending tags with custom names and icons.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="font-bold text-xs shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Category
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-status-dangerLight border border-status-danger/20 text-xs font-semibold text-status-danger">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("expense")}
          className={`pb-2.5 transition-colors relative ${
            activeTab === "expense"
              ? "text-primary border-b-2 border-primary"
              : "text-apptext-muted hover:text-apptext"
          }`}
        >
          Expense Categories ({categories.filter((c) => c.type === "expense").length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("income")}
          className={`pb-2.5 transition-colors relative ${
            activeTab === "income"
              ? "text-primary border-b-2 border-primary"
              : "text-apptext-muted hover:text-apptext"
          }`}
        >
          Income Categories ({categories.filter((c) => c.type === "income").length})
        </button>
      </div>

      {/* Category List */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filteredCategories.map((cat) => {
          const IconComp = cat.icon ? ICON_MAP[cat.icon] || MoreHorizontal : MoreHorizontal;
          const isCustom = cat.user_id !== null;
          const isDeleting = deletingId === cat.id;

          return (
            <div
              key={cat.id}
              className="p-3 rounded-xl border border-border bg-background/60 flex items-center justify-between gap-2.5 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white"
                  style={{ backgroundColor: cat.color || "#145C43" }}
                >
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-apptext truncate">{cat.name}</div>
                  <div className="text-[10px] text-apptext-muted">
                    {isCustom ? (
                      <span className="text-primary font-semibold">Custom</span>
                    ) : (
                      <span>System Default</span>
                    )}
                  </div>
                </div>
              </div>

              {isCustom ? (
                <button
                  type="button"
                  onClick={() => handleDelete(cat)}
                  disabled={isPending || isDeleting}
                  className="p-1.5 rounded-lg text-apptext-muted hover:text-status-danger hover:bg-status-dangerLight transition-colors"
                  title={`Delete ${cat.name}`}
                  aria-label={`Delete ${cat.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span title="System default category cannot be deleted" className="p-1.5 text-apptext-muted/40">
                  <Lock className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          );
        })}
      </div>

      <CreateCategoryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        defaultType={activeTab}
        onCategoryCreated={handleCreated}
      />
    </Card>
  );
}

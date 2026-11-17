"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Category, TransactionType } from "@/types/database.types";
import { createCustomCategory } from "@/app/transactions/actions";
import {
  X,
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
} from "lucide-react";

export const AVAILABLE_CATEGORY_ICONS: { name: string; icon: React.ElementType }[] = [
  { name: "Utensils", icon: Utensils },
  { name: "Coffee", icon: Coffee },
  { name: "Pizza", icon: Pizza },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Shirt", icon: Shirt },
  { name: "Home", icon: Home },
  { name: "Wifi", icon: Wifi },
  { name: "Bus", icon: Bus },
  { name: "Car", icon: Car },
  { name: "Fuel", icon: Fuel },
  { name: "Dumbbell", icon: Dumbbell },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Book", icon: Book },
  { name: "Laptop", icon: Laptop },
  { name: "Gamepad", icon: Gamepad },
  { name: "Film", icon: Film },
  { name: "HeartPulse", icon: HeartPulse },
  { name: "Gift", icon: Gift },
  { name: "Briefcase", icon: Briefcase },
  { name: "Sparkles", icon: Sparkles },
  { name: "MoreHorizontal", icon: MoreHorizontal },
];

export const CATEGORY_COLORS = [
  "#145C43", // Primary Forest Green
  "#0284c7", // Sky Blue
  "#d97706", // Amber
  "#dc2626", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#10b981", // Emerald
  "#64748b", // Slate
];

interface CreateCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  onCategoryCreated?: (category: Category) => void;
}

export function CreateCategoryDialog({
  isOpen,
  onClose,
  defaultType = "expense",
  onCategoryCreated,
}: CreateCategoryDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>(defaultType);
  const [selectedIcon, setSelectedIcon] = useState("Coffee");
  const [selectedColor, setSelectedColor] = useState("#145C43");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter a category name.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("type", type);
      formData.set("icon", selectedIcon);
      formData.set("color", selectedColor);

      const result = await createCustomCategory(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success && result.category) {
        setName("");
        onCategoryCreated?.(result.category);
        onClose();
      }
    });
  };

  const SelectedIconComp =
    AVAILABLE_CATEGORY_ICONS.find((i) => i.name === selectedIcon)?.icon || MoreHorizontal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <Card variant="flat" className="max-w-md w-full bg-surface border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-background/50">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: selectedColor }}
            >
              <SelectedIconComp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-apptext">Create New Category</h2>
              <p className="text-[11px] text-apptext-muted">Personalize your student spending tracker</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-apptext-muted hover:text-apptext hover:bg-border/50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-status-dangerLight border border-status-danger/20 text-xs font-semibold text-status-danger">
              {error}
            </div>
          )}

          {/* Type Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-apptext uppercase tracking-wider">
              Category Type
            </label>
            <div className="grid grid-cols-2 p-1 rounded-lg bg-background border border-border">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                  type === "expense"
                    ? "bg-surface text-apptext shadow-xs border border-border"
                    : "text-apptext-muted hover:text-apptext"
                }`}
              >
                Expense (Spending)
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                  type === "income"
                    ? "bg-primary text-white shadow-xs"
                    : "text-apptext-muted hover:text-apptext"
                }`}
              >
                Income (Money In)
              </button>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-1.5">
            <label htmlFor="cat-name" className="text-xs font-bold text-apptext uppercase tracking-wider">
              Category Name
            </label>
            <Input
              id="cat-name"
              placeholder="e.g. Gym, Hostel Rent, Chai, Freelance..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              required
              autoFocus
            />
          </div>

          {/* Icon Picker Grid */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-apptext uppercase tracking-wider">
              Select Icon
            </label>
            <div className="grid grid-cols-7 gap-1.5 p-2 rounded-xl bg-background border border-border max-h-36 overflow-y-auto">
              {AVAILABLE_CATEGORY_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedIcon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedIcon(item.name)}
                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-primary text-white shadow-xs scale-105"
                        : "text-apptext hover:bg-surface hover:text-primary"
                    }`}
                    title={item.name}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Palette */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-apptext uppercase tracking-wider">
              Badge Color
            </label>
            <div className="flex items-center gap-2">
              {CATEGORY_COLORS.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      isSelected ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"
                    }`}
                    aria-label={`Select color ${color}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              disabled={isPending || !name.trim()}
              className="flex-1 font-bold shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {isPending ? "Creating..." : "Save Category"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

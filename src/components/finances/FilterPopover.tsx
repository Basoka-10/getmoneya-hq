import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export type PeriodFilter = "all" | "today" | "week" | "month" | "year";
export type TypeFilter = "all" | "income" | "expense" | "savings";

export interface FilterState {
  period: PeriodFilter;
  type: TypeFilter;
  category: string;
}

interface FilterPopoverProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: string[];
}

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  all: "Toutes les périodes",
  today: "Aujourd'hui",
  week: "Cette semaine",
  month: "Ce mois",
  year: "Cette année",
};

const TYPE_LABELS: Record<TypeFilter, string> = {
  all: "Tous les types",
  income: "Revenus",
  expense: "Dépenses",
  savings: "Épargne",
};

export function FilterPopover({ filters, onFiltersChange, categories }: FilterPopoverProps) {
  const [open, setOpen] = useState(false);

  const activeFiltersCount = [
    filters.period !== "all",
    filters.type !== "all",
    filters.category !== "all",
  ].filter(Boolean).length;

  const resetFilters = () => {
    onFiltersChange({
      period: "all",
      type: "all",
      category: "all",
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filtrer
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtres</h4>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 px-2 text-xs"
              >
                <X className="mr-1 h-3 w-3" />
                Réinitialiser
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Période</Label>
            <Select
              value={filters.period}
              onValueChange={(value: PeriodFilter) =>
                onFiltersChange({ ...filters, period: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PERIOD_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={filters.type}
              onValueChange={(value: TypeFilter) =>
                onFiltersChange({ ...filters, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select
              value={filters.category}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

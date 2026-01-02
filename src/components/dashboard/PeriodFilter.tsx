import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type PeriodType = "all" | "this-month" | "last-month" | "this-year" | "custom";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface PeriodFilterProps {
  period: PeriodType;
  dateRange: DateRange;
  onPeriodChange: (period: PeriodType) => void;
  onDateRangeChange: (range: DateRange) => void;
}

export function PeriodFilter({
  period,
  dateRange,
  onPeriodChange,
  onDateRangeChange,
}: PeriodFilterProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handlePeriodChange = (newPeriod: PeriodType) => {
    onPeriodChange(newPeriod);
    
    const now = new Date();
    
    switch (newPeriod) {
      case "this-month":
        onDateRangeChange({
          from: startOfMonth(now),
          to: endOfMonth(now),
        });
        break;
      case "last-month":
        const lastMonth = subMonths(now, 1);
        onDateRangeChange({
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        });
        break;
      case "this-year":
        onDateRangeChange({
          from: startOfYear(now),
          to: endOfYear(now),
        });
        break;
      case "all":
        onDateRangeChange({ from: undefined, to: undefined });
        break;
      case "custom":
        // Keep current range or set default
        if (!dateRange.from) {
          onDateRangeChange({
            from: startOfMonth(now),
            to: now,
          });
        }
        break;
    }
  };

  const formatDateRange = () => {
    if (!dateRange.from) return "Sélectionner les dates";
    if (!dateRange.to) return format(dateRange.from, "d MMM yyyy", { locale: fr });
    return `${format(dateRange.from, "d MMM", { locale: fr })} - ${format(dateRange.to, "d MMM yyyy", { locale: fr })}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={period} onValueChange={(val) => handlePeriodChange(val as PeriodType)}>
        <SelectTrigger className="w-[160px] h-9">
          <SelectValue placeholder="Période" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tout</SelectItem>
          <SelectItem value="this-month">Ce mois</SelectItem>
          <SelectItem value="last-month">Mois dernier</SelectItem>
          <SelectItem value="this-year">Cette année</SelectItem>
          <SelectItem value="custom">Personnalisé</SelectItem>
        </SelectContent>
      </Select>

      {period === "custom" && (
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => {
                onDateRangeChange({
                  from: range?.from,
                  to: range?.to,
                });
                if (range?.from && range?.to) {
                  setIsCalendarOpen(false);
                }
              }}
              numberOfMonths={2}
              locale={fr}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      )}

      {period !== "all" && period !== "custom" && dateRange.from && (
        <span className="text-sm text-muted-foreground">
          {formatDateRange()}
        </span>
      )}
    </div>
  );
}


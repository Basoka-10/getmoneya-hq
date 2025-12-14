import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { fr } from "date-fns/locale";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useTasks } from "@/hooks/useTasks";
import { CalendarEventModal } from "@/components/modals/CalendarEventModal";

type ViewMode = "day" | "week" | "month";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Calculate date range for current view
  const dateRange = useMemo(() => {
    if (viewMode === "month") {
      const start = startOfWeek(startOfMonth(currentDate), { locale: fr });
      const end = endOfWeek(endOfMonth(currentDate), { locale: fr });
      return { start, end };
    } else if (viewMode === "week") {
      const start = startOfWeek(currentDate, { locale: fr });
      const end = endOfWeek(currentDate, { locale: fr });
      return { start, end };
    } else {
      return { start: currentDate, end: currentDate };
    }
  }, [currentDate, viewMode]);

  const { data: events = [] } = useCalendarEvents(
    format(dateRange.start, "yyyy-MM-dd"),
    format(dateRange.end, "yyyy-MM-dd")
  );

  const { data: tasks = [] } = useTasks();

  // Helper to safely parse date
  const safeParseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  // Combine events and tasks with due dates
  const allEvents = useMemo(() => {
    const taskEvents = tasks
      .filter((t) => t.due_date && safeParseDate(t.due_date))
      .map((t) => ({
        id: `task-${t.id}`,
        title: t.title,
        start_date: `${t.due_date}T${t.due_time || "09:00"}:00`,
        end_date: `${t.due_date}T${t.due_time || "10:00"}:00`,
        color: t.completed ? "muted" : t.priority === "high" ? "destructive" : "primary",
        isTask: true,
        completed: t.completed,
      }));

    const calEvents = events
      .filter((e) => safeParseDate(e.start_date) && safeParseDate(e.end_date))
      .map((e) => ({
        id: e.id,
        title: e.title,
        start_date: e.start_date,
        end_date: e.end_date,
        color: e.color || "primary",
        isTask: false,
        completed: false,
      }));

    return [...calEvents, ...taskEvents];
  }, [events, tasks]);

  // Generate calendar days for month view
  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    let day = dateRange.start;
    
    while (day <= dateRange.end) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    return days;
  }, [dateRange]);

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return allEvents.filter((e) => e.start_date.startsWith(dateStr));
  };

  // Navigation
  const goToNext = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const goToPrev = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowEventModal(true);
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case "success":
        return "bg-success text-success-foreground";
      case "warning":
        return "bg-warning text-warning-foreground";
      case "destructive":
        return "bg-destructive text-destructive-foreground";
      case "muted":
        return "bg-muted text-muted-foreground line-through";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Calendrier</h1>
            <p className="mt-1 text-muted-foreground">
              Gérez vos rendez-vous et événements.
            </p>
          </div>
          <Button size="sm" onClick={() => { setSelectedDate(new Date()); setShowEventModal(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel événement
          </Button>
        </div>

        {/* Calendar Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={goToToday}>
              Aujourd'hui
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="ml-4 text-lg font-semibold text-foreground capitalize">
              {viewMode === "month" && format(currentDate, "MMMM yyyy", { locale: fr })}
              {viewMode === "week" && `Semaine du ${format(dateRange.start, "d MMMM", { locale: fr })}`}
              {viewMode === "day" && format(currentDate, "EEEE d MMMM yyyy", { locale: fr })}
            </h2>
          </div>

          <div className="flex rounded-lg border border-border bg-muted/50 p-1">
            {(["day", "week", "month"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  viewMode === mode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {mode === "day" ? "Jour" : mode === "week" ? "Semaine" : "Mois"}
              </button>
            ))}
          </div>
        </div>

        {/* Month View */}
        {viewMode === "month" && (
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/50">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                <div
                  key={day}
                  className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={index}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "min-h-[100px] border-b border-r border-border p-2 cursor-pointer transition-colors hover:bg-muted/30",
                      !isCurrentMonth && "bg-muted/20"
                    )}
                  >
                    <div
                      className={cn(
                        "mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                        isCurrentDay && "bg-primary text-primary-foreground",
                        !isCurrentDay && !isCurrentMonth && "text-muted-foreground",
                        !isCurrentDay && isCurrentMonth && "text-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "truncate rounded px-1.5 py-0.5 text-xs font-medium",
                            getColorClass(event.color)
                          )}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 3} autres
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week View */}
        {viewMode === "week" && (
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="grid grid-cols-7 divide-x divide-border">
              {Array.from({ length: 7 }).map((_, i) => {
                const day = addDays(dateRange.start, i);
                const dayEvents = getEventsForDay(day);
                const isCurrentDay = isToday(day);

                return (
                  <div key={i} className="min-h-[400px]">
                    <div
                      className={cn(
                        "border-b border-border p-3 text-center",
                        isCurrentDay && "bg-primary/10"
                      )}
                    >
                      <div className="text-xs text-muted-foreground uppercase">
                        {format(day, "EEE", { locale: fr })}
                      </div>
                      <div
                        className={cn(
                          "mt-1 text-lg font-semibold",
                          isCurrentDay ? "text-primary" : "text-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </div>
                    </div>
                    <div
                      className="p-2 space-y-1 cursor-pointer hover:bg-muted/30 min-h-[350px]"
                      onClick={() => handleDayClick(day)}
                    >
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "rounded px-2 py-1 text-xs font-medium",
                            getColorClass(event.color)
                          )}
                        >
                          <div className="truncate">{event.title}</div>
                          <div className="text-[10px] opacity-80">
                            {safeParseDate(event.start_date) ? format(safeParseDate(event.start_date)!, "HH:mm") : "--:--"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Day View */}
        {viewMode === "day" && (
          <div className="rounded-xl border border-border bg-card shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground capitalize">
                {format(currentDate, "EEEE d MMMM", { locale: fr })}
              </h3>
              <Button variant="outline" size="sm" onClick={() => handleDayClick(currentDate)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </div>

            {getEventsForDay(currentDate).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Aucun événement prévu</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => handleDayClick(currentDate)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un événement
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {getEventsForDay(currentDate).map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
                    )}
                  >
                    <div
                      className={cn(
                        "h-3 w-3 rounded-full flex-shrink-0",
                        event.color === "success" && "bg-success",
                        event.color === "warning" && "bg-warning",
                        event.color === "destructive" && "bg-destructive",
                        event.color === "muted" && "bg-muted-foreground",
                        (!event.color || event.color === "primary") && "bg-primary"
                      )}
                    />
                    <div className="flex-1">
                      <p className={cn("font-medium text-foreground", event.completed && "line-through text-muted-foreground")}>
                        {event.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {safeParseDate(event.start_date) ? format(safeParseDate(event.start_date)!, "HH:mm") : "--:--"} - {safeParseDate(event.end_date) ? format(safeParseDate(event.end_date)!, "HH:mm") : "--:--"}
                      </p>
                    </div>
                    {event.isTask && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Tâche
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <CalendarEventModal
        open={showEventModal}
        onOpenChange={setShowEventModal}
        defaultDate={selectedDate || new Date()}
      />
    </AppLayout>
  );
};

export default Calendar;

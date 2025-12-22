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
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type ViewMode = "day" | "week" | "month";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDayDrawer, setShowDayDrawer] = useState(false);
  const isMobile = useIsMobile();

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
    if (isMobile) {
      setShowDayDrawer(true);
    } else {
      setShowEventModal(true);
    }
  };

  const handleCreateEvent = () => {
    setShowDayDrawer(false);
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

  const getColorDot = (color: string) => {
    switch (color) {
      case "success":
        return "bg-success";
      case "warning":
        return "bg-warning";
      case "destructive":
        return "bg-destructive";
      case "muted":
        return "bg-muted-foreground";
      default:
        return "bg-primary";
    }
  };

  // Day events drawer content for mobile
  const DayEventsContent = ({ date }: { date: Date }) => {
    const dayEvents = getEventsForDay(date);
    
    return (
      <div className="px-4 pb-6 space-y-3">
        {dayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">Aucun événement</p>
          </div>
        ) : (
          dayEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 rounded-lg border border-border p-3 bg-card"
            >
              <div className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", getColorDot(event.color))} />
              <div className="flex-1 min-w-0">
                <p className={cn("font-medium text-sm text-foreground truncate", event.completed && "line-through text-muted-foreground")}>
                  {event.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {safeParseDate(event.start_date) ? format(safeParseDate(event.start_date)!, "HH:mm") : "--:--"}
                </p>
              </div>
              {event.isTask && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground flex-shrink-0">
                  Tâche
                </span>
              )}
            </div>
          ))
        )}
        <Button className="w-full mt-4" onClick={handleCreateEvent}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel événement
        </Button>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground truncate">Calendrier</h1>
            <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground hidden sm:block">
              Gérez vos rendez-vous et événements.
            </p>
          </div>
          <Button size="sm" onClick={() => { setSelectedDate(new Date()); setShowEventModal(true); }} className="flex-shrink-0">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nouvel événement</span>
          </Button>
        </div>

        {/* Calendar Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={goToPrev} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={goToToday} size="sm" className="text-xs px-2 h-8">
                Aujourd'hui
              </Button>
              <Button variant="outline" size="icon" onClick={goToNext} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex rounded-lg border border-border bg-muted/50 p-0.5">
              {(["day", "week", "month"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors",
                    viewMode === mode
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mode === "day" ? "J" : mode === "week" ? "S" : "M"}
                  <span className="hidden sm:inline">
                    {mode === "day" ? "our" : mode === "week" ? "em." : "ois"}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <h2 className="text-sm sm:text-lg font-semibold text-foreground capitalize text-center">
            {viewMode === "month" && format(currentDate, "MMMM yyyy", { locale: fr })}
            {viewMode === "week" && `Semaine du ${format(dateRange.start, "d MMM", { locale: fr })}`}
            {viewMode === "day" && format(currentDate, "EEE d MMMM", { locale: fr })}
          </h2>
        </div>

        {/* Month View */}
        {viewMode === "month" && (
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/50">
              {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
                <div
                  key={i}
                  className="py-2 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  <span className="sm:hidden">{day}</span>
                  <span className="hidden sm:inline">{["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][i]}</span>
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);
                const hasEvents = dayEvents.length > 0;

                return (
                  <div
                    key={index}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "min-h-[48px] sm:min-h-[100px] border-b border-r border-border p-0.5 sm:p-2 cursor-pointer transition-colors active:bg-muted/50 hover:bg-muted/30",
                      !isCurrentMonth && "bg-muted/20"
                    )}
                  >
                    <div className="flex flex-col items-center sm:items-start h-full">
                      <div
                        className={cn(
                          "flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs sm:text-sm font-medium",
                          isCurrentDay && "bg-primary text-primary-foreground",
                          !isCurrentDay && !isCurrentMonth && "text-muted-foreground",
                          !isCurrentDay && isCurrentMonth && "text-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </div>
                      
                      {/* Mobile: dots indicator */}
                      {isMobile && hasEvents && (
                        <div className="flex gap-0.5 mt-0.5 justify-center">
                          {dayEvents.slice(0, 3).map((event, idx) => (
                            <div
                              key={idx}
                              className={cn("h-1.5 w-1.5 rounded-full", getColorDot(event.color))}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Desktop: event pills */}
                      {!isMobile && (
                        <div className="space-y-0.5 sm:space-y-1 w-full mt-1">
                          {dayEvents.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              className={cn(
                                "truncate rounded px-1 py-0.5 text-[9px] sm:text-xs font-medium",
                                getColorClass(event.color)
                              )}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-[9px] sm:text-xs text-muted-foreground">
                              +{dayEvents.length - 3}
                            </div>
                          )}
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
            <div className={cn("grid grid-cols-7 divide-x divide-border", isMobile && "")}>
              {Array.from({ length: 7 }).map((_, i) => {
                const day = addDays(dateRange.start, i);
                const dayEvents = getEventsForDay(day);
                const isCurrentDay = isToday(day);

                return (
                  <div 
                    key={i} 
                    className={cn("min-h-[180px] sm:min-h-[400px]", isMobile && "min-h-[140px]")}
                    onClick={() => isMobile && handleDayClick(day)}
                  >
                    <div
                      className={cn(
                        "border-b border-border p-1.5 sm:p-3 text-center",
                        isCurrentDay && "bg-primary/10"
                      )}
                    >
                      <div className="text-[9px] sm:text-xs text-muted-foreground uppercase">
                        {format(day, "EEEEE", { locale: fr })}
                      </div>
                      <div
                        className={cn(
                          "mt-0.5 text-sm sm:text-lg font-semibold",
                          isCurrentDay ? "text-primary" : "text-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "p-1 sm:p-2 space-y-1 cursor-pointer hover:bg-muted/30 min-h-[100px] sm:min-h-[350px]",
                        isMobile && "min-h-[80px]"
                      )}
                      onClick={() => !isMobile && handleDayClick(day)}
                    >
                      {isMobile ? (
                        // Mobile: show dots
                        <div className="flex flex-col items-center gap-1 pt-2">
                          {dayEvents.slice(0, 4).map((event, idx) => (
                            <div
                              key={idx}
                              className={cn("h-2 w-2 rounded-full", getColorDot(event.color))}
                            />
                          ))}
                          {dayEvents.length > 4 && (
                            <span className="text-[9px] text-muted-foreground">+{dayEvents.length - 4}</span>
                          )}
                        </div>
                      ) : (
                        // Desktop: show event cards
                        dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "rounded px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium",
                              getColorClass(event.color)
                            )}
                          >
                            <div className="truncate">{event.title}</div>
                            <div className="text-[9px] sm:text-[10px] opacity-80">
                              {safeParseDate(event.start_date) ? format(safeParseDate(event.start_date)!, "HH:mm") : "--:--"}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Day View */}
        {viewMode === "day" && (
          <div className="rounded-xl border border-border bg-card shadow-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-foreground capitalize">
                {format(currentDate, "EEEE d MMMM", { locale: fr })}
              </h3>
              <Button variant="outline" size="sm" onClick={() => handleDayClick(currentDate)}>
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Ajouter</span>
              </Button>
            </div>

            {getEventsForDay(currentDate).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mb-3 sm:mb-4" />
                <p className="text-sm text-muted-foreground">Aucun événement prévu</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 sm:mt-4"
                  onClick={() => handleDayClick(currentDate)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un événement
                </Button>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {getEventsForDay(currentDate).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 sm:gap-4 rounded-lg border border-border p-3 sm:p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className={cn("h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full flex-shrink-0", getColorDot(event.color))} />
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-medium text-sm sm:text-base text-foreground truncate", event.completed && "line-through text-muted-foreground")}>
                        {event.title}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {safeParseDate(event.start_date) ? format(safeParseDate(event.start_date)!, "HH:mm") : "--:--"} - {safeParseDate(event.end_date) ? format(safeParseDate(event.end_date)!, "HH:mm") : "--:--"}
                      </p>
                    </div>
                    {event.isTask && (
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex-shrink-0">
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

      {/* Mobile Day Drawer */}
      <Drawer open={showDayDrawer} onOpenChange={setShowDayDrawer}>
        <DrawerContent>
          <DrawerHeader className="text-center">
            <DrawerTitle className="capitalize">
              {selectedDate && format(selectedDate, "EEEE d MMMM", { locale: fr })}
            </DrawerTitle>
          </DrawerHeader>
          {selectedDate && <DayEventsContent date={selectedDate} />}
        </DrawerContent>
      </Drawer>

      <CalendarEventModal
        open={showEventModal}
        onOpenChange={setShowEventModal}
        defaultDate={selectedDate || new Date()}
      />
    </AppLayout>
  );
};

export default Calendar;

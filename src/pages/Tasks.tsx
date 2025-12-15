import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useTasks, useToggleTask, useDeleteTask } from "@/hooks/useTasks";
import { useClients } from "@/hooks/useClients";
import { TaskModal } from "@/components/modals/TaskModal";
import { format, addDays, startOfWeek, isToday, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

const Tasks = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { locale: fr }));
  const [selectedDay, setSelectedDay] = useState(new Date());

  const { data: tasks = [], isLoading } = useTasks();
  const { data: clients = [] } = useClients();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();

  const today = format(new Date(), "yyyy-MM-dd");

  // Tasks for today
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.due_date === today);
  }, [tasks, today]);

  // Generate week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(currentWeekStart, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayTasks = tasks.filter((t) => t.due_date === dateStr);
      return {
        date,
        dateStr,
        day: format(date, "EEE", { locale: fr }),
        dayNum: format(date, "d"),
        tasks: dayTasks,
        isToday: isToday(date),
        isSelected: isSameDay(date, selectedDay),
      };
    });
  }, [currentWeekStart, tasks, selectedDay]);

  const selectedDayTasks = useMemo(() => {
    const dateStr = format(selectedDay, "yyyy-MM-dd");
    return tasks.filter((t) => t.due_date === dateStr);
  }, [tasks, selectedDay]);

  const getClientName = (clientId: string | null) => {
    if (!clientId) return null;
    return clients.find((c) => c.id === clientId)?.name || null;
  };

  const handleToggle = (id: string, completed: boolean) => {
    toggleTask.mutate({ id, completed: !completed });
  };

  const goToPrevWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Tâches & Planning
            </h1>
            <p className="mt-1 text-muted-foreground">
              Organisez votre temps et vos priorités.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle tâche
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="today" className="gap-2">
              <Clock className="h-4 w-4" />
              Aujourd'hui
            </TabsTrigger>
            <TabsTrigger value="week" className="gap-2">
              <Calendar className="h-4 w-4" />
              Semaine
            </TabsTrigger>
          </TabsList>

          {/* Today Tab */}
          <TabsContent value="today" className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-card-foreground capitalize">
                  {format(new Date(), "EEEE d MMMM", { locale: fr })}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {todayTasks.filter((t) => t.completed).length}/{todayTasks.length}{" "}
                  terminées
                </span>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : todayTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Aucune tâche pour aujourd'hui</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une tâche
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center gap-4 rounded-lg border border-border p-4 transition-all duration-200",
                        task.completed
                          ? "bg-muted/50 opacity-60"
                          : "bg-card hover:bg-muted/30"
                      )}
                    >
                      <button
                        onClick={() => handleToggle(task.id, task.completed)}
                        className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-6 w-6 text-success" />
                        ) : (
                          <Circle className="h-6 w-6" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            task.completed &&
                              "line-through text-muted-foreground"
                          )}
                        >
                          {task.title}
                        </p>
                        {getClientName(task.client_id) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {getClientName(task.client_id)}
                          </p>
                        )}
                      </div>
                      {task.due_time && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{task.due_time.substring(0, 5)}</span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteTask.mutate(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Week Tab */}
          <TabsContent value="week" className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              {/* Week Navigation */}
              <div className="mb-6 flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={goToPrevWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Semaine du {format(currentWeekStart, "d MMMM", { locale: fr })}
                </h2>
                <Button variant="ghost" size="icon" onClick={goToNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Week Days */}
              <div className="overflow-x-auto moneya-scrollbar -mx-2 px-2 pb-2">
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4 sm:mb-6 min-w-[320px]">
                  {weekDays.map((day) => (
                    <button
                      key={day.dateStr}
                      onClick={() => setSelectedDay(day.date)}
                      className={cn(
                        "flex flex-col items-center gap-0.5 sm:gap-1 rounded-lg p-1.5 sm:p-3 transition-all",
                        day.isSelected
                          ? "bg-primary text-primary-foreground"
                          : day.isToday
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      <span className="text-[10px] sm:text-xs font-medium capitalize">{day.day}</span>
                      <span className="text-sm sm:text-lg font-semibold">{day.dayNum}</span>
                      {day.tasks.length > 0 && (
                        <span
                          className={cn(
                            "text-[9px] sm:text-xs",
                            day.isSelected
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground"
                          )}
                        >
                          {day.tasks.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Day Tasks */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground capitalize">
                  Tâches du {format(selectedDay, "EEEE d MMMM", { locale: fr })}
                </h3>
                {selectedDayTasks.length > 0 ? (
                  selectedDayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/30"
                    >
                      <button
                        onClick={() => handleToggle(task.id, task.completed)}
                        className="flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className={cn("text-sm font-medium text-foreground", task.completed && "line-through text-muted-foreground")}>
                          {task.title}
                        </p>
                        {getClientName(task.client_id) && (
                          <p className="text-xs text-muted-foreground">
                            {getClientName(task.client_id)}
                          </p>
                        )}
                      </div>
                      {task.due_time && (
                        <span className="text-sm text-muted-foreground">
                          {task.due_time.substring(0, 5)}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center">
                    <Calendar className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Aucune tâche prévue
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <TaskModal
        open={showModal}
        onOpenChange={setShowModal}
        defaultDate={format(selectedDay, "yyyy-MM-dd")}
      />
    </AppLayout>
  );
};

export default Tasks;

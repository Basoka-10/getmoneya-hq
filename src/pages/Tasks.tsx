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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Mock data from document
const todayTasks = [
  { id: "1", title: "Finaliser proposition client ABC", time: "09:00 - 10:00", completed: false, client: "ABC Corp" },
  { id: "2", title: "Appel de suivi - Projet Beta", time: "11:00 - 11:30", completed: false, client: "Beta Inc" },
  { id: "3", title: "Révision du contrat", time: "14:00 - 15:00", completed: false },
  { id: "4", title: "Envoyer facture mensuelle", time: "16:00 - 16:30", completed: true },
];

const weekDays = [
  { day: "Lun", date: 9, tasks: 3 },
  { day: "Mar", date: 10, tasks: 2 },
  { day: "Mer", date: 11, tasks: 4 },
  { day: "Jeu", date: 12, tasks: 1 },
  { day: "Ven", date: 13, tasks: 2 },
  { day: "Sam", date: 14, tasks: 0, isToday: true },
  { day: "Dim", date: 15, tasks: 0 },
];

const weeklyTasks = {
  9: [
    { id: "w1", title: "Réunion équipe", time: "09:00", client: null },
    { id: "w2", title: "Livraison projet X", time: "14:00", client: "Startup X" },
    { id: "w3", title: "Comptabilité mensuelle", time: "16:00", client: null },
  ],
  10: [
    { id: "w4", title: "Call client Beta", time: "10:00", client: "Beta Inc" },
    { id: "w5", title: "Formation en ligne", time: "15:00", client: null },
  ],
  11: [
    { id: "w6", title: "Proposition commerciale", time: "09:00", client: "Gamma Tech" },
    { id: "w7", title: "Révision contrat", time: "11:00", client: "ABC Corp" },
    { id: "w8", title: "Facturation", time: "14:00", client: null },
    { id: "w9", title: "Suivi prospects", time: "16:00", client: null },
  ],
  12: [
    { id: "w10", title: "Présentation finale", time: "14:00", client: "Delta SA" },
  ],
  13: [
    { id: "w11", title: "Bilan hebdomadaire", time: "10:00", client: null },
    { id: "w12", title: "Planification semaine", time: "15:00", client: null },
  ],
  14: [],
  15: [],
};

const Tasks = () => {
  const [tasks, setTasks] = useState(todayTasks);
  const [selectedDay, setSelectedDay] = useState(14);

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
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
          <Button size="sm">
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
                <h2 className="text-lg font-semibold text-card-foreground">
                  Samedi 14 Décembre
                </h2>
                <span className="text-sm text-muted-foreground">
                  {tasks.filter((t) => t.completed).length}/{tasks.length}{" "}
                  terminées
                </span>
              </div>

              <div className="space-y-3">
                {tasks.map((task) => (
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
                      onClick={() => toggleTask(task.id)}
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
                      {task.client && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {task.client}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{task.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Week Tab */}
          <TabsContent value="week" className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              {/* Week Navigation */}
              <div className="mb-6 flex items-center justify-between">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Semaine du 9 - 15 Décembre
                </h2>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {weekDays.map((day) => (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDay(day.date)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg p-3 transition-all",
                      selectedDay === day.date
                        ? "bg-primary text-primary-foreground"
                        : day.isToday
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <span className="text-xs font-medium">{day.day}</span>
                    <span className="text-lg font-semibold">{day.date}</span>
                    {day.tasks > 0 && (
                      <span
                        className={cn(
                          "text-xs",
                          selectedDay === day.date
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        )}
                      >
                        {day.tasks} tâche{day.tasks > 1 ? "s" : ""}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Selected Day Tasks */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Tâches du{" "}
                  {weekDays.find((d) => d.date === selectedDay)?.day}{" "}
                  {selectedDay} Décembre
                </h3>
                {weeklyTasks[selectedDay as keyof typeof weeklyTasks]?.length >
                0 ? (
                  weeklyTasks[selectedDay as keyof typeof weeklyTasks].map(
                    (task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-4 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {task.title}
                          </p>
                          {task.client && (
                            <p className="text-xs text-muted-foreground">
                              {task.client}
                            </p>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {task.time}
                        </span>
                      </div>
                    )
                  )
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
    </AppLayout>
  );
};

export default Tasks;

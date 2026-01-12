import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTask, Task, useUpdateTask } from "@/hooks/useTasks";
import { useClients } from "@/hooks/useClients";
import { format } from "date-fns";
import { Bell } from "lucide-react";

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultDate?: string;
}

export function TaskModal({ open, onOpenChange, task, defaultDate }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task?.priority || "medium");
  const [dueDate, setDueDate] = useState(task?.due_date || defaultDate || format(new Date(), "yyyy-MM-dd"));
  const [dueTime, setDueTime] = useState(task?.due_time || "");
  const [clientId, setClientId] = useState(task?.client_id || "");
  const [reminderMinutes, setReminderMinutes] = useState<string>(
    task?.reminder_minutes?.toString() || ""
  );

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: clients } = useClients();

  const isEditing = !!task;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      title,
      description: description || null,
      priority,
      due_date: dueDate || null,
      due_time: dueTime || null,
      client_id: clientId || null,
      reminder_minutes: reminderMinutes ? parseInt(reminderMinutes) : null,
      reminder_sent: false, // Reset reminder when updating
    };

    if (isEditing) {
      await updateTask.mutateAsync({ id: task.id, ...data });
    } else {
      await createTask.mutateAsync(data);
    }

    // Reset form
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate(format(new Date(), "yyyy-MM-dd"));
    setDueTime("");
    setClientId("");
    setReminderMinutes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? "Modifier la tâche" : "Nouvelle tâche"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la tâche"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la tâche..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueTime">Heure</Label>
              <Input
                id="dueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {clients && clients.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="client">Client (optionnel)</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Reminder selection - only show if time is set */}
          {dueTime && (
            <div className="space-y-2">
              <Label htmlFor="reminder" className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Rappel
              </Label>
              <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
                <SelectTrigger>
                  <SelectValue placeholder="Pas de rappel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Pas de rappel</SelectItem>
                  <SelectItem value="5">5 minutes avant</SelectItem>
                  <SelectItem value="10">10 minutes avant</SelectItem>
                  <SelectItem value="15">15 minutes avant</SelectItem>
                  <SelectItem value="30">30 minutes avant</SelectItem>
                  <SelectItem value="60">1 heure avant</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Vous recevrez une notification avant l'heure prévue
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createTask.isPending || updateTask.isPending}>
              {(createTask.isPending || updateTask.isPending) ? "Enregistrement..." : isEditing ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreateCalendarEvent, CalendarEvent, useUpdateCalendarEvent } from "@/hooks/useCalendarEvents";
import { useClients } from "@/hooks/useClients";
import { format } from "date-fns";

interface CalendarEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  defaultDate?: Date;
}

const EVENT_COLORS = [
  { value: "primary", label: "Bleu", class: "bg-primary" },
  { value: "success", label: "Vert", class: "bg-success" },
  { value: "warning", label: "Orange", class: "bg-warning" },
  { value: "destructive", label: "Rouge", class: "bg-destructive" },
];

export function CalendarEventModal({ open, onOpenChange, event, defaultDate }: CalendarEventModalProps) {
  const defaultDateStr = format(defaultDate || new Date(), "yyyy-MM-dd");
  
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [eventType, setEventType] = useState<"task" | "appointment" | "reminder">(event?.event_type || "appointment");
  const [startDate, setStartDate] = useState(event?.start_date?.split("T")[0] || defaultDateStr);
  const [startTime, setStartTime] = useState(event?.start_date?.split("T")[1]?.substring(0, 5) || "09:00");
  const [endDate, setEndDate] = useState(event?.end_date?.split("T")[0] || defaultDateStr);
  const [endTime, setEndTime] = useState(event?.end_date?.split("T")[1]?.substring(0, 5) || "10:00");
  const [allDay, setAllDay] = useState(event?.all_day || false);
  const [clientId, setClientId] = useState(event?.client_id || "");
  const [color, setColor] = useState(event?.color || "primary");

  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const { data: clients } = useClients();

  const isEditing = !!event;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      title,
      description: description || null,
      event_type: eventType,
      start_date: allDay ? `${startDate}T00:00:00Z` : `${startDate}T${startTime}:00Z`,
      end_date: allDay ? `${endDate}T23:59:59Z` : `${endDate}T${endTime}:00Z`,
      all_day: allDay,
      client_id: clientId || null,
      color,
    };

    if (isEditing) {
      await updateEvent.mutateAsync({ id: event.id, ...data });
    } else {
      await createEvent.mutateAsync(data);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? "Modifier l'événement" : "Nouvel événement"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de l'événement"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description..."
              rows={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={eventType} onValueChange={(v) => setEventType(v as typeof eventType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointment">Rendez-vous</SelectItem>
                  <SelectItem value="task">Tâche</SelectItem>
                  <SelectItem value="reminder">Rappel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Couleur</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_COLORS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${c.class}`} />
                        {c.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={allDay} onCheckedChange={setAllDay} id="allDay" />
            <Label htmlFor="allDay">Journée entière</Label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            {!allDay && (
              <div className="space-y-2">
                <Label>Heure de début</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            {!allDay && (
              <div className="space-y-2">
                <Label>Heure de fin</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            )}
          </div>

          {clients && clients.length > 0 && (
            <div className="space-y-2">
              <Label>Client (optionnel)</Label>
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

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createEvent.isPending || updateEvent.isPending}>
              {(createEvent.isPending || updateEvent.isPending) ? "Enregistrement..." : isEditing ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

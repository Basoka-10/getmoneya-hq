import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFreeLimits, useUpdateFreeLimit } from "@/hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Users, FileText, Receipt, CheckSquare, BarChart } from "lucide-react";

const limitIcons: Record<string, React.ElementType> = {
  max_clients: Users,
  max_quotations: FileText,
  max_invoices: Receipt,
  max_tasks_per_week: CheckSquare,
  analysis_enabled: BarChart,
};

const limitLabels: Record<string, string> = {
  max_clients: "Clients maximum",
  max_quotations: "Devis maximum",
  max_invoices: "Factures maximum",
  max_tasks_per_week: "Tâches par semaine",
  analysis_enabled: "Analyses activées",
};

export default function AdminLimits() {
  const { data: limits, isLoading } = useFreeLimits();
  const updateLimit = useUpdateFreeLimit();
  const [editedValues, setEditedValues] = useState<Record<string, number>>({});

  const handleValueChange = (id: string, value: number) => {
    setEditedValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = (id: string, originalValue: number) => {
    const newValue = editedValues[id];
    if (newValue !== undefined && newValue !== originalValue) {
      updateLimit.mutate({ id, limit_value: newValue });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Limites FREE</h1>
        <p className="text-muted-foreground">
          Configurer les limites pour les utilisateurs gratuits
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))
          : limits?.map((limit) => {
              const Icon = limitIcons[limit.limit_name] || FileText;
              const currentValue = editedValues[limit.id] ?? limit.limit_value;
              const hasChanges = editedValues[limit.id] !== undefined && editedValues[limit.id] !== limit.limit_value;

              return (
                <Card key={limit.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      {limitLabels[limit.limit_name] || limit.limit_name}
                    </CardTitle>
                    <CardDescription>{limit.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={limit.id}>
                        {limit.limit_name === "analysis_enabled" ? "Statut (0 = désactivé, 1 = activé)" : "Valeur limite"}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={limit.id}
                          type="number"
                          min={0}
                          value={currentValue}
                          onChange={(e) => handleValueChange(limit.id, parseInt(e.target.value) || 0)}
                        />
                        <Button
                          size="icon"
                          onClick={() => handleSave(limit.id, limit.limit_value)}
                          disabled={!hasChanges || updateLimit.isPending}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Messages de limite</CardTitle>
          <CardDescription>Messages affichés lorsqu'une limite est atteinte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="p-3 bg-muted rounded-lg">
            <code className="text-sm">"Limite atteinte pour cette fonctionnalité."</code>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <code className="text-sm">"Accès réservé à l'administrateur."</code>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <code className="text-sm">"Données enregistrées avec succès."</code>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <code className="text-sm">"Erreur serveur, réessayez plus tard."</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

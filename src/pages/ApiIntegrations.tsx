import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Key, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Trash2, 
  Power, 
  PowerOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Code,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  useApiKeys,
  useApiLogs,
  useApiStats,
  useCreateApiKey,
  useToggleApiKey,
  useDeleteApiKey,
  useRegenerateApiKey,
} from "@/hooks/useApiKeys";
import { useSubscription } from "@/hooks/useSubscription";

export default function ApiIntegrations() {
  const [newKeyName, setNewKeyName] = useState("");
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { currentPlan, isLoading: loadingSubscription } = useSubscription();
  const { data: apiKeys = [], isLoading: loadingKeys } = useApiKeys();
  const { data: logs = [], isLoading: loadingLogs } = useApiLogs(20);
  const { data: stats, isLoading: loadingStats } = useApiStats();

  const createKey = useCreateApiKey();
  const toggleKey = useToggleApiKey();
  const deleteKey = useDeleteApiKey();
  const regenerateKey = useRegenerateApiKey();

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Veuillez entrer un nom pour la clé");
      return;
    }

    try {
      const result = await createKey.mutateAsync(newKeyName);
      setShowNewKey(result.key);
      setNewKeyName("");
      setIsCreateOpen(false);
      toast.success("Clé API créée avec succès");
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Clé copiée dans le presse-papier");
  };

  const handleRegenerate = async (id: string) => {
    const newKey = await regenerateKey.mutateAsync(id);
    setShowNewKey(newKey);
  };

  const usagePercentage = stats ? 
    Math.round((stats.usage.salesThisMonth / stats.limits.max_sales_per_month) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Key className="h-7 w-7 text-primary" />
              API & Intégrations
            </h1>
            <p className="mt-1 text-muted-foreground">
              Connectez vos plateformes externes pour automatiser vos ventes
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle clé API
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une clé API</DialogTitle>
                <DialogDescription>
                  Donnez un nom descriptif à votre clé pour l'identifier facilement.
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder="Ex: Chariow Production"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateKey} disabled={createKey.isPending}>
                  {createKey.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* New Key Modal */}
        {showNewKey && (
          <Dialog open={!!showNewKey} onOpenChange={() => setShowNewKey(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Clé API créée
                </DialogTitle>
                <DialogDescription>
                  Copiez cette clé maintenant. Elle ne sera plus jamais affichée.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
                <code className="flex-1 break-all">{showNewKey}</code>
                <Button size="icon" variant="ghost" onClick={() => handleCopyKey(showNewKey)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowNewKey(null)}>J'ai copié ma clé</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Plan actuel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold capitalize">
                  {loadingSubscription ? "..." : currentPlan || "free"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Clés API actives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">
                  {loadingStats ? "..." : (
                    stats?.limits.max_api_keys >= 999999 
                      ? `${stats?.usage.activeKeys || 0} / ∞`
                      : `${stats?.usage.activeKeys || 0}/${stats?.limits.max_api_keys || 2}`
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ventes API ce mois
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {loadingStats ? "..." : stats?.usage.salesThisMonth || 0}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {stats?.limits.max_sales_per_month >= 10000 ? "∞" : (stats?.limits.max_sales_per_month || 50)}
                </span>
              </div>
              <Progress value={stats?.limits.max_sales_per_month >= 10000 ? 0 : usagePercentage} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* API Keys Table */}
        <Card>
          <CardHeader>
            <CardTitle>Mes clés API</CardTitle>
            <CardDescription>
              Gérez vos clés d'accès à l'API MONEYA
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingKeys ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune clé API créée</p>
                <p className="text-sm">Créez votre première clé pour commencer l'intégration</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Préfixe</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernière utilisation</TableHead>
                    <TableHead>Créée le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{key.key_prefix}...</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={key.is_active ? "default" : "secondary"}>
                          {key.is_active ? "Active" : "Désactivée"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {key.last_used_at 
                          ? format(new Date(key.last_used_at), "d MMM à HH:mm", { locale: fr })
                          : "Jamais"
                        }
                      </TableCell>
                      <TableCell>
                        {format(new Date(key.created_at), "d MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleKey.mutate({ id: key.id, isActive: !key.is_active })}
                            title={key.is_active ? "Désactiver" : "Activer"}
                          >
                            {key.is_active ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" title="Régénérer">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Régénérer la clé ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  L'ancienne clé sera invalidée immédiatement. Toutes les intégrations
                                  utilisant cette clé cesseront de fonctionner.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRegenerate(key.id)}>
                                  Régénérer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="text-destructive" title="Supprimer">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer la clé ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. Toutes les intégrations utilisant
                                  cette clé cesseront de fonctionner.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteKey.mutate(key.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Documentation API
            </CardTitle>
            <CardDescription>
              Endpoints disponibles pour l'intégration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default">POST</Badge>
                  <code className="text-sm">/api/v1/sales</code>
                </div>
                <p className="text-sm text-muted-foreground">
                  Créer une vente automatiquement depuis une plateforme externe
                </p>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`curl -X POST https://fisjgmjnezcchxnhihxc.supabase.co/functions/v1/api-sales \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: mny_votre_cle_api" \\
  -d '{
    "amount": 15000,
    "category": "Vente en ligne",
    "source": "chariow",
    "date": "2025-01-02",
    "description": "Commande #1234"
  }'`}
                </pre>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default">POST</Badge>
                  <code className="text-sm">/api/v1/clients</code>
                  <Badge variant="secondary">Pro+</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Créer ou mettre à jour un client (email/téléphone = identifiant unique)
                </p>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`curl -X POST https://fisjgmjnezcchxnhihxc.supabase.co/functions/v1/api-clients \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: mny_votre_cle_api" \\
  -d '{
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "phone": "+225 0102030405",
    "company": "Dupont SARL",
    "source": "chariow"
  }'`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Errors */}
        {stats?.recentErrors && stats.recentErrors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Erreurs récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.recentErrors.slice(0, 5).map((error: any) => (
                  <div key={error.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg text-sm">
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">{error.status_code}</Badge>
                      <span className="font-mono text-xs">{error.endpoint}</span>
                      <span className="text-muted-foreground">{error.error_message}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(error.created_at), "d MMM HH:mm", { locale: fr })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

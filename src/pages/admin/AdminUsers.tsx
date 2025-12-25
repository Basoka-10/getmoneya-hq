import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAllUsers, useToggleUserSuspension } from "@/hooks/useAdmin";
import { useRevokeSubscription, useExtendSubscription, useUpdateUserPlan } from "@/hooks/useAdminSubscriptions";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  UserX, 
  UserCheck, 
  Shield, 
  Crown, 
  Star, 
  MoreHorizontal, 
  Ban, 
  CalendarPlus, 
  ArrowUpCircle,
  AlertTriangle 
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";

const planBadges: Record<string, { label: string; variant: "default" | "secondary" | "outline"; icon?: React.ElementType }> = {
  free: { label: "Gratuit", variant: "outline" },
  pro: { label: "Pro", variant: "secondary", icon: Star },
  business: { label: "Business", variant: "default", icon: Crown },
};

const planFilters = [
  { value: "all", label: "Tous les plans" },
  { value: "free", label: "Gratuit" },
  { value: "pro", label: "Pro" },
  { value: "business", label: "Business" },
];

export default function AdminUsers() {
  const { data: users, isLoading } = useAllUsers();
  const toggleSuspension = useToggleUserSuspension();
  const revokeSubscription = useRevokeSubscription();
  const extendSubscription = useExtendSubscription();
  const updateUserPlan = useUpdateUserPlan();

  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  
  // Dialog states
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; userId: string; userName: string }>({ 
    open: false, userId: "", userName: "" 
  });
  const [extendDialog, setExtendDialog] = useState<{ open: boolean; userId: string; userName: string; days: number }>({ 
    open: false, userId: "", userName: "", days: 30 
  });
  const [changePlanDialog, setChangePlanDialog] = useState<{ open: boolean; userId: string; userName: string; plan: "free" | "pro" | "business" }>({ 
    open: false, userId: "", userName: "", plan: "pro" 
  });

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user.private_data?.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(search.toLowerCase());

    const isOwner = user.user_roles?.some((r) => r.role === "owner");
    const plan = isOwner ? "business" : (user.subscription_plan || "free");
    const matchesPlan = planFilter === "all" || plan === planFilter;

    return matchesSearch && matchesPlan;
  });

  const handleToggleSuspension = (userId: string, currentlySuspended: boolean) => {
    toggleSuspension.mutate({ userId, suspend: !currentlySuspended });
  };

  const handleRevoke = () => {
    revokeSubscription.mutate({ userId: revokeDialog.userId });
    setRevokeDialog({ open: false, userId: "", userName: "" });
  };

  const handleExtend = () => {
    extendSubscription.mutate({ userId: extendDialog.userId, days: extendDialog.days });
    setExtendDialog({ open: false, userId: "", userName: "", days: 30 });
  };

  const handleChangePlan = () => {
    updateUserPlan.mutate({ userId: changePlanDialog.userId, plan: changePlanDialog.plan });
    setChangePlanDialog({ open: false, userId: "", userName: "", plan: "pro" });
  };

  const getExpiryInfo = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const expiryDate = new Date(expiresAt);
    const daysLeft = differenceInDays(expiryDate, new Date());
    
    if (daysLeft < 0) {
      return { text: "Expiré", variant: "destructive" as const, urgent: true };
    } else if (daysLeft <= 7) {
      return { text: `${daysLeft}j restants`, variant: "outline" as const, urgent: true };
    } else {
      return { text: format(expiryDate, "dd/MM/yy"), variant: "outline" as const, urgent: false };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
        <p className="text-muted-foreground">Voir et gérer tous les utilisateurs MONEYA</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span>Utilisateurs ({users?.length || 0})</span>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filtrer par plan" />
                </SelectTrigger>
                <SelectContent>
                  {planFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers?.map((user) => {
                    const isOwner = user.user_roles?.some((r) => r.role === "owner");
                    const plan = isOwner ? "business" : (user.subscription_plan || "free");
                    const planInfo = planBadges[plan] || planBadges.free;
                    const PlanIcon = planInfo.icon;
                    
                    // Get subscription expiry from the subscription data in useAllUsers
                    const subscriptionExpiresAt = (user as any).subscription_expires_at;
                    const expiryInfo = plan !== "free" ? getExpiryInfo(subscriptionExpiresAt) : null;

                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name || "Non renseigné"}
                        </TableCell>
                        <TableCell>{user.private_data?.email || "-"}</TableCell>
                        <TableCell>{user.company_name || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={planInfo.variant} className="gap-1">
                            {PlanIcon && <PlanIcon className="h-3 w-3" />}
                            {planInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {expiryInfo ? (
                            <Badge 
                              variant={expiryInfo.variant} 
                              className={expiryInfo.urgent ? "border-destructive text-destructive" : ""}
                            >
                              {expiryInfo.urgent && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {expiryInfo.text}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isOwner ? (
                            <Badge variant="default" className="gap-1">
                              <Shield className="h-3 w-3" />
                              Owner
                            </Badge>
                          ) : (
                            <Badge variant="secondary">User</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.is_suspended ? (
                            <Badge variant="destructive">Suspendu</Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Actif
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.created_at), "dd MMM yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {!isOwner && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                {/* Suspension action */}
                                <DropdownMenuItem
                                  onClick={() => handleToggleSuspension(user.user_id, user.is_suspended)}
                                  className={user.is_suspended ? "text-green-600" : "text-destructive"}
                                >
                                  {user.is_suspended ? (
                                    <>
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Activer le compte
                                    </>
                                  ) : (
                                    <>
                                      <UserX className="h-4 w-4 mr-2" />
                                      Suspendre le compte
                                    </>
                                  )}
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-xs text-muted-foreground">Abonnement</DropdownMenuLabel>
                                
                                {/* Change plan */}
                                <DropdownMenuItem
                                  onClick={() => setChangePlanDialog({ 
                                    open: true, 
                                    userId: user.user_id, 
                                    userName: user.full_name || user.private_data?.email || "Utilisateur",
                                    plan: plan === "pro" ? "business" : "pro"
                                  })}
                                >
                                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                                  Changer le plan
                                </DropdownMenuItem>
                                
                                {/* Extend subscription (only for paid plans) */}
                                {plan !== "free" && (
                                  <DropdownMenuItem
                                    onClick={() => setExtendDialog({ 
                                      open: true, 
                                      userId: user.user_id, 
                                      userName: user.full_name || user.private_data?.email || "Utilisateur",
                                      days: 30
                                    })}
                                  >
                                    <CalendarPlus className="h-4 w-4 mr-2" />
                                    Prolonger l'abonnement
                                  </DropdownMenuItem>
                                )}
                                
                                {/* Revoke subscription (only for paid plans) */}
                                {plan !== "free" && (
                                  <DropdownMenuItem
                                    onClick={() => setRevokeDialog({ 
                                      open: true, 
                                      userId: user.user_id, 
                                      userName: user.full_name || user.private_data?.email || "Utilisateur"
                                    })}
                                    className="text-destructive"
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Révoquer l'abonnement
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Revoke Subscription Dialog */}
      <Dialog open={revokeDialog.open} onOpenChange={(open) => setRevokeDialog({ ...revokeDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Ban className="h-5 w-5" />
              Révoquer l'abonnement
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir révoquer l'abonnement de <strong>{revokeDialog.userName}</strong> ? 
              L'utilisateur sera immédiatement rétrogradé au plan gratuit.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialog({ open: false, userId: "", userName: "" })}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRevoke}
              disabled={revokeSubscription.isPending}
            >
              {revokeSubscription.isPending ? "Révocation..." : "Révoquer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Subscription Dialog */}
      <Dialog open={extendDialog.open} onOpenChange={(open) => setExtendDialog({ ...extendDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-primary" />
              Prolonger l'abonnement
            </DialogTitle>
            <DialogDescription>
              Prolonger l'abonnement de <strong>{extendDialog.userName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Nombre de jours à ajouter</label>
            <div className="flex gap-2 mt-2">
              {[7, 30, 90, 365].map((days) => (
                <Button
                  key={days}
                  variant={extendDialog.days === days ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExtendDialog({ ...extendDialog, days })}
                >
                  {days}j
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendDialog({ open: false, userId: "", userName: "", days: 30 })}>
              Annuler
            </Button>
            <Button 
              onClick={handleExtend}
              disabled={extendSubscription.isPending}
            >
              {extendSubscription.isPending ? "Prolongation..." : `Prolonger de ${extendDialog.days} jours`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanDialog.open} onOpenChange={(open) => setChangePlanDialog({ ...changePlanDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-primary" />
              Changer le plan
            </DialogTitle>
            <DialogDescription>
              Modifier le plan d'abonnement de <strong>{changePlanDialog.userName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Nouveau plan</label>
            <div className="flex gap-2 mt-2">
              {(["free", "pro", "business"] as const).map((p) => (
                <Button
                  key={p}
                  variant={changePlanDialog.plan === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChangePlanDialog({ ...changePlanDialog, plan: p })}
                  className="gap-1"
                >
                  {p === "pro" && <Star className="h-3 w-3" />}
                  {p === "business" && <Crown className="h-3 w-3" />}
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Button>
              ))}
            </div>
            {changePlanDialog.plan !== "free" && (
              <p className="text-xs text-muted-foreground mt-2">
                L'abonnement sera valide pour 365 jours.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePlanDialog({ open: false, userId: "", userName: "", plan: "pro" })}>
              Annuler
            </Button>
            <Button 
              onClick={handleChangePlan}
              disabled={updateUserPlan.isPending}
            >
              {updateUserPlan.isPending ? "Mise à jour..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

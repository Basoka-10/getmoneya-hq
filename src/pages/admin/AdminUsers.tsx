import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAllUsers, useToggleUserSuspension } from "@/hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserX, UserCheck, Shield, Crown, Star } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const planBadges: Record<string, { label: string; variant: "default" | "secondary" | "outline"; icon?: React.ElementType }> = {
  free: { label: "Gratuit", variant: "outline" },
  pro: { label: "Pro", variant: "secondary", icon: Star },
  business: { label: "Business", variant: "default", icon: Crown },
};

export default function AdminUsers() {
  const { data: users, isLoading } = useAllUsers();
  const toggleSuspension = useToggleUserSuspension();
  const [search, setSearch] = useState("");

  const filteredUsers = users?.filter(
    (user) =>
      user.private_data?.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleSuspension = (userId: string, currentlySupsended: boolean) => {
    toggleSuspension.mutate({ userId, suspend: !currentlySupsended });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
        <p className="text-muted-foreground">Voir et gérer tous les utilisateurs MONEYA</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Utilisateurs ({users?.length || 0})</span>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
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
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers?.map((user) => {
                    const isOwner = user.user_roles?.some((r) => r.role === "owner");
                    const plan = isOwner ? "business" : (user.subscription_plan || "free");
                    const planInfo = planBadges[plan] || planBadges.free;
                    const PlanIcon = planInfo.icon;
                    
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
                            <Button
                              variant={user.is_suspended ? "outline" : "destructive"}
                              size="sm"
                              onClick={() => handleToggleSuspension(user.user_id, user.is_suspended)}
                              disabled={toggleSuspension.isPending}
                            >
                              {user.is_suspended ? (
                                <>
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Activer
                                </>
                              ) : (
                                <>
                                  <UserX className="h-4 w-4 mr-1" />
                                  Suspendre
                                </>
                              )}
                            </Button>
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
    </div>
  );
}

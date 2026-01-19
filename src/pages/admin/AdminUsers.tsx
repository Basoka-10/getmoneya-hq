import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useAllUsers, useToggleUserSuspension, useGrantOwnerRole, useRevokeOwnerRole } from "@/hooks/useAdmin";
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
  AlertTriangle,
  Mail,
  ShieldCheck,
  ShieldX
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'fr' ? fr : enUS;

  const { data: users, isLoading } = useAllUsers();
  const toggleSuspension = useToggleUserSuspension();
  const revokeSubscription = useRevokeSubscription();
  const extendSubscription = useExtendSubscription();
  const updateUserPlan = useUpdateUserPlan();
  const grantOwnerRole = useGrantOwnerRole();
  const revokeOwnerRole = useRevokeOwnerRole();

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
  const [adminRoleDialog, setAdminRoleDialog] = useState<{ open: boolean; userId: string; userName: string; action: "grant" | "revoke" }>({
    open: false, userId: "", userName: "", action: "grant"
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

  const handleAdminRole = () => {
    if (adminRoleDialog.action === "grant") {
      grantOwnerRole.mutate({ userId: adminRoleDialog.userId });
    } else {
      revokeOwnerRole.mutate({ userId: adminRoleDialog.userId });
    }
    setAdminRoleDialog({ open: false, userId: "", userName: "", action: "grant" });
  };

  const getExpiryInfo = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const expiryDate = new Date(expiresAt);
    const daysLeft = differenceInDays(expiryDate, new Date());
    
    if (daysLeft < 0) {
      return { text: language === 'fr' ? "Expiré" : "Expired", variant: "destructive" as const, urgent: true };
    } else if (daysLeft <= 7) {
      return { text: `${daysLeft}j`, variant: "outline" as const, urgent: true };
    } else {
      return { text: format(expiryDate, "dd/MM/yy"), variant: "outline" as const, urgent: false };
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{t('admin.users.title')}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">{t('admin.users.subtitle')}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col gap-3">
            <span className="text-base sm:text-lg">{t('admin.users.count')} ({users?.length || 0})</span>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filtrer par plan" />
                </SelectTrigger>
                <SelectContent>
                  {planFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {t(`admin.plans.${filter.value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('common.search') + "..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
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
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredUsers?.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {t('admin.users.noUsers')}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredUsers?.map((user) => {
                const isOwner = user.user_roles?.some((r) => r.role === "owner");
                const plan = isOwner ? "business" : (user.subscription_plan || "free");
                const planInfo = planBadges[plan] || planBadges.free;
                const PlanIcon = planInfo.icon;
                
                const subscriptionExpiresAt = (user as any).subscription_expires_at;
                const expiryInfo = plan !== "free" ? getExpiryInfo(subscriptionExpiresAt) : null;

                return (
                  <div key={user.id} className="p-3 sm:p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-2">
                        {/* User name and role */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm sm:text-base truncate">
                            {user.full_name || t('admin.users.notProvided')}
                          </span>
                          {isOwner ? (
                            <Badge variant="default" className="gap-1 text-xs">
                              <Shield className="h-3 w-3" />
                              {t('admin.users.roles.owner')}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">{t('admin.users.roles.user')}</Badge>
                          )}
                          {user.is_suspended ? (
                            <Badge variant="destructive" className="text-xs">{t('admin.users.status.suspended')}</Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                              {t('admin.users.status.active')}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Email */}
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{user.private_data?.email || "-"}</span>
                        </div>
                        
                        {/* Plan and company */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={planInfo.variant} className="gap-1 text-xs">
                            {PlanIcon && <PlanIcon className="h-3 w-3" />}
                            {planInfo.label}
                          </Badge>
                          {expiryInfo && (
                            <Badge 
                              variant={expiryInfo.variant} 
                              className={`text-xs ${expiryInfo.urgent ? "border-destructive text-destructive" : ""}`}
                            >
                              {expiryInfo.urgent && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {expiryInfo.text}
                            </Badge>
                          )}
                          {user.company_name && (
                            <span className="text-xs text-muted-foreground">
                              • {user.company_name}
                            </span>
                          )}
                        </div>
                        
                        {/* Date */}
                        <p className="text-xs text-muted-foreground">
                          {t('admin.users.registeredOn')} {format(new Date(user.created_at), "dd MMM yyyy", { locale })}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      {!isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t('admin.users.actions.title')}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => handleToggleSuspension(user.user_id, user.is_suspended)}
                              className={user.is_suspended ? "text-green-600" : "text-destructive"}
                            >
                              {user.is_suspended ? (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  {t('admin.users.actions.activate')}
                                </>
                              ) : (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  {t('admin.users.actions.suspend')}
                                </>
                              )}
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground">{t('admin.users.actions.subscription')}</DropdownMenuLabel>
                            
                            <DropdownMenuItem
                              onClick={() => setChangePlanDialog({ 
                                open: true, 
                                userId: user.user_id, 
                                userName: user.full_name || user.private_data?.email || "Utilisateur",
                                plan: plan === "pro" ? "business" : "pro"
                              })}
                            >
                              <ArrowUpCircle className="h-4 w-4 mr-2" />
                              {t('admin.users.actions.changePlan')}
                            </DropdownMenuItem>
                            
                            {plan !== "free" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => setExtendDialog({ 
                                    open: true, 
                                    userId: user.user_id, 
                                    userName: user.full_name || user.private_data?.email || "Utilisateur",
                                    days: 30
                                  })}
                                >
                                  <CalendarPlus className="h-4 w-4 mr-2" />
                                  {t('admin.users.actions.extend')}
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem
                                  onClick={() => setRevokeDialog({ 
                                    open: true, 
                                    userId: user.user_id, 
                                    userName: user.full_name || user.private_data?.email || "Utilisateur"
                                  })}
                                  className="text-destructive"
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  {t('admin.users.actions.revoke')}
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Admin</DropdownMenuLabel>
                            
                            {isOwner ? (
                              <DropdownMenuItem
                                onClick={() => setAdminRoleDialog({
                                  open: true,
                                  userId: user.user_id,
                                  userName: user.full_name || user.private_data?.email || "Utilisateur",
                                  action: "revoke"
                                })}
                                className="text-destructive"
                              >
                                <ShieldX className="h-4 w-4 mr-2" />
                                {t('admin.users.actions.revokeAdmin')}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setAdminRoleDialog({
                                  open: true,
                                  userId: user.user_id,
                                  userName: user.full_name || user.private_data?.email || "Utilisateur",
                                  action: "grant"
                                })}
                              >
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                {t('admin.users.actions.grantAdmin')}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revoke Subscription Dialog */}
      <Dialog open={revokeDialog.open} onOpenChange={(open) => setRevokeDialog({ ...revokeDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Ban className="h-5 w-5" />
              {t('admin.users.dialogs.revoke.title')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.users.dialogs.revoke.description')} <strong>{revokeDialog.userName}</strong> ? 
              {t('admin.users.dialogs.revoke.warning')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setRevokeDialog({ open: false, userId: "", userName: "" })}>
              {t('common.cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRevoke}
              disabled={revokeSubscription.isPending}
            >
              {revokeSubscription.isPending ? "..." : t('admin.users.dialogs.revoke.confirm')}
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
              {t('admin.users.dialogs.extend.title')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.users.dialogs.extend.description')} <strong>{extendDialog.userName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">{t('admin.users.dialogs.extend.daysLabel')}</label>
            <div className="flex flex-wrap gap-2 mt-2">
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
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setExtendDialog({ open: false, userId: "", userName: "", days: 30 })}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleExtend}
              disabled={extendSubscription.isPending}
            >
              {extendSubscription.isPending ? "..." : `${t('admin.users.dialogs.extend.confirm')} ${extendDialog.days} ${language === 'fr' ? 'jours' : 'days'}`}
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
              {t('admin.users.dialogs.changePlan.title')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.users.dialogs.changePlan.description')} <strong>{changePlanDialog.userName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">{t('admin.users.dialogs.changePlan.selectPlan')}</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(["free", "pro", "business"] as const).map((plan) => {
                const info = planBadges[plan];
                const Icon = info.icon;
                return (
                  <Button
                    key={plan}
                    variant={changePlanDialog.plan === plan ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChangePlanDialog({ ...changePlanDialog, plan })}
                    className="gap-1"
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    {info.label}
                  </Button>
                );
              })}
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setChangePlanDialog({ open: false, userId: "", userName: "", plan: "pro" })}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleChangePlan}
              disabled={updateUserPlan.isPending}
            >
              {updateUserPlan.isPending ? "..." : t('admin.users.dialogs.changePlan.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Role Dialog */}
      <Dialog open={adminRoleDialog.open} onOpenChange={(open) => setAdminRoleDialog({ ...adminRoleDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {adminRoleDialog.action === "grant" ? (
                <>
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  {t('admin.users.dialogs.grantAdmin.title')}
                </>
              ) : (
                <>
                  <ShieldX className="h-5 w-5 text-destructive" />
                  {t('admin.users.dialogs.revokeAdmin.title')}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {adminRoleDialog.action === "grant" ? (
                <>
                  {t('admin.users.dialogs.grantAdmin.description')} <strong>{adminRoleDialog.userName}</strong> ?
                  <br />
                  <span className="text-warning">{t('admin.users.dialogs.grantAdmin.warning')}</span>
                </>
              ) : (
                <>
                  {t('admin.users.dialogs.revokeAdmin.description')} <strong>{adminRoleDialog.userName}</strong> ?
                  <br />
                  <span className="text-warning">{t('admin.users.dialogs.revokeAdmin.warning')}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setAdminRoleDialog({ open: false, userId: "", userName: "", action: "grant" })}>
              {t('common.cancel')}
            </Button>
            <Button 
              variant={adminRoleDialog.action === "revoke" ? "destructive" : "default"}
              onClick={handleAdminRole}
              disabled={grantOwnerRole.isPending || revokeOwnerRole.isPending}
            >
              {(grantOwnerRole.isPending || revokeOwnerRole.isPending) 
                ? "..." 
                : t('admin.users.dialogs.grantAdmin.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

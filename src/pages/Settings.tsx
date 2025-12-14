import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  User,
  Building,
  Wallet,
  Bell,
  Plus,
  X,
  LogOut,
  Sun,
  Moon,
  Mail,
  Calendar,
  CreditCard,
  Shield,
  Pencil,
  Zap,
  Users,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const settingsTabs = [
  { id: "profile", name: "Profil", icon: User },
  { id: "business", name: "Entreprise", icon: Building },
  { id: "subscription", name: "Abonnement", icon: CreditCard },
  { id: "categories", name: "Catégories", icon: Wallet },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "security", name: "Sécurité", icon: Shield },
];

const defaultCategories = [
  "Outils",
  "Infrastructure",
  "Formation",
  "Marketing",
  "Banque",
  "Transport",
  "Repas",
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [categories, setCategories] = useState(defaultCategories);
  const [newCategory, setNewCategory] = useState("");
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  const removeCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category));
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Déconnexion réussie");
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";
  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "N/A";

  return (
    <AppLayout>
      <div className="flex gap-6 animate-fade-in min-h-[calc(100vh-6rem)]">
        {/* Settings Sidebar */}
        <div className="w-56 flex-shrink-0">
          <div className="sticky top-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wallet className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Paramètres</h1>
            </div>
            
            <nav className="space-y-1">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </nav>

            {/* Theme Toggle */}
            <div className="mt-8 p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <Moon className="h-4 w-4 text-primary" />
                  ) : (
                    <Sun className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {theme === "dark" ? "Sombre" : "Clair"}
                  </span>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              </div>
            </div>

            {/* Logout Button */}
            <Button 
              variant="ghost" 
              className="w-full mt-4 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-3xl">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Profil utilisateur</h2>
                <p className="text-sm text-muted-foreground">
                  Gérez vos informations personnelles et votre compte
                </p>
              </div>

              {/* Profile Card */}
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-card">
                {/* Banner */}
                <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-accent relative">
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 10px,
                        hsl(var(--primary) / 0.1) 10px,
                        hsl(var(--primary) / 0.1) 20px
                      )`
                    }} />
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm border border-border hover:bg-card"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Modifier
                  </Button>
                </div>

                {/* Avatar & Info */}
                <div className="px-6 pb-6">
                  <div className="flex h-20 w-20 -mt-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-3xl font-bold text-white ring-4 ring-card">
                    {userInitial}
                  </div>

                  <div className="mt-4 space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">
                      {user?.email?.split("@")[0] || "Utilisateur"}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {user?.email || "email@exemple.com"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Membre depuis {memberSince}
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Crédits</span>
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        <span className="text-primary">50</span>
                        <span className="text-muted-foreground text-sm"> / 50</span>
                      </p>
                    </div>
                    
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Clients</span>
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-lg font-semibold text-foreground">0</p>
                    </div>
                    
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Jours actifs</span>
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-lg font-semibold text-foreground">1</p>
                    </div>
                    
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Factures</span>
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-lg font-semibold text-foreground">0</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Profile Form */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="text-base font-semibold text-card-foreground mb-4">
                  Informations personnelles
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" placeholder="Jean" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" placeholder="Dupont" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" placeholder="+33 6 12 34 56 78" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={user?.email || ""} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                </div>
                <Button className="mt-4">Enregistrer</Button>
              </div>
            </div>
          )}

          {activeTab === "business" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Entreprise</h2>
                <p className="text-sm text-muted-foreground">
                  Informations de votre activité professionnelle
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company">Nom de l'entreprise</Label>
                    <Input id="company" placeholder="Mon Entreprise" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siret">SIRET</Label>
                    <Input id="siret" placeholder="123 456 789 00012" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input id="address" placeholder="123 Rue Exemple, 75001 Paris" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tva">Numéro TVA</Label>
                    <Input id="tva" placeholder="FR12345678901" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activity">Secteur d'activité</Label>
                    <Input id="activity" placeholder="Conseil, Services, etc." />
                  </div>
                </div>
                <Button className="mt-4">Enregistrer</Button>
              </div>
            </div>
          )}

          {activeTab === "subscription" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Abonnement</h2>
                <p className="text-sm text-muted-foreground">
                  Gérez votre plan et votre facturation
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-muted text-muted-foreground">
                      GRATUIT
                    </span>
                    <h3 className="text-lg font-semibold text-foreground mt-2">Plan Gratuit</h3>
                    <p className="text-sm text-muted-foreground">Fonctionnalités de base</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    50 crédits / mois
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    5 clients maximum
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Tableaux de bord basiques
                  </div>
                </div>

                <Button className="w-full">
                  <Zap className="mr-2 h-4 w-4" />
                  Passer à PRO - 19€/mois
                </Button>
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Catégories de dépenses</h2>
                <p className="text-sm text-muted-foreground">
                  Personnalisez vos catégories de dépenses
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-foreground"
                    >
                      {category}
                      <button
                        onClick={() => removeCategory(category)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Nouvelle catégorie..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addCategory()}
                    className="max-w-xs"
                  />
                  <Button variant="outline" onClick={addCategory}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
                <p className="text-sm text-muted-foreground">
                  Gérez vos alertes et notifications
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Alertes financières</p>
                    <p className="text-sm text-muted-foreground">
                      Notification si 70% du capital est dépensé
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Rappels de tâches</p>
                    <p className="text-sm text-muted-foreground">
                      Notifications pour les tâches du jour
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Factures impayées</p>
                    <p className="text-sm text-muted-foreground">
                      Alertes pour les factures en retard
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Emails marketing</p>
                    <p className="text-sm text-muted-foreground">
                      Nouveautés et offres spéciales
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Sécurité</h2>
                <p className="text-sm text-muted-foreground">
                  Gérez la sécurité de votre compte
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="text-base font-semibold text-card-foreground mb-4">
                  Changer le mot de passe
                </h3>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button>Mettre à jour</Button>
                </div>
              </div>

              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
                <h3 className="text-base font-semibold text-destructive mb-2">
                  Zone dangereuse
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Supprimer définitivement votre compte et toutes vos données.
                </p>
                <Button variant="destructive" size="sm">
                  Supprimer mon compte
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;

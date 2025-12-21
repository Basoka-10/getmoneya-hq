import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrency, ALL_CURRENCY_CONFIGS } from "@/contexts/CurrencyContext";
import { useGuideMode } from "@/components/onboarding/GuideTooltip";
import { useOnboardingTour } from "@/components/onboarding/OnboardingTour";
import { useCategories } from "@/hooks/useCategories";
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
  Zap,
  Users,
  Upload,
  Camera,
  Image,
  Coins,
  Check,
  BookOpen,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const settingsTabs = [
  { id: "profile", name: "Profil", icon: User },
  { id: "business", name: "Entreprise", icon: Building },
  { id: "subscription", name: "Abonnement", icon: Crown },
  { id: "currency", name: "Devise", icon: Coins },
  { id: "categories", name: "Catégories", icon: Wallet },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "security", name: "Sécurité", icon: Shield },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [newExpenseCategory, setNewExpenseCategory] = useState("");
  const [newIncomeCategory, setNewIncomeCategory] = useState("");
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency, currencyConfig, convertFromEUR, isLoading: currencyLoading, refreshRates, supportedCurrencies } = useCurrency();
  const { guideEnabled, setGuideEnabled } = useGuideMode();
  const { resetTour } = useOnboardingTour();
  const {
    expenseCategories,
    incomeCategories,
    addExpenseCategory: addExpenseCat,
    removeExpenseCategory,
    addIncomeCategory: addIncomeCat,
    removeIncomeCategory,
  } = useCategories();

  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  // Business state
  const [companyName, setCompanyName] = useState("");
  const [siret, setSiret] = useState("");
  const [address, setAddress] = useState("");
  const [tva, setTva] = useState("");
  const [activity, setActivity] = useState("");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const addExpenseCategory = () => {
    if (addExpenseCat(newExpenseCategory)) {
      setNewExpenseCategory("");
      toast.success("Catégorie de dépense ajoutée");
    }
  };

  const handleRemoveExpenseCategory = (category: string) => {
    removeExpenseCategory(category);
    toast.success("Catégorie de dépense supprimée");
  };

  const addIncomeCategory = () => {
    if (addIncomeCat(newIncomeCategory)) {
      setNewIncomeCategory("");
      toast.success("Catégorie de revenu ajoutée");
    }
  };

  const handleRemoveIncomeCategory = (category: string) => {
    removeIncomeCategory(category);
    toast.success("Catégorie de revenu supprimée");
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Déconnexion réussie");
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5 Mo");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
        toast.success("Photo de profil mise à jour");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5 Mo");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
        toast.success("Logo mis à jour");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    toast.success("Profil enregistré");
  };

  const handleSaveBusiness = () => {
    toast.success("Informations entreprise enregistrées");
  };

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const handleCheckout = async (plan: "pro" | "business") => {
    if (!user?.email) {
      toast.error("Veuillez vous connecter pour souscrire");
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || ''}/functions/v1/payplug-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
        },
        body: JSON.stringify({
          plan,
          userEmail: user.email,
          userName: firstName && lastName ? `${firstName} ${lastName}` : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création du paiement");
      }

      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error("URL de paiement non reçue");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors du paiement");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";
  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "N/A";

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row gap-6 animate-fade-in min-h-[calc(100vh-6rem)]">
        {/* Settings Sidebar */}
        <div className="w-full md:w-56 flex-shrink-0">
          <div className="md:sticky md:top-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wallet className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Paramètres</h1>
            </div>
            
            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 md:space-y-1">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 md:gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{tab.name}</span>
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
                </div>

                {/* Avatar & Info */}
                <div className="px-6 pb-6">
                  <div className="relative -mt-10 w-fit">
                    <div 
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-3xl font-bold text-white ring-4 ring-card overflow-hidden"
                    >
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        userInitial
                      )}
                    </div>
                    <button
                      onClick={() => profileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                    <input
                      ref={profileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                      className="hidden"
                    />
                  </div>

                  <div className="mt-4 space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">
                      {firstName && lastName ? `${firstName} ${lastName}` : user?.email?.split("@")[0] || "Utilisateur"}
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Plan</span>
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-primary">Plan Gratuit</p>
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
                    <Input 
                      id="firstName" 
                      placeholder="Jean" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Dupont" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input 
                      id="phone" 
                      placeholder="+33 6 12 34 56 78" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
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
                <Button className="mt-4" onClick={handleSaveProfile}>Enregistrer</Button>
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

              {/* Company Logo */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="text-base font-semibold text-card-foreground mb-4">
                  Logo de l'entreprise
                </h3>
                <div className="flex items-center gap-6">
                  <div 
                    className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {companyLogo ? (
                      <img src={companyLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <Image className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" onClick={() => logoInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      {companyLogo ? "Changer le logo" : "Télécharger un logo"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG ou SVG. Max 5 Mo.
                    </p>
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="text-base font-semibold text-card-foreground mb-4">
                  Informations légales
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company">Nom de l'entreprise</Label>
                    <Input 
                      id="company" 
                      placeholder="Mon Entreprise" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siret">SIRET</Label>
                    <Input 
                      id="siret" 
                      placeholder="123 456 789 00012" 
                      value={siret}
                      onChange={(e) => setSiret(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input 
                      id="address" 
                      placeholder="123 Rue Exemple, 75001 Paris" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tva">Numéro TVA</Label>
                    <Input 
                      id="tva" 
                      placeholder="FR12345678901" 
                      value={tva}
                      onChange={(e) => setTva(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activity">Secteur d'activité</Label>
                    <Input 
                      id="activity" 
                      placeholder="Conseil, Services, etc." 
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                    />
                  </div>
                </div>
                <Button className="mt-4" onClick={handleSaveBusiness}>Enregistrer</Button>
              </div>
            </div>
          )}

          {activeTab === "subscription" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Abonnement</h2>
                <p className="text-sm text-muted-foreground">
                  Gérez votre forfait et accédez à plus de fonctionnalités
                </p>
              </div>

              {/* Current Plan */}
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                      <Crown className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Plan Gratuit</h3>
                      <p className="text-sm text-muted-foreground">Actuellement actif</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                    Actif
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <div className="text-center p-3 rounded-lg bg-card border border-border">
                    <p className="text-2xl font-bold text-foreground">3</p>
                    <p className="text-xs text-muted-foreground">Clients max</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-card border border-border">
                    <p className="text-2xl font-bold text-foreground">10</p>
                    <p className="text-xs text-muted-foreground">Factures</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-card border border-border">
                    <p className="text-2xl font-bold text-foreground">10</p>
                    <p className="text-xs text-muted-foreground">Devis</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-card border border-border">
                    <p className="text-2xl font-bold text-foreground">10</p>
                    <p className="text-xs text-muted-foreground">Tâches/sem</p>
                  </div>
                </div>
              </div>

              {/* Upgrade Options */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Pro Plan */}
                <div className="rounded-xl border-2 border-primary bg-card p-6 shadow-card relative">
                  <span className="absolute -top-3 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Populaire
                  </span>
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Pro</h3>
                      <p className="text-2xl font-bold text-primary">7€<span className="text-sm font-normal text-muted-foreground">/mois</span></p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="h-4 w-4 text-primary" /> 20 clients
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="h-4 w-4 text-primary" /> 40 factures & devis
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="h-4 w-4 text-primary" /> Tâches illimitées
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="h-4 w-4 text-primary" /> Export PDF/CSV
                    </li>
                  </ul>
                  <Button className="w-full" onClick={() => handleCheckout("pro")} disabled={isCheckoutLoading}>
                    {isCheckoutLoading ? "Chargement..." : "Passer à Pro"}
                  </Button>
                </div>

                {/* Business Plan */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <div className="flex items-center gap-3 mb-4">
                    <Building className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Business</h3>
                      <p className="text-2xl font-bold text-foreground">17€<span className="text-sm font-normal text-muted-foreground">/mois</span></p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="h-4 w-4 text-primary" /> Clients illimités
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="h-4 w-4 text-primary" /> Factures & devis illimités
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="h-4 w-4 text-primary" /> Analytics avancés
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="h-4 w-4 text-primary" /> Priorité performance
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" onClick={() => handleCheckout("business")} disabled={isCheckoutLoading}>
                    {isCheckoutLoading ? "Chargement..." : "Choisir Business"}
                  </Button>
                </div>
              </div>
            </div>
          )}

{activeTab === "categories" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Catégories</h2>
                <p className="text-sm text-muted-foreground">
                  Personnalisez vos catégories de revenus et de dépenses
                </p>
              </div>

              {/* Income Categories */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="text-base font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  Catégories de revenus
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {incomeCategories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-sm font-medium"
                    >
                      {category}
                      <button
                        onClick={() => handleRemoveIncomeCategory(category)}
                        className="text-primary/60 hover:text-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Nouvelle catégorie de revenu..."
                    value={newIncomeCategory}
                    onChange={(e) => setNewIncomeCategory(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addIncomeCategory()}
                    className="max-w-xs"
                  />
                  <Button variant="outline" onClick={addIncomeCategory}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter
                  </Button>
                </div>
              </div>

              {/* Expense Categories */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="text-base font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-destructive" />
                  Catégories de dépenses
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {expenseCategories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-foreground"
                    >
                      {category}
                      <button
                        onClick={() => handleRemoveExpenseCategory(category)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Nouvelle catégorie de dépense..."
                    value={newExpenseCategory}
                    onChange={(e) => setNewExpenseCategory(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addExpenseCategory()}
                    className="max-w-xs"
                  />
                  <Button variant="outline" onClick={addExpenseCategory}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "currency" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Devise</h2>
                <p className="text-sm text-muted-foreground">
                  Sélectionnez la devise principale pour votre compte
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="text-base font-semibold text-card-foreground mb-4">
                  Devise principale
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Cette devise sera utilisée pour afficher tous les montants dans l'application et les documents générés.
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Sélectionner une devise</Label>
                    <Select
                      value={currency}
                      onValueChange={async (value: string) => {
                        await setCurrency(value);
                        toast.success(`Devise changée en ${ALL_CURRENCY_CONFIGS[value]?.name || value}`);
                      }}
                    >
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue placeholder="Sélectionner une devise" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedCurrencies.map((code) => {
                          const curr = ALL_CURRENCY_CONFIGS[code];
                          return curr ? (
                            <SelectItem key={code} value={code}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{curr.symbol}</span>
                                <span>{curr.name}</span>
                              </div>
                            </SelectItem>
                          ) : null;
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Currency Preview */}
                  <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Aperçu de l'affichage</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Coins className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Montant exemple</p>
                          <p className="text-lg font-semibold text-foreground">
                            {currency === "USD" 
                              ? `${currencyConfig.symbol}${(1234.56).toLocaleString(currencyConfig.locale)}`
                              : `${(1234.56).toLocaleString(currencyConfig.locale)} ${currencyConfig.symbol}`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Currency list with visual selection */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="text-base font-semibold text-card-foreground mb-4">
                  Devises disponibles
                </h3>
                <div className="grid gap-3">
                  {supportedCurrencies.map((code) => {
                    const curr = ALL_CURRENCY_CONFIGS[code];
                    if (!curr) return null;
                    return (
                      <button
                        key={code}
                        onClick={async () => {
                          await setCurrency(code);
                          toast.success(`Devise changée en ${curr.name}`);
                        }}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg border transition-all",
                          currency === code
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center text-lg font-bold",
                            currency === code
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {curr.symbol}
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-foreground">{curr.name}</p>
                            <p className="text-sm text-muted-foreground">{code}</p>
                          </div>
                        </div>
                        {currency === code && (
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conversion Rates */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-card-foreground">
                    Taux de conversion en temps réel
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshRates}
                    disabled={currencyLoading}
                  >
                    {currencyLoading ? "Actualisation..." : "Actualiser"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Taux de change actuels via l'API ExchangeRate
                </p>
                
                <div className="space-y-4">
                  {/* Example amount conversion */}
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <p className="text-sm text-muted-foreground mb-3">
                      Conversion en temps réel : 100 EUR =
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className={cn(
                        "p-3 rounded-lg border",
                        currency === "EUR" ? "border-primary bg-primary/5" : "border-border bg-card"
                      )}>
                        <p className="text-xs text-muted-foreground">Euro</p>
                        <p className="text-lg font-semibold text-foreground">100,00 €</p>
                      </div>
                      <div className={cn(
                        "p-3 rounded-lg border",
                        currency === "USD" ? "border-primary bg-primary/5" : "border-border bg-card"
                      )}>
                        <p className="text-xs text-muted-foreground">US Dollar</p>
                        <p className="text-lg font-semibold text-foreground">
                          ${currency === "USD" ? convertFromEUR(100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "~108,00"}
                        </p>
                      </div>
                      <div className={cn(
                        "p-3 rounded-lg border",
                        currency === "XOF" ? "border-primary bg-primary/5" : "border-border bg-card"
                      )}>
                        <p className="text-xs text-muted-foreground">Franc CFA</p>
                        <p className="text-lg font-semibold text-foreground">
                          {currency === "XOF" ? convertFromEUR(100).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "~65 596"} FCFA
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Les taux sont mis à jour automatiquement via l'API ExchangeRate
                  </p>
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

              {/* Tutoriel */}
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 shadow-card">
                <h3 className="text-base font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Tutoriel de l'application
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Découvrez toutes les fonctionnalités de MONEYA avec notre guide interactif étape par étape.
                </p>
                <Button onClick={resetTour} variant="outline" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Revoir le tutoriel
                </Button>
              </div>

              {/* Guide Mode */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="text-base font-semibold text-card-foreground mb-4">
                  Mode Guide
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Activer les conseils</p>
                    <p className="text-sm text-muted-foreground">
                      Affiche des bulles d'aide pour vous guider dans l'utilisation de l'application
                    </p>
                  </div>
                  <Switch 
                    checked={guideEnabled} 
                    onCheckedChange={setGuideEnabled}
                  />
                </div>
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
                    <p className="text-sm font-medium text-foreground">Résumé hebdomadaire</p>
                    <p className="text-sm text-muted-foreground">
                      Récapitulatif chaque lundi matin
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <Input id="currentPassword" type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input id="newPassword" type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input id="confirmPassword" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <Button className="mt-4">Mettre à jour</Button>
              </div>

              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
                <h3 className="text-base font-semibold text-destructive mb-2">
                  Zone dangereuse
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  La suppression de votre compte est irréversible et entraînera la perte de toutes vos données.
                </p>
                <Button variant="destructive">
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

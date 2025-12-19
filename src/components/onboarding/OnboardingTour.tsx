import { useState, useEffect } from "react";
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  LayoutDashboard, 
  Wallet, 
  BarChart3, 
  Users, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Settings,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const tourSteps: TourStep[] = [
  {
    title: "Bienvenue sur MONEYA",
    description: "Votre centre de contrôle pour gérer votre activité d'entrepreneur. Découvrons ensemble les fonctionnalités principales.",
    icon: <Sparkles className="h-12 w-12 text-primary" />,
    features: [
      "Gérez vos finances en un coup d'œil",
      "Suivez vos clients et projets",
      "Créez des factures professionnelles",
      "Organisez votre planning"
    ]
  },
  {
    title: "Tableau de bord",
    description: "Vue d'ensemble de votre activité avec les indicateurs clés de performance.",
    icon: <LayoutDashboard className="h-12 w-12 text-primary" />,
    features: [
      "Solde total et évolution",
      "Revenus et dépenses du mois",
      "Factures en attente",
      "Tâches urgentes à traiter"
    ]
  },
  {
    title: "Finances",
    description: "Enregistrez et catégorisez tous vos mouvements financiers.",
    icon: <Wallet className="h-12 w-12 text-primary" />,
    features: [
      "Ajoutez revenus et dépenses",
      "Gérez votre épargne",
      "Catégories personnalisables",
      "Export CSV pour comptabilité"
    ]
  },
  {
    title: "Analyses",
    description: "Visualisez vos données pour prendre les meilleures décisions.",
    icon: <BarChart3 className="h-12 w-12 text-primary" />,
    features: [
      "Graphiques de tendances",
      "Répartition par catégorie",
      "Comparaison mensuelle",
      "Prévisions financières"
    ]
  },
  {
    title: "Clients",
    description: "Centralisez toutes les informations de vos clients.",
    icon: <Users className="h-12 w-12 text-primary" />,
    features: [
      "Fiche client complète",
      "Historique des échanges",
      "Statut (actif, prospect, ancien)",
      "Lien avec factures et tâches"
    ]
  },
  {
    title: "Tâches",
    description: "Organisez votre travail et ne manquez aucune deadline.",
    icon: <CheckSquare className="h-12 w-12 text-primary" />,
    features: [
      "Liste de tâches par priorité",
      "Date d'échéance",
      "Association à un client",
      "Marquage terminé"
    ]
  },
  {
    title: "Calendrier",
    description: "Planifiez vos rendez-vous et événements importants.",
    icon: <Calendar className="h-12 w-12 text-primary" />,
    features: [
      "Vue mensuelle/hebdomadaire",
      "Événements colorés par type",
      "Rappels de rendez-vous",
      "Synchronisation des tâches"
    ]
  },
  {
    title: "Facturation",
    description: "Créez des factures et devis professionnels en quelques clics.",
    icon: <FileText className="h-12 w-12 text-primary" />,
    features: [
      "Factures personnalisées",
      "Devis convertibles en factures",
      "Suivi des paiements",
      "Export PDF"
    ]
  },
  {
    title: "Paramètres",
    description: "Personnalisez MONEYA selon vos préférences.",
    icon: <Settings className="h-12 w-12 text-primary" />,
    features: [
      "Profil et informations",
      "Devise préférée",
      "Thème clair/sombre",
      "Logo de votre entreprise"
    ]
  }
];

export function OnboardingTour() {
  const { user } = useAuth();
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Check if user has completed the tour
    const completed = localStorage.getItem("moneya_tour_completed");
    if (!completed) {
      // Show tour after a short delay
      setTimeout(() => setShowTour(true), 1500);
    }
  }, [user]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("moneya_tour_completed", "true");
    setShowTour(false);
  };

  const handleSkip = () => {
    localStorage.setItem("moneya_tour_completed", "true");
    setShowTour(false);
  };

  if (!showTour || !user) return null;

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md p-4">
      <Card className="w-full max-w-lg border-primary/20 bg-card shadow-2xl animate-scale-in">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Étape {currentStep + 1} sur {tourSteps.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -mr-2"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Icon and Title */}
          <div className="text-center py-4">
            <div className="flex justify-center mb-4">
              <div className="p-5 rounded-2xl bg-primary/10 animate-pulse-slow">
                {step.icon}
              </div>
            </div>
            <CardTitle className="text-2xl mb-3">{step.title}</CardTitle>
            <p className="text-muted-foreground">{step.description}</p>
          </div>

          {/* Features List */}
          <div className="space-y-3">
            {step.features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {index + 1}
                </div>
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-1.5 py-2">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? "w-6 bg-primary" 
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-2">
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>
            )}
            <Button 
              className="flex-1"
              onClick={handleNext}
            >
              {currentStep < tourSteps.length - 1 ? (
                <>
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Commencer
                </>
              )}
            </Button>
          </div>

          {/* Skip Link */}
          {currentStep < tourSteps.length - 1 && (
            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground text-sm"
              onClick={handleSkip}
            >
              Passer le tutoriel
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to manually trigger the tour
export function useOnboardingTour() {
  const resetTour = () => {
    localStorage.removeItem("moneya_tour_completed");
    window.location.reload();
  };

  return { resetTour };
}

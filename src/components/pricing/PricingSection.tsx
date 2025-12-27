import { useState } from "react";
import { Check, X, Sparkles, Crown, Building2, Flame, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PricingPlan {
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  icon: React.ReactNode;
  features: { name: string; included: boolean }[];
  popular?: boolean;
  promo?: boolean;
  buttonText: string;
  buttonVariant?: "default" | "outline" | "secondary";
}

type BillingPeriod = "monthly" | "yearly";

const plansData: Record<BillingPeriod, PricingPlan[]> = {
  monthly: [
    {
      name: "Gratuit",
      price: "0 FCFA",
      period: "/mois",
      description: "Parfait pour démarrer",
      icon: <Sparkles className="h-6 w-6" />,
      features: [
        { name: "3 clients maximum", included: true },
        { name: "10 factures", included: true },
        { name: "10 devis", included: true },
        { name: "10 tâches / semaine", included: true },
        { name: "Export PDF/CSV", included: false },
        { name: "Historique étendu", included: false },
        { name: "Analytics avancés", included: false },
      ],
      buttonText: "Commencer gratuitement",
      buttonVariant: "outline",
    },
    {
      name: "Pro",
      price: "2 000 FCFA",
      period: "/mois",
      description: "Pour les freelances actifs",
      icon: <Crown className="h-6 w-6" />,
      features: [
        { name: "20 clients", included: true },
        { name: "40 factures & devis", included: true },
        { name: "Tâches illimitées", included: true },
        { name: "Export PDF/CSV", included: true },
        { name: "Historique 6 mois", included: true },
        { name: "Analytics avancés", included: false },
      ],
      popular: true,
      buttonText: "Choisir Pro",
      buttonVariant: "default",
    },
    {
      name: "Business",
      price: "4 500 FCFA",
      period: "/mois",
      description: "Pour les agences & gros volumes",
      icon: <Building2 className="h-6 w-6" />,
      features: [
        { name: "Clients illimités", included: true },
        { name: "Factures & devis illimités", included: true },
        { name: "Tâches illimitées", included: true },
        { name: "Export PDF/CSV", included: true },
        { name: "Historique 1 an", included: true },
        { name: "Analytics avancés", included: true },
        { name: "Priorité performance", included: true },
      ],
      buttonText: "Choisir Business",
      buttonVariant: "secondary",
    },
  ],
  yearly: [
    {
      name: "Gratuit",
      price: "0 FCFA",
      period: "/an",
      description: "Parfait pour démarrer",
      icon: <Sparkles className="h-6 w-6" />,
      features: [
        { name: "3 clients maximum", included: true },
        { name: "10 factures", included: true },
        { name: "10 devis", included: true },
        { name: "10 tâches / semaine", included: true },
        { name: "Export PDF/CSV", included: false },
        { name: "Historique étendu", included: false },
        { name: "Analytics avancés", included: false },
      ],
      buttonText: "Commencer gratuitement",
      buttonVariant: "outline",
    },
    {
      name: "Pro",
      price: "6 500 FCFA",
      originalPrice: "24 000 FCFA",
      period: "/an",
      description: "Pour les freelances actifs",
      icon: <Crown className="h-6 w-6" />,
      features: [
        { name: "20 clients", included: true },
        { name: "40 factures & devis", included: true },
        { name: "Tâches illimitées", included: true },
        { name: "Export PDF/CSV", included: true },
        { name: "Historique 6 mois", included: true },
        { name: "Analytics avancés", included: false },
      ],
      popular: true,
      promo: true,
      buttonText: "Profiter de l'offre",
      buttonVariant: "default",
    },
    {
      name: "Business",
      price: "19 500 FCFA",
      originalPrice: "54 000 FCFA",
      period: "/an",
      description: "Pour les agences & gros volumes",
      icon: <Building2 className="h-6 w-6" />,
      features: [
        { name: "Clients illimités", included: true },
        { name: "Factures & devis illimités", included: true },
        { name: "Tâches illimitées", included: true },
        { name: "Export PDF/CSV", included: true },
        { name: "Historique 1 an", included: true },
        { name: "Analytics avancés", included: true },
        { name: "Priorité performance", included: true },
      ],
      promo: true,
      buttonText: "Profiter de l'offre",
      buttonVariant: "secondary",
    },
  ],
};

interface PricingSectionProps {
  onSelectPlan?: (plan: string) => void;
  variant?: "landing" | "app";
}

export function PricingSection({ onSelectPlan, variant = "landing" }: PricingSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("yearly");
  const isLanding = variant === "landing";
  const plans = plansData[billingPeriod];

  return (
    <section className={cn(
      "py-24 px-4 sm:px-6 lg:px-8",
      isLanding ? "bg-[#0d0d0d]" : "bg-background"
    )}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className={cn(
            "text-3xl sm:text-4xl lg:text-5xl font-bold mb-4",
            isLanding ? "text-white" : "text-foreground"
          )}>
            Choisissez votre offre
          </h2>
          <p className={cn(
            "text-lg max-w-2xl mx-auto mb-8",
            isLanding ? "text-white/60" : "text-muted-foreground"
          )}>
            Des forfaits adaptés à chaque étape de votre croissance
          </p>

          {/* Promo Banner */}
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 animate-pulse",
            isLanding ? "bg-orange-500/20 border border-orange-500/30" : "bg-orange-500/10 border border-orange-500/20"
          )}>
            <Flame className="h-4 w-4 text-orange-500" />
            <span className={cn("text-sm font-medium", isLanding ? "text-orange-400" : "text-orange-600")}>
              🎉 Promo fin d'année — Jusqu'à 85% de réduction !
            </span>
            <Clock className="h-4 w-4 text-orange-500" />
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={cn(
              "inline-flex items-center p-1 rounded-full",
              isLanding ? "bg-[#1a1a1a] border border-white/10" : "bg-muted border border-border"
            )}>
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  billingPeriod === "monthly"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : isLanding ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                  billingPeriod === "yearly"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : isLanding ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Annuel
                {billingPeriod !== "yearly" && (
                  <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5">-85%</Badge>
                )}
              </button>
            </div>
          </div>

          {/* Promo Info */}
          {billingPeriod === "yearly" && (
            <div className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-2 text-sm",
              isLanding ? "text-white/50" : "text-muted-foreground"
            )}>
              <span className="flex items-center gap-1">
                <span className="text-orange-500">🔥</span>
                Pour les 100 premiers utilisateurs
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Valable jusqu'au 5 janvier 2026</span>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Card 
              key={`${billingPeriod}-${plan.name}`}
              className={cn(
                "relative transition-all duration-300 hover:scale-[1.02]",
                isLanding 
                  ? "bg-[#111] border-white/10 hover:border-primary/50" 
                  : "bg-card border-border hover:border-primary/50",
                plan.popular && "ring-2 ring-primary shadow-lg shadow-primary/20",
                plan.promo && "ring-2 ring-orange-500/50 shadow-lg shadow-orange-500/10"
              )}
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 100}ms both`
              }}
            >
              {/* Badges */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-2">
                {plan.popular && !plan.promo && (
                  <Badge className="bg-primary text-primary-foreground">
                    Le plus populaire
                  </Badge>
                )}
                {plan.promo && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 animate-pulse">
                    <Flame className="h-3 w-3 mr-1" />
                    Promo -85%
                  </Badge>
                )}
              </div>
              
              <CardHeader className="text-center pb-2">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4",
                  plan.promo 
                    ? "bg-orange-500/10 border border-orange-500/20 text-orange-500"
                    : isLanding 
                      ? "bg-primary/10 border border-primary/20 text-primary" 
                      : "bg-primary/10 text-primary"
                )}>
                  {plan.icon}
                </div>
                <CardTitle className={cn(
                  "text-2xl",
                  isLanding ? "text-white" : "text-foreground"
                )}>
                  {plan.name}
                </CardTitle>
                <CardDescription className={isLanding ? "text-white/60" : ""}>
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-center">
                  {plan.originalPrice && (
                    <span className={cn(
                      "text-lg line-through mr-2",
                      isLanding ? "text-white/40" : "text-muted-foreground"
                    )}>
                      {plan.originalPrice}
                    </span>
                  )}
                  <span className={cn(
                    "text-4xl font-bold",
                    plan.promo ? "text-orange-500" : (isLanding ? "text-white" : "text-foreground")
                  )}>
                    {plan.price}
                  </span>
                  <span className={cn(
                    "text-lg",
                    isLanding ? "text-white/60" : "text-muted-foreground"
                  )}>
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li 
                      key={idx}
                      className={cn(
                        "flex items-center gap-3 text-sm",
                        feature.included 
                          ? (isLanding ? "text-white/80" : "text-foreground")
                          : (isLanding ? "text-white/40" : "text-muted-foreground")
                      )}
                    >
                      {feature.included ? (
                        <Check className={cn("h-4 w-4 flex-shrink-0", plan.promo ? "text-orange-500" : "text-primary")} />
                      ) : (
                        <X className="h-4 w-4 flex-shrink-0 opacity-50" />
                      )}
                      <span className={!feature.included ? "line-through opacity-60" : ""}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={cn(
                    "w-full transition-all duration-200 hover:scale-[1.02]",
                    plan.promo && "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0",
                    plan.popular && !plan.promo && "bg-primary hover:bg-primary/90"
                  )}
                  variant={plan.promo ? "default" : plan.buttonVariant}
                  onClick={() => onSelectPlan?.(plan.name.toLowerCase())}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}

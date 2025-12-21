import { Check, X, Sparkles, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  icon: React.ReactNode;
  features: { name: string; included: boolean }[];
  popular?: boolean;
  buttonText: string;
  buttonVariant?: "default" | "outline" | "secondary";
}

const plans: PricingPlan[] = [
  {
    name: "Gratuit",
    price: "0€",
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
    price: "7€",
    period: "/mois",
    description: "Pour les freelances actifs",
    icon: <Crown className="h-6 w-6" />,
    features: [
      { name: "20 clients", included: true },
      { name: "40 factures", included: true },
      { name: "40 devis", included: true },
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
    price: "17€",
    period: "/mois",
    description: "Pour les agences & gros volumes",
    icon: <Building2 className="h-6 w-6" />,
    features: [
      { name: "Clients illimités", included: true },
      { name: "Factures illimitées", included: true },
      { name: "Devis illimités", included: true },
      { name: "Tâches illimitées", included: true },
      { name: "Export PDF/CSV", included: true },
      { name: "Historique 1 an", included: true },
      { name: "Analytics avancés", included: true },
      { name: "Priorité performance", included: true },
    ],
    buttonText: "Choisir Business",
    buttonVariant: "secondary",
  },
];

interface PricingSectionProps {
  onSelectPlan?: (plan: string) => void;
  variant?: "landing" | "app";
}

export function PricingSection({ onSelectPlan, variant = "landing" }: PricingSectionProps) {
  const isLanding = variant === "landing";

  return (
    <section className={cn(
      "py-24 px-4 sm:px-6 lg:px-8",
      isLanding ? "bg-[#0d0d0d]" : "bg-background"
    )}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className={cn(
            "text-3xl sm:text-4xl lg:text-5xl font-bold mb-4",
            isLanding ? "text-white" : "text-foreground"
          )}>
            Choisissez votre offre
          </h2>
          <p className={cn(
            "text-lg max-w-2xl mx-auto",
            isLanding ? "text-white/60" : "text-muted-foreground"
          )}>
            Des forfaits adaptés à chaque étape de votre croissance
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name}
              className={cn(
                "relative transition-all duration-300 hover:scale-[1.02]",
                isLanding 
                  ? "bg-[#111] border-white/10 hover:border-primary/50" 
                  : "bg-card border-border hover:border-primary/50",
                plan.popular && "ring-2 ring-primary shadow-lg shadow-primary/20"
              )}
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 100}ms both`
              }}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Le plus populaire
                </Badge>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4",
                  isLanding 
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
                  <span className={cn(
                    "text-4xl font-bold",
                    isLanding ? "text-white" : "text-foreground"
                  )}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={cn(
                      "text-lg",
                      isLanding ? "text-white/60" : "text-muted-foreground"
                    )}>
                      {plan.period}
                    </span>
                  )}
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
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
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
                    plan.popular && "bg-primary hover:bg-primary/90"
                  )}
                  variant={plan.buttonVariant}
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

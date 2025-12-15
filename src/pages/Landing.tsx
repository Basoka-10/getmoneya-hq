import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard,
  Users, 
  FileText, 
  CheckSquare, 
  Calendar, 
  Globe,
  ArrowRight,
  Check,
  Shield,
  Smartphone,
  ChevronDown,
  Star,
  CreditCard,
  Settings
} from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Landing = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: LayoutDashboard,
      title: "Suivez vos revenus et dépenses",
      description: "Sans effort, visualisez où va votre argent."
    },
    {
      icon: CheckSquare,
      title: "Organisez vos tâches et votre semaine",
      description: "Planification simple et efficace."
    },
    {
      icon: FileText,
      title: "Créez des devis et factures professionnels",
      description: "Documents PDF de qualité en quelques clics."
    },
    {
      icon: Calendar,
      title: "Utilisez un calendrier interactif",
      description: "Gardez le contrôle de votre planning."
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Créez votre compte gratuitement",
      description: "Inscrivez-vous en quelques secondes — pas de carte bancaire nécessaire."
    },
    {
      number: "2",
      title: "Ajoutez vos données",
      description: "Clients, dépenses, revenus, tâches…"
    },
    {
      number: "3",
      title: "Organisez vos journées",
      description: "Planifiez vos tâches et consultez votre calendrier."
    },
    {
      number: "4",
      title: "Suivez votre activité",
      description: "Visualisez vos chiffres et gérez vos factures et devis."
    }
  ];

  const features = [
    {
      icon: LayoutDashboard,
      title: "Tableau de bord intuitif",
      description: "Vue claire de vos finances et de votre activité."
    },
    {
      icon: Users,
      title: "Gestion des clients",
      description: "Ajoutez et modifiez vos clients facilement."
    },
    {
      icon: FileText,
      title: "Devis & factures",
      description: "Création, conversion et téléchargement PDF pro."
    },
    {
      icon: Calendar,
      title: "Tâches & calendrier",
      description: "Organisez vos jours et votre semaine."
    },
    {
      icon: Globe,
      title: "Devises",
      description: "EUR, USD, XOF — conversions réelles intégrées."
    },
    {
      icon: Settings,
      title: "Paramètres personnalisables",
      description: "Infos perso, infos entreprise, logo."
    }
  ];

  const testimonials = [
    {
      quote: "Grâce à MONEYA, je garde enfin mes chiffres sous contrôle.",
      author: "Entrepreneur",
      rating: 5
    },
    {
      quote: "Organiser mes tâches et mes factures n'a jamais été aussi simple.",
      author: "Freelance",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "Est-ce vraiment gratuit ?",
      answer: "Oui — 100 % gratuit pendant la phase de lancement."
    },
    {
      question: "Puis-je importer mes données ?",
      answer: "Oui — les importations seront disponibles très bientôt."
    },
    {
      question: "Puis-je changer de devise ?",
      answer: "Oui — EUR, USD et CFA avec conversion réelle."
    },
    {
      question: "Puis-je utiliser l'outil sur mobile ?",
      answer: "Oui — l'interface est entièrement responsive."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold">MONEYA</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-white/70">
              <a href="#fonctionnalites" className="hover:text-white transition-colors">Fonctionnalités</a>
              <a href="#comment" className="hover:text-white transition-colors">Comment ça marche</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </div>
            <Button 
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90 rounded-full px-6"
            >
              Inscription
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-full mb-8">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-white/80 text-sm">100% gratuit pendant la phase de lancement</span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Pilotez votre{" "}
            <span className="relative inline-block">
              business
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8C50 2 150 2 198 8" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </span>
            <br />
            depuis un seul outil
          </h1>
          
          <p className="text-lg sm:text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Clients, finances, tâches, devis et factures au même endroit — 100 % gratuit en phase de lancement.
          </p>
          
          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 rounded-full group"
            >
              <ArrowRight className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              Commencer gratuitement
            </Button>
            
            {/* Trust Indicators */}
            <div className="flex items-center gap-6 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Sans engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-white/50" />
                <span>Sans carte bancaire</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Et si on vous disait que vous pouviez{" "}
              <span className="text-white/50">gérer votre activité simplement...</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="p-6 bg-[#111] border border-white/10 rounded-2xl hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-white/60">{benefit.description}</p>
              </div>
            ))}
          </div>
          
          <p className="text-center text-primary mt-10 text-lg">
            Tout est GRATUIT pour l'instant — aucune carte requise.
          </p>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="comment" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Comment ça marche ?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-7xl font-bold text-primary/20 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-white/60">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold italic">
              Fonctionnalités principales
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-6 bg-[#111] border border-white/10 rounded-2xl hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0d0d0d]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Smartphone className="h-4 w-4 text-primary" />
            <span className="text-primary text-sm font-medium">100% responsive</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Utilisez MONEYA partout
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            MONEYA est optimisé pour mobile et desktop — suivez votre activité où que vous soyez.
          </p>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Votre confidentialité est essentielle
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Vos données sont stockées en toute sécurité et ne sont jamais utilisées sans votre consentement.
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold italic">
              Ils l'adorent, pourquoi pas vous ?
            </h2>
          </div>
          <div className="text-center mb-12">
            <p className="text-white/60 mb-6">Un seul outil, aucune dépense dispersée, toute votre activité devant vous.</p>
            <Button 
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90 rounded-full px-6"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="p-6 bg-[#111] border border-white/10 rounded-2xl"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-white/80 mb-4 italic">"{testimonial.quote}"</p>
                <p className="text-primary font-medium">— {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Vous avez des questions ? On vous répond ici
            </h2>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-white/10 rounded-xl px-6 bg-[#111]"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="text-lg font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-white/60 pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0d0d0d] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold italic mb-6">
            Commencez gratuitement
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            Pilotez votre business depuis un seul outil. Créez votre compte et démarrez maintenant.
          </p>
          
          {/* Trust Avatars */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/50 to-primary border-2 border-[#0a0a0a]"
                />
              ))}
            </div>
            <div className="flex items-center gap-1 ml-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <span className="text-white/60 text-sm ml-1">Recommandé par les entrepreneurs</span>
          </div>
          
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 rounded-full group"
          >
            <ArrowRight className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            Commencer gratuitement
          </Button>
          
          <p className="text-white/40 text-sm mt-4 flex items-center justify-center gap-2">
            Aucune carte de crédit requise
            <CreditCard className="h-4 w-4" />
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <span className="text-lg font-bold">MONEYA</span>
            </div>
            
            <p className="text-white/40 text-sm">
              Outil tout-en-un pour entrepreneurs — gérez votre activité simplement.
            </p>
            
            <p className="text-white/40 text-sm">
              © 2024 MONEYA. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

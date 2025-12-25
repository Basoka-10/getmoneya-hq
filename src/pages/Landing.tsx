import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PromoPopup } from "@/components/landing/PromoPopup";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PricingSection } from "@/components/pricing/PricingSection";
import { AppPreviewSection } from "@/components/landing/AppPreviewSection";
import logo from "@/assets/logo.png";
import avatarTestimonial1 from '@/assets/avatar-testimonial-1.png';
import avatarTestimonial2 from '@/assets/avatar-testimonial-2.png';
import avatarTestimonial3 from '@/assets/avatar-testimonial-3.png';
import avatarTestimonial4 from '@/assets/avatar-testimonial-4.png';

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  const benefits = [
    {
      icon: LayoutDashboard,
      title: "Suivez vos revenus, dépenses et épargnes",
      description: "Sans effort, visualisez où va votre argent et épargnez intelligemment."
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
      rating: 5,
      avatar: avatarTestimonial1
    },
    {
      quote: "Organiser mes tâches et mes factures n'a jamais été aussi simple.",
      author: "Freelance",
      rating: 5,
      avatar: avatarTestimonial2
    }
  ];

  const faqs = [
    {
      question: "Quelle est la différence entre les offres ?",
      answer: "L'offre Gratuite permet de découvrir MONEYA avec 3 clients et 10 factures/devis. Pro (2,99€/mois ou 10€/an en promo) débloque 20 clients, 40 factures et exports. Business (6,99€/mois ou 30€/an en promo) offre tout en illimité. Promotion valable jusqu'au 5 janvier 2026 !"
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
      {/* Promo Popup */}
      <PromoPopup onAccept={() => navigate("/auth")} />

      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logo} alt="MONEYA" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold">MONEYA</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-white/70">
              <a href="#fonctionnalites" className="hover:text-white transition-colors">Fonctionnalités</a>
              <a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a>
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-full mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-white/80 text-sm">Le seul outil au monde où tout y est</span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Pilotez votre{" "}
            <span className="relative inline-block">
              business
              <svg className="absolute -bottom-2 left-0 w-full animate-scale-in" style={{ animationDelay: "0.6s" }} viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8C50 2 150 2 198 8" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </span>
            <br />
            depuis un seul outil
          </h1>
          
          <p className="text-lg sm:text-xl text-white/60 mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Clients, finances, tâches, devis et factures au même endroit — commencez gratuitement.
          </p>
          
          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 rounded-full group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/25"
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

      {/* App Preview Section */}
      <AppPreviewSection />

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
                className="p-6 bg-[#111] border border-white/10 rounded-2xl hover:border-primary/50 transition-all duration-300 group hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-white/60">{benefit.description}</p>
              </div>
            ))}
          </div>
          
          <p className="text-center text-primary mt-10 text-lg">
            Commencez gratuitement — aucune carte requise.
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
              <div 
                key={index} 
                className="relative animate-fade-in group"
                style={{ animationDelay: `${0.15 * index}s` }}
              >
                <div className="text-7xl font-bold text-primary/20 mb-4 group-hover:text-primary/40 transition-colors duration-300">{step.number}</div>
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
                className="flex items-start gap-4 p-6 bg-[#111] border border-white/10 rounded-2xl hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${0.08 * index}s` }}
              >
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform">
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

      {/* Pricing Section */}
      <section id="tarifs">
        <PricingSection onSelectPlan={() => navigate("/auth")} variant="landing" />
      </section>
      {/* RGPD / Privacy Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Votre confidentialité est essentielle
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Vos données sont stockées en toute sécurité et ne sont jamais utilisées sans votre consentement.
            </p>
          </div>

          {/* RGPD Cards */}
          <div className="bg-gradient-to-r from-[#0d2818] via-[#0d1f1a] to-[#0d1f1a] border border-primary/20 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 - Confidentialité Garantie */}
              <div className="text-center">
                <div className="w-14 h-14 bg-[#1a3a2a] border border-primary/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <div className="text-2xl">🇪🇺</div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Confidentialité Garantie</h3>
                <p className="text-white/60 text-sm">
                  Vos données ne sont jamais utilisées pour entraîner nos modèles IA ou partagées avec des tiers.
                </p>
              </div>

              {/* Card 2 - Conformité Mondiale */}
              <div className="text-center">
                <div className="w-14 h-14 bg-[#1a3a2a] border border-primary/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Conformité Mondiale</h3>
                <p className="text-white/60 text-sm">
                  Respecte les réglementations RGPD, CCPA et autres lois sur la protection des données.
                </p>
              </div>

              {/* Card 3 - Confiance Totale */}
              <div className="text-center">
                <div className="w-14 h-14 bg-[#1a3a2a] border border-primary/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Confiance Totale</h3>
                <p className="text-white/60 text-sm">
                  Transparence complète avec notre politique de confidentialité accessible.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-10">
              <p className="text-white/60 mb-4">
                Découvrez notre engagement envers la sécurité et la conformité.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/politique-confidentialite")}
                className="border-white/20 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-xl px-6"
              >
                <FileText className="mr-2 h-4 w-4" />
                Consulter la politique de confidentialité
              </Button>
            </div>
          </div>
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
                className="p-6 bg-[#111] border border-white/10 rounded-2xl hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                style={{ animationDelay: `${0.15 * index}s` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500 animate-scale-in" style={{ animationDelay: `${0.1 * i}s` }} />
                  ))}
                </div>
                <p className="text-white/80 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={testimonial.avatar} alt={testimonial.author} className="w-10 h-10 rounded-full object-cover" />
                  <p className="text-primary font-medium">— {testimonial.author}</p>
                </div>
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
              <img src={avatarTestimonial1} alt="Utilisateur" className="w-8 h-8 rounded-full object-cover border-2 border-[#0a0a0a]" />
              <img src={avatarTestimonial2} alt="Utilisateur" className="w-8 h-8 rounded-full object-cover border-2 border-[#0a0a0a]" />
              <img src={avatarTestimonial3} alt="Utilisateur" className="w-8 h-8 rounded-full object-cover border-2 border-[#0a0a0a]" />
              <img src={avatarTestimonial4} alt="Utilisateur" className="w-8 h-8 rounded-full object-cover border-2 border-[#0a0a0a]" />
            </div>
            <div className="flex items-center gap-1 ml-2">
              {[1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              ))}
              {/* Demi-étoile pour 4.5 */}
              <div className="relative h-4 w-4">
                <Star className="absolute h-4 w-4 text-yellow-500" />
                <div className="absolute overflow-hidden w-1/2 h-full">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                </div>
              </div>
            </div>
            <span className="text-white/60 text-sm ml-1">4.5/5 — Recommandé par les entrepreneurs</span>
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
              <img src={logo} alt="MONEYA" className="w-8 h-8 object-contain" />
              <span className="text-lg font-bold">MONEYA</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-white/40">
              <span>Outil tout-en-un pour entrepreneurs</span>
              <a 
                href="/politique-confidentialite" 
                className="hover:text-white transition-colors underline"
              >
                Politique de confidentialité
              </a>
            </div>
            
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

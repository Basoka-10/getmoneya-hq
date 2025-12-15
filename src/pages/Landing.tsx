import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Wallet, 
  Users, 
  FileText, 
  CheckSquare, 
  Calendar, 
  Settings, 
  Globe,
  ArrowRight,
  Check,
  AlertCircle,
  Smartphone,
  Monitor
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const problems = [
    "Difficulté à suivre ses dépenses",
    "Manque de visibilité sur les revenus",
    "Clients et factures dispersés",
    "Mauvaise organisation des tâches",
    "Outils multiples et non adaptés au contexte africain"
  ];

  const solutions = [
    "Un seul outil pour gérer toute son activité",
    "Vue claire sur les finances",
    "Gestion simple des clients",
    "Organisation quotidienne structurée",
    "Accessible partout, sur ordinateur et mobile"
  ];

  const features = [
    {
      icon: Wallet,
      title: "Gestion financière",
      items: [
        "Ajout de revenus",
        "Ajout de dépenses",
        "Vue globale des finances",
        "Historique clair"
      ]
    },
    {
      icon: Users,
      title: "Clients",
      items: [
        "Création et gestion de clients",
        "Association clients ↔ devis ↔ factures"
      ]
    },
    {
      icon: FileText,
      title: "Devis & factures",
      items: [
        "Création de devis",
        "Conversion devis en facture",
        "Téléchargement PDF professionnel",
        "Envoi au client"
      ]
    },
    {
      icon: CheckSquare,
      title: "Tâches & organisation",
      items: [
        "Création de tâches",
        "Planification journalière et hebdomadaire",
        "Vue calendrier interactive"
      ]
    },
    {
      icon: Settings,
      title: "Paramètres",
      items: [
        "Informations personnelles",
        "Informations entreprise",
        "Logo / photo",
        "Catégories personnalisables",
        "Choix de devise"
      ]
    },
    {
      icon: Globe,
      title: "Devises",
      items: [
        "Euro (EUR)",
        "Dollar (USD)",
        "Franc CFA (XOF)",
        "Conversion selon valeur réelle"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold">MONEYA</span>
            </div>
            <Button 
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90"
            >
              Créer un compte gratuit
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8">
            <span className="text-primary text-sm font-medium">Version bêta gratuite</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Gérez votre activité simplement,{" "}
            <span className="text-primary">au même endroit.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Clients, finances, tâches et organisation quotidienne. MONEYA centralise tout pour vous aider à mieux piloter votre business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
            >
              Créer un compte gratuit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Les défis des entrepreneurs
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Vous reconnaissez-vous dans ces situations ?
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {problems.map((problem, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl"
              >
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <span className="text-white/80">{problem}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              La solution <span className="text-primary">MONEYA</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Un outil tout-en-un qui aide les entrepreneurs à gérer leurs finances, leurs clients et leur organisation quotidienne depuis un seul endroit.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {solutions.map((solution, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-xl"
              >
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-white/90">{solution}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Fonctionnalités
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer votre activité
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 bg-black border border-white/10 rounded-2xl hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <ul className="space-y-2">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-white/70">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessible Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Accessible partout
          </h2>
          <p className="text-white/60 mb-10 max-w-2xl mx-auto">
            Sur ordinateur et mobile, gérez votre activité où que vous soyez.
          </p>
          <div className="flex justify-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                <Monitor className="h-8 w-8 text-primary" />
              </div>
              <span className="text-white/70">Ordinateur</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
              <span className="text-white/70">Mobile</span>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <span className="text-primary text-sm font-medium">Produit en version bêta</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Accès 100% gratuit
          </h2>
          <ul className="space-y-3 text-white/70 mb-10 max-w-md mx-auto">
            <li className="flex items-center gap-3 justify-center">
              <Check className="h-5 w-5 text-primary" />
              <span>Accès gratuit</span>
            </li>
            <li className="flex items-center gap-3 justify-center">
              <Check className="h-5 w-5 text-primary" />
              <span>Fonctionnalités complètes</span>
            </li>
            <li className="flex items-center gap-3 justify-center">
              <Check className="h-5 w-5 text-primary" />
              <span>Aucun paiement requis</span>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Prêt à mieux gérer votre activité ?
          </h2>
          <p className="text-white/60 mb-10 max-w-2xl mx-auto">
            Découvrez MONEYA et commencez à centraliser votre gestion dès maintenant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="text-lg font-bold">MONEYA</span>
          </div>
          <p className="text-white/50 text-sm">
            © 2024 MONEYA. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

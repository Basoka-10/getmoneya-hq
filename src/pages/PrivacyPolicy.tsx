import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <img src={logo} alt="MONEYA" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold">MONEYA</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="text-white/70 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Politique de Confidentialité
          </h1>
          <p className="text-white/40 mb-12">
            Dernière mise à jour : 22 décembre 2025
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-white/80 text-lg leading-relaxed">
              Chez Moneya, nous accordons une importance capitale à la protection de vos données personnelles et au respect de votre vie privée. Cette politique détaille comment nous traitons les informations collectées via notre application PWA.
            </p>

            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">1. Responsable du traitement</h2>
              <p className="text-white/70 leading-relaxed">
                Le responsable du traitement des données est Josué K. Awoesso. Pour toute question relative à vos données, vous pouvez nous contacter à l'adresse suivante : <a href="mailto:awoessojosuek@gmail.com" className="text-primary hover:underline">awoessojosuek@gmail.com</a>.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">2. Données collectées et finalités</h2>
              <p className="text-white/70 leading-relaxed">
                Nous appliquons le principe de minimisation des données. Les seules données collectées sont :
              </p>
              <ul className="list-disc list-inside space-y-3 text-white/70">
                <li>
                  <span className="font-medium text-white">Adresse e-mail :</span> Pour la création de votre compte, votre authentification et la gestion de votre abonnement.
                </li>
                <li>
                  <span className="font-medium text-white">Données d'utilisation technique :</span> Nous utilisons un cookie technique (sidebar:state) uniquement pour mémoriser vos préférences d'affichage (état de la barre latérale) afin d'améliorer votre confort de navigation.
                </li>
              </ul>
              <div className="bg-[#111] border border-white/10 rounded-xl p-4 mt-4">
                <p className="text-white/70 leading-relaxed">
                  <span className="font-medium text-primary">Note sur vos données financières :</span> Les données que vous saisissez (finances, noms de clients, montants) sont stockées de manière sécurisée mais ne sont jamais consultées par notre équipe. Vous en gardez le contrôle total via l'export CSV.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">3. Hébergement et Sécurité</h2>
              <p className="text-white/70 leading-relaxed">
                Vos données sont hébergées en Irlande (Union Européenne) via l'infrastructure Supabase. Ce choix garantit un haut niveau de sécurité et une conformité stricte avec le RGPD.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">4. Partage avec des tiers</h2>
              <p className="text-white/70 leading-relaxed">
                Nous ne vendons, n'échangeons, ni ne transférons vos données personnelles à des tiers. Pour la gestion des paiements, nous utilisons la solution Moneroo. Vos informations bancaires sont traitées directement par ce prestataire sécurisé et ne transitent jamais par nos serveurs.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">5. Vos Droits (RGPD)</h2>
              <p className="text-white/70 leading-relaxed">
                Conformément à la réglementation européenne, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-3 text-white/70">
                <li>
                  <span className="font-medium text-white">Droit d'accès et de portabilité :</span> Vous pouvez exporter vos données financières à tout moment au format CSV.
                </li>
                <li>
                  <span className="font-medium text-white">Droit de suppression :</span> Vous pouvez demander la suppression de votre compte.
                </li>
                <li>
                  <span className="font-medium text-white">Suppression immédiate :</span> En cas de clôture de compte, toutes vos données associées sont supprimées de nos bases de données de manière immédiate et irréversible.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">6. Cookies</h2>
              <p className="text-white/70 leading-relaxed">
                Nous n'utilisons aucun cookie de traçage publicitaire (type Facebook ou Google Analytics). Le seul cookie présent est strictement nécessaire au fonctionnement de l'interface utilisateur.
              </p>
            </section>
          </div>

          {/* Back to home */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <Button 
              onClick={() => navigate("/")}
              variant="outline"
              className="border-white/20 hover:bg-white/5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white/40 text-sm">
            © 2024 MONEYA. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;

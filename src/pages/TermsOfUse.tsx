import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";

const TermsOfUse = () => {
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
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-white/40 mb-12">
            Dernière mise à jour : 25 décembre 2025
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-white/80 text-lg leading-relaxed">
              Bienvenue sur MONEYA. En utilisant notre service, vous acceptez les présentes conditions générales d'utilisation. Veuillez les lire attentivement.
            </p>

            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">1. Objet du service</h2>
              <p className="text-white/70 leading-relaxed">
                MONEYA est une application de gestion financière personnelle qui permet aux utilisateurs de :
              </p>
              <ul className="list-disc list-inside space-y-2 text-white/70">
                <li>Suivre leurs revenus et dépenses</li>
                <li>Gérer leurs clients et factures</li>
                <li>Organiser leurs tâches et rendez-vous</li>
                <li>Analyser leur situation financière</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">2. Accès au service</h2>
              <p className="text-white/70 leading-relaxed">
                L'accès à MONEYA nécessite la création d'un compte via Google Authentication. En créant un compte, vous garantissez que les informations fournies sont exactes et à jour.
              </p>
              <p className="text-white/70 leading-relaxed">
                Vous êtes responsable de la sécurité de votre compte et de toutes les activités qui s'y déroulent.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">3. Abonnements et paiements</h2>
              <p className="text-white/70 leading-relaxed">
                MONEYA propose une version gratuite avec des fonctionnalités limitées et des abonnements payants pour accéder à l'ensemble des fonctionnalités.
              </p>
              <ul className="list-disc list-inside space-y-2 text-white/70">
                <li>Les paiements sont traités de manière sécurisée via Moneroo</li>
                <li>Les abonnements sont renouvelés automatiquement sauf annulation</li>
                <li>Aucun remboursement n'est accordé pour les périodes partiellement utilisées</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">4. Utilisation acceptable</h2>
              <p className="text-white/70 leading-relaxed">
                En utilisant MONEYA, vous vous engagez à :
              </p>
              <ul className="list-disc list-inside space-y-2 text-white/70">
                <li>Ne pas utiliser le service à des fins illégales</li>
                <li>Ne pas tenter de contourner les mesures de sécurité</li>
                <li>Ne pas partager votre compte avec des tiers</li>
                <li>Ne pas utiliser le service pour stocker des données frauduleuses</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">5. Propriété intellectuelle</h2>
              <p className="text-white/70 leading-relaxed">
                MONEYA et tous ses contenus (logos, textes, design, code) sont la propriété exclusive de MONEYA. Toute reproduction, distribution ou utilisation non autorisée est strictement interdite.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">6. Limitation de responsabilité</h2>
              <p className="text-white/70 leading-relaxed">
                MONEYA est fourni "tel quel". Nous ne garantissons pas que le service sera ininterrompu ou exempt d'erreurs. En aucun cas, MONEYA ne pourra être tenu responsable des dommages directs ou indirects résultant de l'utilisation du service.
              </p>
              <div className="bg-[#111] border border-white/10 rounded-xl p-4 mt-4">
                <p className="text-white/70 leading-relaxed">
                  <span className="font-medium text-primary">Important :</span> Les données financières que vous saisissez sont à titre indicatif. MONEYA ne fournit pas de conseils financiers professionnels.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">7. Résiliation</h2>
              <p className="text-white/70 leading-relaxed">
                Vous pouvez résilier votre compte à tout moment depuis les paramètres de l'application. Nous nous réservons le droit de suspendre ou de supprimer votre compte en cas de violation des présentes conditions.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">8. Modifications des conditions</h2>
              <p className="text-white/70 leading-relaxed">
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des modifications significatives par email ou via l'application.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">9. Contact</h2>
              <p className="text-white/70 leading-relaxed">
                Pour toute question concernant ces conditions, vous pouvez nous contacter à : <a href="mailto:awoessojosuek@gmail.com" className="text-primary hover:underline">awoessojosuek@gmail.com</a>
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">10. Droit applicable</h2>
              <p className="text-white/70 leading-relaxed">
                Les présentes conditions sont régies par le droit applicable. Tout litige sera soumis à la juridiction compétente.
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
            © 2025 MONEYA. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfUse;

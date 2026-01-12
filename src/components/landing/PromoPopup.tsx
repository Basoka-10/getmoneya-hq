import { useState, useEffect } from "react";
import { X, Flame, Clock, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PromoPopupProps {
  onAccept: () => void;
}

const POPUP_STORAGE_KEY = "moneya_promo_popup_closed";
const POPUP_DELAY_MS = 3000;
const POPUP_RESHOW_HOURS = 24;

export function PromoPopup({ onAccept }: PromoPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // TEMPORARILY DISABLED - Popup is disabled for now
  // To re-enable, uncomment the useEffect below
  /*
  useEffect(() => {
    // Check if popup was recently closed
    const closedAt = localStorage.getItem(POPUP_STORAGE_KEY);
    if (closedAt) {
      const closedTime = parseInt(closedAt, 10);
      const hoursSinceClosed = (Date.now() - closedTime) / (1000 * 60 * 60);
      if (hoursSinceClosed < POPUP_RESHOW_HOURS) {
        return; // Don't show popup
      }
    }

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsAnimating(true);
      setIsVisible(true);
    }, POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);
  */

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem(POPUP_STORAGE_KEY, Date.now().toString());
    }, 300);
  };

  const handleAccept = () => {
    handleClose();
    onAccept();
  };

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300",
        isAnimating ? "bg-black/70 backdrop-blur-sm" : "bg-transparent"
      )}
      onClick={handleClose}
    >
      <div 
        className={cn(
          "relative w-full max-w-md bg-gradient-to-br from-[#1a1a1a] via-[#111] to-[#0d0d0d] border border-orange-500/30 rounded-3xl p-8 shadow-2xl shadow-orange-500/20 transition-all duration-300",
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5 text-white/60" />
        </button>

        {/* Decorative elements */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500 blur-xl opacity-50 rounded-full"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mt-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full mb-4">
            <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
            <span className="text-orange-400 text-sm font-medium">Offre Spéciale Fin d'Année</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            🎉 Pro à seulement{" "}
            <span className="text-orange-500">10€/an</span>
          </h2>

          {/* Subtitle */}
          <p className="text-white/60 mb-6">
            Au lieu de <span className="line-through">35,88€</span> — Économisez 70% !
          </p>

          {/* Benefits */}
          <div className="space-y-2 mb-6 text-left">
            <div className="flex items-center gap-3 text-white/80 text-sm">
              <Crown className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <span>20 clients, 40 factures, tâches illimitées</span>
            </div>
            <div className="flex items-center gap-3 text-white/80 text-sm">
              <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <span>Accès pendant 1 an complet</span>
            </div>
          </div>

          {/* Urgency */}
          <div className="flex items-center justify-center gap-2 text-sm text-white/50 mb-6">
            <span className="text-orange-400">🔥 Pour les 100 premiers utilisateurs</span>
            <span>•</span>
            <span>Jusqu'au 5 janvier 2026</span>
          </div>

          {/* CTA */}
          <Button
            onClick={handleAccept}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg py-6 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-[1.02]"
          >
            <Flame className="mr-2 h-5 w-5" />
            J'en profite maintenant
          </Button>

          {/* Secondary action */}
          <button
            onClick={handleClose}
            className="mt-4 text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            Non merci, je préfère payer plus cher
          </button>
        </div>
      </div>
    </div>
  );
}

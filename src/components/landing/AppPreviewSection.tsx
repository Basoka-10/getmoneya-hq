import dashboardPreview from "@/assets/dashboard-preview.png";
import { Sparkles, Zap, TrendingUp, Shield } from "lucide-react";

export const AppPreviewSection = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Section Title */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-primary text-sm font-medium">Interface intuitive</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Découvrez votre{" "}
            <span className="text-primary">tableau de bord</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Une interface claire et puissante pour gérer toute votre activité en un coup d'œil.
          </p>
        </div>

        {/* Monitor Mockup Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Floating Badges */}
          <div className="absolute -left-4 md:left-0 lg:-left-4 top-16 md:top-20 z-20 hidden md:block animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="bg-[#1a1a1a]/90 backdrop-blur-sm border border-primary/30 rounded-xl px-3 py-2 md:px-4 md:py-3 shadow-xl shadow-primary/10 hover:scale-105 transition-transform">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                </div>
                <span className="text-xs md:text-sm font-medium text-white">Gestion simplifiée</span>
              </div>
            </div>
          </div>

          <div className="absolute -right-4 md:right-0 lg:-right-4 top-28 md:top-32 z-20 hidden md:block animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="bg-[#1a1a1a]/90 backdrop-blur-sm border border-primary/30 rounded-xl px-3 py-2 md:px-4 md:py-3 shadow-xl shadow-primary/10 hover:scale-105 transition-transform">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                </div>
                <span className="text-xs md:text-sm font-medium text-white">Suivi en temps réel</span>
              </div>
            </div>
          </div>

          <div className="absolute -left-8 md:-left-4 lg:-left-8 bottom-28 md:bottom-32 z-20 hidden md:block animate-fade-in" style={{ animationDelay: "0.7s" }}>
            <div className="bg-[#1a1a1a]/90 backdrop-blur-sm border border-primary/30 rounded-xl px-3 py-2 md:px-4 md:py-3 shadow-xl shadow-primary/10 hover:scale-105 transition-transform">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                </div>
                <span className="text-xs md:text-sm font-medium text-white">Données sécurisées</span>
              </div>
            </div>
          </div>

          {/* Monitor Frame */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {/* Monitor Screen */}
            <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl sm:rounded-3xl p-2 sm:p-3 border border-white/10 shadow-2xl shadow-primary/5">
              {/* Screen Bezel */}
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/5">
                {/* Screen Content */}
                <img 
                  src={dashboardPreview} 
                  alt="MONEYA Dashboard" 
                  className="w-full h-auto object-cover"
                />
                
                {/* Screen Reflection Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.05] pointer-events-none" />
              </div>
              
              {/* Webcam Dot */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#2a2a2a] rounded-full border border-white/10" />
            </div>

            {/* Monitor Stand */}
            <div className="flex flex-col items-center -mt-1">
              {/* Neck */}
              <div className="w-20 h-8 bg-gradient-to-b from-[#1a1a1a] to-[#111] rounded-b-lg border-x border-b border-white/10" />
              {/* Base */}
              <div className="w-40 h-3 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-full border border-white/10 shadow-lg" />
            </div>
          </div>

          {/* Glow Effect */}
          <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-primary/20 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

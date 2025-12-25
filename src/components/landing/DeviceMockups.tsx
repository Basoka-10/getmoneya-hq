import { useEffect, useRef, useState } from 'react';
import { LayoutDashboard, Shield, Check, Smartphone } from 'lucide-react';
import mobilePreview from '@/assets/mobile-analysis-preview.jpg';
import desktopPreview from '@/assets/desktop-dashboard-preview.png';

export const DeviceMockups = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Scroll-based parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if section is visible
      if (rect.top < windowHeight && rect.bottom > 0) {
        setIsVisible(true);
        // Calculate scroll progress (0 to 1)
        const progress = Math.max(0, Math.min(1, 1 - (rect.top / windowHeight)));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse-based 3D hover effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sectionRef.current) return;
    
    const rect = sectionRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    setMousePosition({ x, y });
  };

  // Calculate 3D transform based on mouse position
  const getDesktopTransform = () => {
    if (!isHovering) return 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    
    const rotateX = -mousePosition.y * 10;
    const rotateY = mousePosition.x * 10;
    
    return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const getMobileTransform = () => {
    if (!isHovering) return 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    
    const rotateX = -mousePosition.y * 15;
    const rotateY = mousePosition.x * 15;
    
    return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  // Parallax transforms based on scroll
  const desktopParallax = {
    transform: `translateY(${(1 - scrollProgress) * 60}px)`,
    opacity: scrollProgress > 0.1 ? 1 : 0,
  };

  const mobileParallax = {
    transform: `translateY(${(1 - scrollProgress) * 100}px)`,
    opacity: scrollProgress > 0.2 ? 1 : 0,
  };

  const badge1Parallax = {
    transform: `translateY(${(1 - scrollProgress) * 80}px) translateX(${(1 - scrollProgress) * -20}px)`,
    opacity: scrollProgress > 0.3 ? 1 : 0,
  };

  const badge2Parallax = {
    transform: `translateY(${(1 - scrollProgress) * 120}px) translateX(${(1 - scrollProgress) * -30}px)`,
    opacity: scrollProgress > 0.4 ? 1 : 0,
  };

  return (
    <section 
      ref={sectionRef}
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0d0d0d] overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6 transition-all duration-700"
            style={{ 
              opacity: isVisible ? 1 : 0, 
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)' 
            }}
          >
            <Smartphone className="h-4 w-4 text-primary" />
            <span className="text-primary text-sm font-medium">100% responsive</span>
          </div>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 transition-all duration-700 delay-100"
            style={{ 
              opacity: isVisible ? 1 : 0, 
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)' 
            }}
          >
            Utilisez <span className="text-primary">MONEYA</span> partout
          </h2>
          <p 
            className="text-white/60 max-w-2xl mx-auto text-lg transition-all duration-700 delay-200"
            style={{ 
              opacity: isVisible ? 1 : 0, 
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)' 
            }}
          >
            MONEYA est optimisé pour mobile et desktop — suivez votre activité où que vous soyez.
          </p>
        </div>

        {/* Devices Mockup */}
        <div className="relative flex items-center justify-center min-h-[500px]">
          {/* Desktop Mockup */}
          <div 
            className="relative w-full max-w-4xl transition-all duration-500 ease-out"
            style={{ 
              ...desktopParallax,
              transform: `${desktopParallax.transform} ${getDesktopTransform()}`,
            }}
          >
            {/* Glow effect */}
            <div 
              className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-110 transition-opacity duration-500"
              style={{ opacity: isHovering ? 0.6 : 0.2 }}
            />
            
            {/* Monitor Frame */}
            <div className="relative bg-[#1a1a1a] rounded-2xl p-2 border border-white/10 shadow-2xl shadow-black/50 transition-shadow duration-300 hover:shadow-primary/20">
              {/* Screen bezel */}
              <div className="relative bg-[#0a0a0a] rounded-xl overflow-hidden">
                {/* Camera dot */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/10 rounded-full z-10"></div>
                {/* Screen reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none z-10"></div>
                {/* Screenshot */}
                <img 
                  src={desktopPreview} 
                  alt="MONEYA Dashboard Desktop" 
                  className="w-full h-auto"
                />
              </div>
            </div>
            {/* Monitor Stand */}
            <div className="flex flex-col items-center mt-2">
              <div className="w-16 h-6 bg-gradient-to-b from-[#1a1a1a] to-[#111] rounded-sm"></div>
              <div className="w-32 h-2 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-full"></div>
            </div>
          </div>

          {/* Mobile Mockup - Positioned to overlap */}
          <div 
            className="absolute -right-4 sm:right-8 lg:right-16 bottom-8 w-32 sm:w-40 lg:w-52 transition-all duration-500 ease-out"
            style={{ 
              ...mobileParallax,
              transform: `${mobileParallax.transform} ${getMobileTransform()}`,
            }}
          >
            {/* Glow effect */}
            <div 
              className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-125 transition-opacity duration-500"
              style={{ opacity: isHovering ? 0.8 : 0.3 }}
            />
            
            {/* Phone Frame */}
            <div className="relative bg-[#1a1a1a] rounded-[2rem] sm:rounded-[2.5rem] p-1.5 sm:p-2 border border-white/10 shadow-2xl shadow-black/50 transition-shadow duration-300 hover:shadow-primary/20">
              {/* Notch */}
              <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-4 sm:h-5 bg-[#0a0a0a] rounded-full z-10"></div>
              {/* Screen reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none z-10 rounded-[1.5rem] sm:rounded-[2rem]"></div>
              {/* Screen */}
              <div className="relative bg-[#0a0a0a] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden">
                <img 
                  src={mobilePreview} 
                  alt="MONEYA Analyse Mobile" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* Floating Badges */}
          <div 
            className="absolute -left-4 sm:left-4 lg:left-12 top-1/4 hidden sm:block transition-all duration-700 ease-out"
            style={badge1Parallax}
          >
            <div className="bg-[#111] border border-primary/30 rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm hover:scale-105 hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-white/60">Interface</p>
                  <p className="text-sm font-semibold text-white">Intuitive</p>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="absolute -left-4 sm:left-8 lg:left-20 bottom-1/4 hidden sm:block transition-all duration-700 ease-out"
            style={badge2Parallax}
          >
            <div className="bg-[#111] border border-primary/30 rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm hover:scale-105 hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-white/60">Données</p>
                  <p className="text-sm font-semibold text-white">Sécurisées</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Pills */}
        <div 
          className="flex flex-wrap justify-center gap-4 mt-12 transition-all duration-700 delay-300"
          style={{ 
            opacity: isVisible ? 1 : 0, 
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)' 
          }}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-white/10 rounded-full hover:border-primary/30 transition-colors duration-300">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm text-white/80">Responsive design</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-white/10 rounded-full hover:border-primary/30 transition-colors duration-300">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm text-white/80">Synchronisation temps réel</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-white/10 rounded-full hover:border-primary/30 transition-colors duration-300">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm text-white/80">Accès depuis n'importe où</span>
          </div>
        </div>
      </div>
    </section>
  );
};

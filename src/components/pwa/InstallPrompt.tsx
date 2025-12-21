import { useState, useEffect } from "react";
import { X, Download, Share, Plus, MoreVertical, ChevronRight, Check, Smartphone, Monitor, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

type BrowserType = "safari" | "chrome" | "other";
type DeviceType = "ios" | "android" | "desktop";

// Detect browser type
const detectBrowser = (): BrowserType => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for Safari (but not Chrome on iOS which includes Safari in UA)
  if (/safari/.test(userAgent) && !/chrome/.test(userAgent) && !/crios/.test(userAgent)) {
    return "safari";
  }
  
  // Check for Chrome (including Chrome on iOS - CriOS)
  if (/chrome/.test(userAgent) || /crios/.test(userAgent)) {
    return "chrome";
  }
  
  return "other";
};

// Detect device type
const detectDevice = (): DeviceType => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";
  if (/android/.test(userAgent)) return "android";
  return "desktop";
};

export function InstallPrompt() {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");
  const [browserType, setBrowserType] = useState<BrowserType>("other");
  const [isInstalled, setIsInstalled] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [autoInstallAttempted, setAutoInstallAttempted] = useState(false);

  const getSteps = (): Step[] => {
    if (deviceType === "ios") {
      // Safari on iOS
      if (browserType === "safari") {
        return [
          {
            title: "Appuyer sur Partager",
            description: "En bas de l'écran Safari, appuyez sur le bouton de partage (carré avec flèche).",
            icon: <Share className="h-8 w-8 text-primary" />,
          },
          {
            title: "Ajouter à l'écran d'accueil",
            description: "Faites défiler et appuyez sur \"Sur l'écran d'accueil\".",
            icon: <Plus className="h-8 w-8 text-primary" />,
          },
          {
            title: "Confirmer l'installation",
            description: "Appuyez sur \"Ajouter\" pour installer MONEYA sur votre appareil.",
            icon: <Check className="h-8 w-8 text-primary" />,
          },
        ];
      }
      // Chrome or other browser on iOS
      return [
        {
          title: "Ouvrir le menu",
          description: "Appuyez sur les trois points (...) en bas ou en haut à droite de votre navigateur.",
          icon: <MoreVertical className="h-8 w-8 text-primary" />,
        },
        {
          title: "Ajouter à l'écran d'accueil",
          description: "Sélectionnez \"Ajouter à l'écran d'accueil\" ou \"Add to Home Screen\".",
          icon: <Plus className="h-8 w-8 text-primary" />,
        },
        {
          title: "Confirmer l'installation",
          description: "Appuyez sur \"Ajouter\" pour installer MONEYA sur votre appareil.",
          icon: <Check className="h-8 w-8 text-primary" />,
        },
      ];
    } else if (deviceType === "android") {
      return [
        {
          title: "Ouvrir le menu",
          description: "Appuyez sur les trois points en haut à droite de votre navigateur.",
          icon: <MoreVertical className="h-8 w-8 text-primary" />,
        },
        {
          title: "Installer l'application",
          description: "Sélectionnez \"Installer l'application\" ou \"Ajouter à l'écran d'accueil\".",
          icon: <Download className="h-8 w-8 text-primary" />,
        },
        {
          title: "Confirmer l'installation",
          description: "Appuyez sur \"Installer\" pour ajouter MONEYA à votre téléphone.",
          icon: <Check className="h-8 w-8 text-primary" />,
        },
      ];
    } else {
      // Desktop instructions based on browser
      if (browserType === "chrome") {
        return [
          {
            title: "Cliquer sur l'icône d'installation",
            description: "Dans la barre d'adresse Chrome, cliquez sur l'icône d'installation à droite.",
            icon: <Download className="h-8 w-8 text-primary" />,
          },
          {
            title: "Confirmer l'installation",
            description: "Cliquez sur \"Installer\" dans la fenêtre qui apparaît.",
            icon: <Check className="h-8 w-8 text-primary" />,
          },
        ];
      }
      return [
        {
          title: "Ouvrir le menu du navigateur",
          description: "Cliquez sur le menu (trois points ou lignes) en haut à droite.",
          icon: <Globe className="h-8 w-8 text-primary" />,
        },
        {
          title: "Installer l'application",
          description: "Cherchez \"Installer MONEYA\" ou \"Ajouter au bureau\".",
          icon: <Download className="h-8 w-8 text-primary" />,
        },
        {
          title: "Confirmer l'installation",
          description: "Confirmez l'installation pour ajouter MONEYA à votre ordinateur.",
          icon: <Check className="h-8 w-8 text-primary" />,
        },
      ];
    }
  };

  const steps = getSteps();

  // Auto-trigger install when deferredPrompt is available
  useEffect(() => {
    if (deferredPrompt && !autoInstallAttempted && user) {
      setAutoInstallAttempted(true);
      // Auto-trigger install prompt
      const autoInstall = async () => {
        try {
          await deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === "accepted") {
            localStorage.setItem("moneya_install_completed", "true");
            setShowPrompt(false);
          }
          setDeferredPrompt(null);
        } catch (error) {
          console.log("Auto-install failed, will show manual prompt");
        }
      };
      // Small delay to ensure UI is ready
      setTimeout(autoInstall, 1000);
    }
  }, [deferredPrompt, autoInstallAttempted, user]);

  useEffect(() => {
    // Only show for logged-in users
    if (!user) return;

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has completed the install guide
    const completed = localStorage.getItem("moneya_install_completed");
    if (completed) return;

    // Detect device and browser type
    setDeviceType(detectDevice());
    setBrowserType(detectBrowser());

    // Show prompt after a delay
    setTimeout(() => setShowPrompt(true), 2000);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Listen for app installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem("moneya_install_completed", "true");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, [user]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
        localStorage.setItem("moneya_install_completed", "true");
      }
      setDeferredPrompt(null);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem("moneya_install_completed", "true");
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("moneya_install_completed", "true");
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt || !user) return null;

  const progress = ((currentStep + 1) / steps.length) * 100;

  // If we have deferredPrompt on Android/Desktop, show direct install button
  if (deferredPrompt && deviceType !== "ios") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <Card className="w-full max-w-md border-primary/20 bg-card shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-center mb-4">
              <img 
                src="/logo.png" 
                alt="MONEYA" 
                className="h-20 w-20 object-contain"
              />
            </div>
            <CardTitle className="text-xl">Installer MONEYA</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Installez l'application pour accéder à MONEYA rapidement depuis votre appareil.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleInstall} className="w-full gap-2" size="lg">
              <Download className="h-5 w-5" />
              Installer maintenant
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground"
              onClick={handleDismiss}
            >
              Plus tard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md border-primary/20 bg-card shadow-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="MONEYA" 
                className="h-10 w-10 object-contain"
              />
              <CardTitle className="text-lg">Installer MONEYA</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="mt-4" />
          <p className="text-xs text-muted-foreground mt-2">
            Étape {currentStep + 1} sur {steps.length}
            {deviceType === "ios" && (
              <span className="ml-2">
                ({browserType === "safari" ? "Safari" : browserType === "chrome" ? "Chrome" : "Navigateur"})
              </span>
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-6">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                {steps[currentStep].icon}
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {steps[currentStep].title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {steps[currentStep].description}
            </p>
          </div>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Précédent
              </Button>
            )}
            <Button 
              className="flex-1 gap-2"
              onClick={handleNext}
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Terminé
                </>
              )}
            </Button>
          </div>

          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground text-sm"
            onClick={handleDismiss}
          >
            Ne plus afficher
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

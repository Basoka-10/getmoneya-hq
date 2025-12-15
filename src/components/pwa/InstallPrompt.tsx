import { useState, useEffect } from "react";
import { X, Download, Share, Plus, MoreVertical, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop">("desktop");
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem("moneya_install_dismissed");
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismiss = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) return; // Don't show for 7 days after dismissal
    }

    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIOS) {
      setDeviceType("ios");
      // Show prompt for iOS after a delay
      setTimeout(() => setShowPrompt(true), 3000);
    } else if (isAndroid) {
      setDeviceType("android");
    } else {
      setDeviceType("desktop");
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Listen for app installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("moneya_install_dismissed", new Date().toISOString());
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm animate-slide-up">
      <Card className="border-primary/20 bg-card shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {deviceType === "ios" ? (
                <Smartphone className="h-5 w-5 text-primary" />
              ) : deviceType === "android" ? (
                <Smartphone className="h-5 w-5 text-primary" />
              ) : (
                <Monitor className="h-5 w-5 text-primary" />
              )}
              <CardTitle className="text-base">Installer MONEYA</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -mt-1 -mr-2"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-sm">
            Pour une meilleure expérience, installez l'app sur votre appareil.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {deviceType === "ios" ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Sur Safari, appuyez sur :
              </p>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Share className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Partager</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Ajouter à l'écran d'accueil</span>
              </div>
            </div>
          ) : deviceType === "android" && !deferredPrompt ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Appuyez sur le menu du navigateur :
              </p>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <MoreVertical className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Menu</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Download className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Installer l'application</span>
              </div>
            </div>
          ) : deferredPrompt ? (
            <Button onClick={handleInstall} className="w-full gap-2">
              <Download className="h-4 w-4" />
              Installer l'application
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Cliquez sur l'icône d'installation dans la barre d'adresse de votre navigateur.
              </p>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Download className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Installer</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

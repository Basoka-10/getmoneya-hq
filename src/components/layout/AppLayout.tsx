import { AppSidebar } from "./AppSidebar";
import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DesktopInstallButton } from "@/components/pwa/DesktopInstallButton";
import logo from "@/assets/logo.png";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop/Tablet top bar with install button */}
      <div className="hidden md:flex fixed top-0 left-20 lg:left-64 right-0 z-40 h-14 items-center justify-end border-b border-border bg-background px-4 lg:px-6">
        <DesktopInstallButton />
      </div>

      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 z-[60] flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
        <div className="flex items-center gap-3">
          <img src={logo} alt="MONEYA" className="h-8 w-8 object-contain" />
          <span className="text-lg font-bold text-foreground">MONEYA</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="relative z-[70] rounded-lg p-3 text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80 touch-manipulation"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile unless menu is open, collapsed on tablet, full on desktop */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:transform-none",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <AppSidebar onNavigate={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main content */}
      <main className={cn(
        "min-h-screen transition-all duration-300",
        "pt-14", // Account for header on both mobile and desktop
        "md:ml-20 lg:ml-64" // Collapsed sidebar on tablet, full on desktop
      )}>
        <div className="p-3 sm:p-4 md:p-5 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

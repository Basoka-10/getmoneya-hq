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

      {/* Mobile header - with iOS safe area (notch) support */}
      <header
        className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between border-b border-border bg-background px-4 md:hidden"
        style={{
          paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))",
          height: "calc(3.5rem + max(0px, env(safe-area-inset-top, 0px)))",
        }}
      >
        <div className="flex items-center gap-3">
          <img src={logo} alt="MONEYA" className="h-8 w-8 object-contain" />
          <span className="text-lg font-bold text-foreground">MONEYA</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="relative flex items-center justify-center w-12 h-12 -mr-2 rounded-xl text-foreground bg-muted/50 active:bg-muted select-none"
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none',
            touchAction: 'manipulation'
          }}
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[55] bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile unless menu is open, collapsed on tablet, full on desktop */}
      <nav className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:transform-none",
        mobileMenuOpen
          ? "translate-x-0"
          : "-translate-x-full md:translate-x-0",
        !mobileMenuOpen && "pointer-events-none md:pointer-events-auto"
      )}>
        <AppSidebar onNavigate={() => setMobileMenuOpen(false)} />
      </nav>

      {/* Main content */}
      <main className={cn(
        "min-h-screen transition-all duration-300",
        "md:ml-20 lg:ml-64 md:pt-14"
      )}
      style={{
        paddingTop: "calc(3.5rem + max(0px, env(safe-area-inset-top, 0px)))",
      }}>
        <div className="p-3 sm:p-4 md:p-5 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

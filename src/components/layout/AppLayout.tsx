import { AppSidebar } from "./AppSidebar";
import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80">
            <span className="text-sm font-bold text-primary-foreground">M</span>
          </div>
          <span className="text-lg font-bold text-foreground">MONEYA</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile unless menu is open */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:transform-none",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <AppSidebar />
      </div>

      {/* Main content */}
      <main className={cn(
        "min-h-screen transition-all duration-300",
        "pt-14 md:pt-0", // Account for mobile header
        "md:ml-64" // Sidebar width on desktop
      )}>
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

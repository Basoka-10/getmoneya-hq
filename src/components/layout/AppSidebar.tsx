import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  BarChart3,
  Users,
  CheckSquare,
  FileText,
  Settings,
  ChevronLeft,
  Moon,
  Sun,
  Zap,
  Crown,
  CalendarDays,
  Shield,
  Star,
  MessageCircle,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsOwner } from "@/hooks/useAdmin";
import { useSubscription } from "@/hooks/useSubscription";
import logo from "@/assets/logo.png";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Finances", href: "/finances", icon: Wallet },
  { name: "Analyse", href: "/analysis", icon: BarChart3 },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Tâches", href: "/tasks", icon: CheckSquare },
  { name: "Calendrier", href: "/calendar", icon: CalendarDays },
  { name: "Facturation", href: "/invoices", icon: FileText },
  { name: "API", href: "/api", icon: Key },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const location = useLocation();
  // Collapsed by default on tablet (md), expanded on desktop (lg)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { data: isOwner } = useIsOwner();
  const { currentPlan: plan } = useSubscription();

  // Update collapsed state on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";
  const userName = user?.email?.split("@")[0] || "Utilisateur";

  const getPlanDisplay = () => {
    switch (plan) {
      case "business":
        return { name: "Plan Business", icon: Crown, color: "text-purple-500" };
      case "pro":
        return { name: "Plan Pro", icon: Star, color: "text-amber-500" };
      default:
        return { name: "Plan Gratuit", icon: Zap, color: "text-primary" };
    }
  };

  const planDisplay = getPlanDisplay();

  const handleUpgradeClick = () => {
    if (plan === "business") {
      // Open WhatsApp for custom plans
      window.open("https://wa.me/33745385548", "_blank");
    } else {
      // Navigate to settings for upgrade
      window.location.href = "/settings";
    }
  };

  return (
    <aside
      className={cn(
        "h-screen border-r transition-all duration-300 flex flex-col",
        "bg-sidebar border-sidebar-border",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src={logo} alt="MONEYA" className="h-9 w-9 object-contain" />
          {!collapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              MONEYA
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 hidden md:block"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1 moneya-scrollbar">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors",
                isActive && "text-primary"
              )} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
        
        {/* Admin Link for Owners */}
        {isOwner && (
          <Link
            to="/admin"
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 mt-4 border-t border-sidebar-border pt-4",
              location.pathname.startsWith("/admin")
                ? "bg-orange-500/10 text-orange-500 shadow-sm"
                : "text-orange-500/80 hover:bg-orange-500/10 hover:text-orange-500"
            )}
          >
            <Shield className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Admin Panel</span>}
          </Link>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-sidebar-border p-3 space-y-3 flex-shrink-0">
        {/* Theme Toggle - Always show both buttons */}
        <div className={cn(
          "flex items-center rounded-xl bg-muted/50 p-1",
          collapsed ? "flex-col gap-1" : "justify-between"
        )}>
          <button 
            onClick={() => theme !== "dark" && toggleTheme()}
            className={cn(
              "flex items-center justify-center rounded-lg p-2 transition-all duration-200",
              theme === "dark" 
                ? "bg-card text-primary shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Mode sombre"
          >
            <Moon className="h-4 w-4" />
          </button>
          <button 
            onClick={() => theme !== "light" && toggleTheme()}
            className={cn(
              "flex items-center justify-center rounded-lg p-2 transition-all duration-200",
              theme === "light" 
                ? "bg-card text-primary shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Mode clair"
          >
            <Sun className="h-4 w-4" />
          </button>
        </div>

        {/* Plan Info Card */}
        {!collapsed && (
          <div className={cn(
            "rounded-xl border p-4 space-y-2",
            plan === "business" 
              ? "bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20" 
              : plan === "pro"
              ? "bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20"
              : "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20"
          )}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-lg",
                plan === "business" ? "bg-purple-500/20" : plan === "pro" ? "bg-amber-500/20" : "bg-primary/20"
              )}>
                <planDisplay.icon className={cn("h-3.5 w-3.5", planDisplay.color)} />
              </div>
              <span className={cn("text-xs font-semibold", planDisplay.color)}>{planDisplay.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {plan === "business" 
                ? "Profitez de toutes les fonctionnalités" 
                : plan === "pro"
                ? "Passez à Business pour un accès illimité"
                : "Passez à Pro pour débloquer plus de fonctionnalités"}
            </p>
          </div>
        )}

        {/* Upgrade Button - Hide for Business plan or show Custom */}
        {!collapsed && (
          plan === "business" ? (
            <Button 
              onClick={handleUpgradeClick}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-purple-500/20 transition-all duration-200"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Custom
            </Button>
          ) : (
            <Button 
              onClick={handleUpgradeClick}
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all duration-200"
            >
              <Crown className="h-4 w-4 mr-2" />
              {plan === "pro" ? "Passer à Business" : "Passer à Pro"}
            </Button>
          )
        )}

        {/* User */}
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer",
          collapsed && "justify-center"
        )}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-sm font-bold text-white shadow-lg">
            {userInitial}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "px-1.5 py-0.5 text-[10px] font-medium rounded",
                  isOwner 
                    ? "bg-orange-500/10 text-orange-500"
                    : plan === "business"
                    ? "bg-purple-500/10 text-purple-500"
                    : plan === "pro"
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-muted text-muted-foreground"
                )}>
                  {isOwner ? "Owner" : planDisplay.name}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

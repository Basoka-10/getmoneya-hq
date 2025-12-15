import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsOwner } from "@/hooks/useAdmin";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Finances", href: "/finances", icon: Wallet },
  { name: "Analyse", href: "/analysis", icon: BarChart3 },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Tâches", href: "/tasks", icon: CheckSquare },
  { name: "Calendrier", href: "/calendar", icon: CalendarDays },
  { name: "Facturation", href: "/invoices", icon: FileText },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { data: isOwner } = useIsOwner();

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";
  const userName = user?.email?.split("@")[0] || "Utilisateur";

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
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
            <span className="text-lg font-bold text-primary-foreground">M</span>
          </div>
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
      <div className="mt-auto border-t border-sidebar-border p-3 space-y-3">
        {/* Theme Toggle */}
        <div className={cn(
          "flex items-center rounded-xl bg-muted/50 p-1",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <button 
            onClick={() => theme === "light" && toggleTheme()}
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
          {!collapsed && (
            <button 
              onClick={() => theme === "dark" && toggleTheme()}
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
          )}
        </div>

        {/* Beta Info Card */}
        {!collapsed && (
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/20">
                <Zap className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary">Plan gratuit</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Accès gratuit pendant la phase de lancement
            </p>
          </div>
        )}

        {/* Beta Testers Button */}
        {!collapsed && (
          <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all duration-200">
            <Crown className="h-4 w-4 mr-2" />
            BETA TESTEURS
          </Button>
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
                <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground">
                  {isOwner ? "Owner" : "Gratuit"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

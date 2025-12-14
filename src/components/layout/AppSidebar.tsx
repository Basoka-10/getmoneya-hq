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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
const navigation = [
  { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
  { name: "Finances", href: "/finances", icon: Wallet },
  { name: "Analyse", href: "/analysis", icon: BarChart3 },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Tâches", href: "/tasks", icon: CheckSquare },
  { name: "Calendrier", href: "/calendar", icon: CalendarDays },
  { name: "Facturation", href: "/invoices", icon: FileText },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">G</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-foreground">
              GET MONEYA
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto border-t border-sidebar-border p-3 space-y-3">
        {/* Theme Toggle */}
        <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <button className="p-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 transition-colors">
            <Moon className="h-4 w-4" />
          </button>
          {!collapsed && (
            <button className="p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
              <Sun className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Usage Card */}
        {!collapsed && (
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                <span className="text-primary font-bold">50</span> restant sur 50
              </span>
              <span className="ml-auto text-xs text-muted-foreground">0%</span>
            </div>
            <Progress value={0} className="h-1.5 bg-sidebar-accent" />
          </div>
        )}

        {/* Upgrade Button */}
        {!collapsed && (
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2">
            <Crown className="h-4 w-4" />
            Passer PRO
            <span className="ml-auto">↗</span>
          </Button>
        )}

        {/* User */}
        <div className={cn("flex items-center gap-3 px-2 py-2", collapsed && "justify-center")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            U
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-sidebar-accent text-sidebar-foreground">
                  Gratuit
                </span>
                <span className="text-sm font-medium text-foreground truncate">
                  Utilisateur
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
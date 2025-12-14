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
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navigation = [
  { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
  { name: "Finances", href: "/finances", icon: Wallet },
  { name: "Analyse", href: "/analysis", icon: BarChart3 },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Tâches", href: "/tasks", icon: CheckSquare },
  { name: "Facturation", href: "/invoices", icon: FileText },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">G</span>
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold text-foreground">
                GET MONEYA
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="border-t border-border p-4">
            <div className="rounded-lg bg-accent p-4">
              <p className="text-xs text-muted-foreground">
                Un seul outil. Une seule vision.
                <br />
                <span className="font-medium text-accent-foreground">Un meilleur contrôle.</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Settings,
  Activity,
  Gauge,
  Menu,
  LogOut,
  ArrowLeft,
  Shield,
} from "lucide-react";
import logo from "@/assets/logo.png";

const adminNavItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Utilisateurs", href: "/admin/users", icon: Users },
  { title: "Limites FREE", href: "/admin/limits", icon: Gauge },
  { title: "Logs", href: "/admin/logs", icon: Activity },
  { title: "Paramètres", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <img src={logo} alt="MONEYA" className="h-6 w-6 object-contain" />
          <span className="font-bold text-lg">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Link to="/dashboard">
          <Button variant="outline" className="w-full justify-start gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'app
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 lg:hidden border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="MONEYA" className="h-6 w-6 object-contain" />
            <span className="font-bold">Admin</span>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r min-h-screen sticky top-0">
          <NavContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

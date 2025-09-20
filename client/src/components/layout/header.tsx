import { Link, useLocation } from "wouter";
import { Scale, MessageCircle, ExternalLink, Menu, FileScan, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const [location] = useLocation();

  const navItems = [
    { path: "/chat-assistant", label: "Chat Assistant", icon: MessageCircle },
    { path: "/labour-contract-analysis", label: "Labour Contract Analysis", icon: FileScan },
    { path: "/portals", label: "Gov Portals", icon: ExternalLink },
    { path: "/legal-experts", label: "Legal Experts", icon: UsersRound },
  ];

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={mobile ? "flex flex-col space-y-4" : "hidden md:flex items-center space-x-1"}>
      {navItems.map((item) => {
        const isActive = location === item.path;
        return (
          <Button
            key={item.path}
            variant="ghost"
            className={`${
              isActive
                ? "text-foreground font-medium"
                : "text-foreground/80"
            } hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 rounded-full px-3 py-1.5 text-sm transition-all duration-200 hover:scale-105`}
            asChild
            data-testid={`nav-${item.path.replace("/", "")}`}
          >
            <Link href={item.path}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        );
      })}
    </div>
  );

  return (
    <nav className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
      <div className="relative backdrop-blur-xl bg-white/5 dark:bg-black/20 rounded-full shadow-2xl shadow-black/5 dark:shadow-white/5">
        <div className="flex items-center justify-between h-12 px-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 group cursor-pointer" data-testid="logo">
              <div className="relative">
                <div className="h-6 w-6 flex items-center justify-center text-primary">
                  <Scale className="h-5 w-5" />
                </div>
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="text-base font-semibold text-foreground font-logo">
                SembangLaw!<span className="text-primary"></span>
              </span>
            </div>
          </Link>

          {/* Center Menu */}
          <NavItems />

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" data-testid="mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="backdrop-blur-xl bg-white/80 dark:bg-black/80">
              <div className="mt-6">
                <NavItems mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
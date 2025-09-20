import { Link, useLocation } from "wouter";
import { Scale, MessageCircle, ExternalLink, Menu, FileScan, UsersRound, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Scale },
    { path: "/chat-assistant", label: "Chat Assistant", icon: MessageCircle },
    { path: "/labour-contract-analysis", label: "Labour Contract Analysis", icon: FileScan },
    { path: "/portals", label: "Gov Portals", icon: ExternalLink },
    { path: "/legal-experts", label: "Legal Experts", icon: UsersRound },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={mobile ? "flex flex-col space-y-4" : "hidden md:flex space-x-6"}>
      {navItems.map((item) => {
        const isActive = location === item.path;
        return (
          <Link key={item.path} href={item.path}>
            <Button
              variant="ghost"
              className={`${
                isActive 
                  ? "text-primary border-b-2 border-primary font-medium rounded-none" 
                  : "text-muted-foreground hover:text-foreground"
              } transition-colors px-4 py-2`}
              data-testid={`nav-${item.path.replace("/", "")}`}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </div>
  );

  return (
    <header className="border-b border-border bg-card shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer" data-testid="logo">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Scale className="text-primary-foreground h-4 w-4" />
              </div>
              <h1 className="text-xl font-bold text-foreground">LegalAdvisor AI</h1>
            </div>
          </Link>

          <NavItems />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" data-testid="mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="mt-6">
                <NavItems mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
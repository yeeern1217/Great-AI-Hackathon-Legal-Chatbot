import { Link, useLocation } from "wouter";
import { Scale, MessageCircle, ExternalLink, Menu, FileScan, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const [location] = useLocation();

  const navItems = [
    { path: "/chat-assistant", label: "Chat Assistant", icon: MessageCircle },
    { path: "/labour-contract-analysis", label: "Labour Contract Analysis", icon: FileScan },
    { path: "/portals", label: "Officials", icon: ExternalLink },
    { path: "/legal-experts", label: "Legal Experts", icon: UsersRound },
  ];

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={mobile ? "flex flex-col space-y-6" : "hidden md:flex items-center space-x-4"}>
      {navItems.map((item) => {
        const isActive = location === item.path;
        return (
          <Button
            key={item.path}
            variant="ghost"
            className={`${
              isActive
                ? "bg-blue-600 text-white font-medium scale-105"
                : "text-foreground/80"
            } hover:text-foreground hover:scale-105 rounded-full px-4 py-2 text-sm transition-all duration-200 transform`}
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
    <nav className="fixed top-0 left-0 right-0 z-50 w-full">
      <div className="backdrop-blur-xl bg-white/5 dark:bg-black/20 shadow-2xl shadow-black/5 dark:shadow-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Logo with enlarge animation */}
            <Link href="/">
              <div className="flex items-center space-x-2 group cursor-pointer transform transition-transform duration-200 hover:scale-105" data-testid="logo">
                <div className="relative">
                  <div className="h-8 w-8 flex items-center justify-center text-blue-600">
                    <Scale className="h-6 w-6" />
                  </div>
                  <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <span className="text-xl font-semibold text-foreground">
                  SembangLaw!<span className="text-blue-600"></span>
                </span>
              </div>
            </Link>

            {/* Center Menu */}
            <NavItems />

            {/* Mobile Menu with enlarge animation */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden h-10 w-10 transform transition-transform duration-200 hover:scale-110" 
                  data-testid="mobile-menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="backdrop-blur-xl bg-white/80 dark:bg-black/80">
                <div className="mt-8">
                  <NavItems mobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
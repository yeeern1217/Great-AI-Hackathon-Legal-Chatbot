import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  MessageCircle,
  ExternalLink,
  Menu,
  FileScan,
  LayoutDashboard,
  UsersRound,
  LogIn,
  User,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getCurrentUser, fetchUserAttributes, signOut } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import logo from "@/assets/logo.png";

async function handleGlobalSignOut() {
  try {
    await signOut({ global: true });
    console.log("✅ Signed out successfully");
  } catch (err) {
    console.error("❌ Error signing out:", err);
  }
}

export default function Header() {
  const [location] = useLocation();
  const [nickname, setNickname] = useState<string | null>(null);

  const loadUser = async () => {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      setNickname(attributes.nickname ?? user.username);
    } catch {
      setNickname(null);
    }
  };

  useEffect(() => {
    loadUser();
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn" || payload.event === "tokenRefresh") loadUser();
      if (payload.event === "signedOut") setNickname(null);
    });
    return () => unsubscribe();
  }, []);

  const navItems = [
    { path: "/chat-assistant", label: "Chat Assistant", icon: MessageCircle },
    { path: "/labour-contract-analysis", label: "Labour Contract Analysis", icon: FileScan },
    { path: "/dashboard", label: "Contract Insights", icon: LayoutDashboard },
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
            variant="navigation"
            className={`${
              isActive
                ? "font-bold text-blue-700 underline underline-offset-4"
                : "text-foreground/80 hover:bg-blue-600 hover:text-white"
            } rounded-full px-4 py-2 text-base transition-colors duration-200 transform focus-visible:ring-0 focus-visible:ring-offset-0`}
            asChild
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl shadow-md h-20">
      <div className="px-8 h-full grid grid-cols-3 items-center">
        <div className="flex items-center justify-start">
          {/* Logo - left */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer transition-transform duration-200">
              <img src={logo} alt="Logo" className="h-12 w-auto" />
              <span className="text-2xl font-semibold text-foreground"> SembangLaw! </span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="flex items-center justify-center">
          <NavItems />
        </div>

        <div className="flex items-center justify-end">
          {/* Login/User dropdown - right */}
          <div className="flex items-center">
            {nickname ? (
              <div className="relative group">
                <Button
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full flex items-center space-x-2 text-base"
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">{nickname}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all">
                  <button
                    onClick={handleGlobalSignOut}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-base"
                asChild
              >
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Nav */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 hover:scale-110 transition-transform duration-200"
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
    </nav>
  );
}

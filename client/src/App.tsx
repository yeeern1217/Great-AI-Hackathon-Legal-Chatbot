import React, { useState, useEffect } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import { Scale, Shield, FileCheck, Sparkles } from 'lucide-react';


import Header from "@/components/layout/header";
import Home from "@/pages/home";
import ChatAssistant from "@/pages/chat-assistant";
import Portals from "@/pages/portals";
import NotFound from "@/pages/not-found";
import LabourContractAnalysis from "@/pages/labour-contract-analysis";
import Dashboard from "@/pages/dashboard";
import LegalExperts from "@/pages/legalExperts";
import Login from "@/pages/login";
import Signup from "@/pages/signup";


function Router() {
  return (
    <Switch>
      <Route path="/">
        <Home />
      </Route>
      <Route path="/chat-assistant">
        <ChatAssistant />
      </Route>
      <Route path="/portals">
        <Portals />
      </Route>
      <Route path="/labour-contract-analysis">
        <LabourContractAnalysis />
      </Route>
      <Route path="/dashboard">
        <Dashboard />
      </Route>
      <Route path="/legal-experts">
        <LegalExperts />
      </Route>

      
      <Route path="/signup">
        <Signup />
      </Route>


      {/* 👇 New login page */}
      <Route path="/login">
        <Login />
      </Route>

      {/* ✅ fallback route */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

interface Props {
  isDark: boolean;
}

// Modern Geometric Background with purple/blue/white transitions
function GeometricBackground({ isDark }: Props) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated gradient background */}
      <div className={`absolute inset-0 transition-all duration-1000 ${
        isDark 
          ? "bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900" 
          : "bg-gradient-to-br from-purple-100 via-blue-50 to-white"
      }`} />
      
      {/* Animated gradient elements */}
      <div className="absolute top-1/4 -right-48 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/10 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 -left-48 w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/10 blur-3xl animate-pulse-slow" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-white/30 to-purple-200/20 blur-3xl animate-float" />
      
      {/* Modern grid pattern */}
      <div 
        className={`absolute inset-0 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.02]'}`}
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
}

// Minimal Legal Icons
function MinimalLegalIcons({ isDark }: Props) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const icons = [
    { Icon: Scale, x: '15%', y: '20%' },
    { Icon: Shield, x: '85%', y: '15%' },
    { Icon: FileCheck, x: '10%', y: '75%' },
    { Icon: Sparkles, x: '90%', y: '80%' }
  ];

  return (
    <div className="fixed inset-0 pointer-events-none -z-5">
      {icons.map((item, index) => {
        const Icon = item.Icon;
        const elementX = (window.innerWidth * parseFloat(item.x)) / 100;
        const elementY = (window.innerHeight * parseFloat(item.y)) / 100;
        const dx = mousePos.x - elementX;
        const dy = mousePos.y - elementY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 200 - distance) / 200;
        
        const offsetX = dx * influence * 0.02;
        const offsetY = dy * influence * 0.02;

        return (
          <div
            key={index}
            className={`absolute transition-all duration-300 ease-out ${
              isDark ? 'text-purple-500/10' : 'text-purple-400/20'
            }`}
            style={{
              left: item.x,
              top: item.y,
              transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px) scale(${1 + influence * 0.2})`,
            }}
          >
            <Icon size={48} />
          </div>
        );
      })}
    </div>
  );
}

// Modern Glow Effect
function ModernGlow({ isDark }: Props) {
  return (
    <div className="fixed inset-0 pointer-events-none -z-5">
      <div 
        className={`absolute top-1/3 left-1/2 w-[600px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px] ${
          isDark 
            ? 'bg-gradient-to-br from-purple-600/15 via-blue-500/10 to-indigo-600/15' 
            : 'bg-gradient-to-br from-purple-400/10 via-blue-300/10 to-indigo-400/10'
        }`}
        style={{
          animation: 'breathe 8s ease-in-out infinite'
        }}
      />
    </div>
  );
}

function App() {
  const { theme } = useTheme(); 
  const isDark = theme === 'dark';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen relative overflow-hidden">
          {/* Modern Clean Background */}
          <GeometricBackground isDark={isDark} />
          <ModernGlow isDark={isDark} />
          <MinimalLegalIcons isDark={isDark} />
          
          {/* Main Content */}
          <div className="relative z-20 pt-16">
            <Header />
            <Toaster />
            <Router />
          </div>
        
          
          {/* Modern CSS Animations */}
          <style>{`
            @keyframes breathe {
              0%, 100% { 
                transform: translate(-50%, -50%) scale(1); 
                opacity: 1; 
              }
              50% { 
                transform: translate(-50%, -50%) scale(1.1); 
                opacity: 0.8; 
              }
            }
            
            @keyframes float {
              0%, 100% { 
                transform: translate(-50%, -50%) translateY(0px); 
              }
              50% { 
                transform: translate(-50%, -50%) translateY(-20px); 
              }
            }
            
            @keyframes pulse-slow {
              0%, 100% { 
                opacity: 0.5; 
              }
              50% { 
                opacity: 0.8; 
              }
            }
            
            .animate-float {
              animation: float 10s ease-in-out infinite;
            }
            
            .animate-pulse-slow {
              animation: pulse-slow 6s ease-in-out infinite;
            }
            
            /* Modern scrollbar */
            ::-webkit-scrollbar {
              width: 8px;
            }
            
            ::-webkit-scrollbar-track {
              background: ${isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(248, 250, 252, 0.8)'};
              border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb {
              background: ${isDark 
                ? 'rgba(139, 92, 246, 0.5)' 
                : 'rgba(139, 92, 246, 0.3)'};
              border-radius: 4px;
              transition: all 0.2s ease;
            }
            
            ::-webkit-scrollbar-thumb:hover {
              background: ${isDark 
                ? 'rgba(139, 92, 246, 0.7)' 
                : 'rgba(139, 92, 246, 0.5)'};
            }
            
            /* Smooth transitions */
            * {
              transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
            }
            
            /* Enhanced glassmorphism effects with more blur */
            .backdrop-blur-xl {
              backdrop-filter: blur(24px);
              -webkit-backdrop-filter: blur(24px);
            }
            
            .backdrop-blur-2xl {
              backdrop-filter: blur(40px);
              -webkit-backdrop-filter: blur(40px);
            }
            
            /* Modern focus states */
            button:focus-visible,
            input:focus-visible,
            textarea:focus-visible,
            select:focus-visible {
              outline: 2px solid ${isDark ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.4)'};
              outline-offset: 2px;
            }
            
            /* Modern hover effects */
            .hover\\:scale-105:hover {
              transform: scale(1.05);
            }
            
            /* Modern card shadows */
            .modern-card {
              box-shadow: ${isDark 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              };
            }
          `}</style>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
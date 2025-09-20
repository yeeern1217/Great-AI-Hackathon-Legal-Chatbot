import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  FileText, 
  UserCheck, 
  Globe,
  ExternalLink,
  AlertTriangle,
  Phone
} from "lucide-react";

export default function Portals() {
  const legislationPortals = [
    {
      id: "employment-act",
      icon: FileText,
      title: "Employment Act 1955",
      description: "Official legislation page for the Employment Act 1955.",
      url: "https://jtksm.mohr.gov.my/sites/default/files/2023-11/Akta%20Kerja%201955%20%28Akta%20265%29.pdf",
      category: "Legislation",
      categoryColor: "bg-purple-100 text-purple-600"
    },
    {
      id: "industrial-relations-act",
      icon: FileText,
      title: "Industrial Relations Act 1967",
      description: "Official legislation page for the Industrial Relations Act 1967.",
      url: "https://www.investmalaysia.gov.my/media/d32lepas/industrial-relations-act-1967.pdf",
      category: "Legislation",
      categoryColor: "bg-purple-100 text-purple-600"
    },
    {
      id: "epf-act",
      icon: FileText,
      title: "EPF Act 1991",
      description: "Official page for the Employees Provident Fund Act 1991.",
      url: "https://www.kwsp.gov.my/en/others/resource-centre/references/epf-act-1991",
      category: "Legislation",
      categoryColor: "bg-purple-100 text-purple-600"
    },
    {
      id: "socso-act",
      icon: FileText,
      title: "SOCSO Act 1969",
      description: "Official page for the Employees' Social Security Act 1969.",
      url: "https://www.perkeso.gov.my/images/imej/akta_dan_peraturan/Act%204-As%20at%201_Feb_2019.pdf",
      category: "Legislation",
      categoryColor: "bg-purple-100 text-purple-600"
    },
    {
      id: "osha-act",
      icon: FileText,
      title: "OSHA 1994",
      description: "Official page for the Occupational Safety and Health Act 1994.",
      url: "https://dosh.gov.my/wp-content/uploads/2025/01/Occupational-Safety-and-Health-Act-1994-Act-514_Reprint-Version-1.6.2024_English.pdf",
      category: "Legislation",
      categoryColor: "bg-purple-100 text-purple-600"
    },
  ];

  const servicePortals = [
    {
      id: "labour-department",
      icon: Shield,
      title: "Jabatan Tenaga Kerja (JTK)",
      description: "File labour disputes, and get information on employment laws.",
      url: "https://jtksm.mohr.gov.my/en/",
      category: "Labour",
      categoryColor: "bg-blue-100 text-blue-600"
    },
    {
      id: "mygov",
      icon: UserCheck,
      title: "MyGOV Portal",
      description: "The official portal for Malaysian government services.",
      url: "https://www.malaysia.gov.my/portal/index",
      category: "Official",
      categoryColor: "bg-indigo-100 text-indigo-600"
    },
    {
      id: "e-tribunal",
      icon: FileText,
      title: "Tribunal for Consumer Claims",
      description: "File claims for consumer-related disputes.",
      url: "https://ttpm.kpdn.gov.my/",
      category: "Information",
      categoryColor: "bg-teal-100 text-teal-600"
    },
    {
      id: "dosh",
      icon: Globe,
      title: "Dept. of Occupational Safety",
      description: "Information and reporting on workplace safety and health.",
      url: "https://www.dosh.gov.my/index.php/en/",
      category: "Services",
      categoryColor: "bg-pink-100 text-pink-600"
    }
  ];

  const emergencyContacts = [
    { number: "999", service: "Police, Ambulance, Fire" },
    { number: "112", service: "Alternate Emergency Line" },
    { number: "15999", service: "Talian Kasih" },
    { number: "03-26101212", service: "Befrienders KL" }
  ];

  const PortalCard = ({ portal, index }: { portal: any; index: number }) => (
    <div style={{ 
      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`, 
      opacity: 0 
    }}>
      <Card 
          className="hover:shadow-xl transition-all duration-500 backdrop-blur-md bg-white/30 border-gray-300 relative overflow-hidden group"        style={{ 
          backdropFilter: 'blur(10px)',
          transform: 'scale(1)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        data-testid={`portal-${portal.id}`}
      >
        {/* Liquid glass effect elements */}
        <div className="absolute -top-4 -right-4 w-16 h-8 rounded-full bg-blue-400/20 blur-xl group-hover:bg-blue-400/30 transition-colors duration-300"></div>
        <div className="absolute -bottom-4 -left-4 w-20 h-8 rounded-full bg-purple-400/20 blur-xl group-hover:bg-purple-400/30 transition-colors duration-300"></div>
        
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 ${portal.categoryColor.replace('text-', 'bg-').replace('-600', '-100')} rounded-xl flex items-center justify-center backdrop-blur-sm bg-white/30`}>
              <portal.icon className={`h-6 w-6 ${portal.categoryColor.replace('bg-', 'text-').replace('-100', '-600')}`} />
            </div>
            <Badge className={`text-xs ${portal.categoryColor} backdrop-blur-sm bg-white/30 border border-white/20`} variant="secondary">
              {portal.category}
            </Badge>
          </div>
          <CardTitle className="text-lg">{portal.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{portal.description}</p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full backdrop-blur-sm bg-white/30 border border-white/20 hover:bg-white/50"
            data-testid={`link-${portal.id}`}
          >
            <a href={portal.url} target="_blank" rel="noopener noreferrer">
              {portal.category === 'Legislation' ? 'Access File' : 'Visit Portal'}
              <ExternalLink className="ml-2 h-3 w-3" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-16">
      {/* Animated background elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" style={{
          animation: 'pulse-slow 6s infinite'
        }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" style={{
          animation: 'pulse-slower 8s infinite'
        }}></div>
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl" style={{
          animation: 'pulse-medium 4s infinite'
        }}></div>
      </div>
      
      {/* Embedded styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes pulse-slow {
            0%, 100% {
              opacity: 0.1;
            }
            50% {
              opacity: 0.15;
            }
          }
          
          @keyframes pulse-medium {
            0%, 100% {
              opacity: 0.1;
            }
            50% {
              opacity: 0.2;
            }
          }
          
          @keyframes pulse-slower {
            0%, 100% {
              opacity: 0.1;
            }
            50% {
              opacity: 0.12;
            }
          }
        `
      }} />
      
      {/* Header */}
      <div className="mb-8 text-center relative">
        <div className="p-8 rounded-2xl">
          <h2 className="text-6xl font-bold text-foreground mb-4 bg-gradient-to-r from-blue-900 to-blue-900 bg-clip-text text-transparent">
            Official Government Resources
          </h2>
          <p className="font-bold text-gray-600 text-xl max-w-2xl mx-auto">
            Direct links to key legislation and official government service portals.
          </p>
        </div>
      </div>
      <div className="flex-1 border-t border-gray-300 mb-8"></div>

      {/* Timeline separator */}
      <div className="relative mb-12 flex items-center">
        {/* Center text */}
        <span className="px-6 text-4xl font-bold text-gray-600 rounded-lg">
          Legislation Acts
        </span>
      </div>

      {/* Legislation Section */}
      <div className="mb-20 relative">
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 ml-6 ">
          {legislationPortals.map((portal, index) => (
            <PortalCard key={portal.id} portal={portal} index={index} />
          ))}
        </div>
      </div>

      <div className="flex-1 border-t border-gray-300 mb-8"></div>

      {/* Timeline separator */}
      <div className="relative mb-12 flex items-center">
        {/* Center text */}
        <span className="px-6 text-4xl font-bold text-gray-600 rounded-lg">
          Service Portals
        </span>
      </div>

      {/* Service Portals Section */}
      <div className="mb-20 relative">        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 ml-6">
          {servicePortals.map((portal, index) => (
            <PortalCard key={portal.id} portal={portal} index={index + legislationPortals.length} />
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="p-6 rounded-2xl relative overflow-hidden">
        {/* Liquid glass effect elements */}
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-red-400/20 blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-orange-400/20 blur-xl"></div>
        
        <h3 className="flex items-center text-foreground text-xl font-semibold mb-4">
          <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
          Emergency Contacts
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {emergencyContacts.map((contact, index) => (
            <div 
              key={contact.number} 
              className="text-center p-4 rounded-xl transition-all duration-300"
              data-testid={`emergency-${contact.service.toLowerCase()}`}
              style={{ 
                animation: `fadeIn 0.8s ease-out ${index * 0.2}s forwards`,
                opacity: 0
              }}
            >
              <div className="text-2xl font-bold text-destructive mb-1 flex items-center justify-center">
                <Phone className="mr-2 h-5 w-5" />
                {contact.number}
              </div>
              <div className="text-sm text-muted-foreground">{contact.service}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
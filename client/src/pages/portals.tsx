import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Search, 
  Smartphone, 
  ShoppingCart, 
  UserCheck, 
  Train, 
  Calculator, 
  FileText, 
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
      description: "Official page for the Employees’ Social Security Act 1969.",
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

  const PortalCard = ({ portal }: { portal: any }) => (
    <Card 
      className="hover:shadow-md transition-all duration-300 hover:-translate-y-1"
      data-testid={`portal-${portal.id}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 ${portal.categoryColor.replace('text-', 'bg-').replace('-600', '-100')} rounded-xl flex items-center justify-center`}>
            <portal.icon className={`h-6 w-6 ${portal.categoryColor.replace('bg-', 'text-').replace('-100', '-600')}`} />
          </div>
          <Badge className={`text-xs ${portal.categoryColor}`} variant="secondary">
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
          className="w-full"
          data-testid={`link-${portal.id}`}
        >
          <a href={portal.url} target="_blank" rel="noopener noreferrer">
            {portal.category === 'Legislation' ? 'Access File' : 'Visit Portal'}
            <ExternalLink className="ml-2 h-3 w-3" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">Official Government Resources</h2>
        <p className="text-muted-foreground text-lg">Direct links to key legislation and official government service portals.</p>
      </div>

      {/* Legislation Section */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold text-foreground mb-4">Legislation Acts</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {legislationPortals.map((portal) => (
            <PortalCard key={portal.id} portal={portal} />
          ))}
        </div>
      </div>

      {/* Service Portals Section */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold text-foreground mb-4">Government Service Portals</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicePortals.map((portal) => (
            <PortalCard key={portal.id} portal={portal} />
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <Card className="bg-destructive/10 border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {emergencyContacts.map((contact) => (
              <div key={contact.number} className="text-center" data-testid={`emergency-${contact.service.toLowerCase()}`}>
                <div className="text-2xl font-bold text-destructive mb-1 flex items-center justify-center">
                  <Phone className="mr-2 h-5 w-5" />
                  {contact.number}
                </div>
                <div className="text-sm text-muted-foreground">{contact.service}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

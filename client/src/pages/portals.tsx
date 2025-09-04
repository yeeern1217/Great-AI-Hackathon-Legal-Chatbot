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
  const portals = [
    {
      id: "cyber-crime",
      icon: Shield,
      title: "Cyber Crime Reporting",
      description: "Report online fraud, financial crimes, and cyber security incidents",
      url: "https://cybercrime.gov.in",
      category: "Urgent",
      categoryColor: "bg-red-100 text-red-600"
    },
    {
      id: "missing-person",
      icon: Search,
      title: "Missing Person Registry", 
      description: "Report missing persons and search for found individuals",
      url: "https://trackchild.gov.in",
      category: "Emergency",
      categoryColor: "bg-orange-100 text-orange-600"
    },
    {
      id: "lost-device",
      icon: Smartphone,
      title: "Lost Mobile/Device",
      description: "Report lost or stolen mobile phones and electronic devices",
      url: "https://ceir.gov.in",
      category: "Common",
      categoryColor: "bg-blue-100 text-blue-600"
    },
    {
      id: "consumer-complaints",
      icon: ShoppingCart,
      title: "Consumer Complaints",
      description: "File complaints against defective products and poor services",
      url: "https://consumerhelpline.gov.in",
      category: "Popular",
      categoryColor: "bg-green-100 text-green-600"
    },
    {
      id: "police-complaints",
      icon: UserCheck,
      title: "Police Complaints",
      description: "File FIR online and track complaint status",
      url: "https://citizen.mahapolice.gov.in",
      category: "Official",
      categoryColor: "bg-indigo-100 text-indigo-600"
    },
    {
      id: "railway-complaints",
      icon: Train,
      title: "Railway Complaints",
      description: "Lodge complaints related to railway services and facilities",
      url: "https://railmadad.indianrailways.gov.in",
      category: "Transport",
      categoryColor: "bg-purple-100 text-purple-600"
    },
    {
      id: "income-tax",
      icon: Calculator,
      title: "Income Tax Portal",
      description: "File income tax returns and track refund status",
      url: "https://incometaxindia.gov.in",
      category: "Finance",
      categoryColor: "bg-yellow-100 text-yellow-600"
    },
    {
      id: "rti-portal",
      icon: FileText,
      title: "RTI Online Portal",
      description: "File Right to Information applications online",
      url: "https://rtionline.gov.in",
      category: "Information",
      categoryColor: "bg-teal-100 text-teal-600"
    },
    {
      id: "digital-india",
      icon: Globe,
      title: "Digital India Portal",
      description: "Access various government services and certificates",
      url: "https://digitalindia.gov.in",
      category: "Services",
      categoryColor: "bg-pink-100 text-pink-600"
    }
  ];

  const emergencyContacts = [
    { number: "100", service: "Police" },
    { number: "108", service: "Ambulance" },
    { number: "101", service: "Fire" },
    { number: "1094", service: "National Helpline" }
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">Official Government Portals</h2>
        <p className="text-muted-foreground text-lg">Direct links to official government complaint and service portals</p>
      </div>

      {/* Portal Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {portals.map((portal) => (
          <Card 
            key={portal.id} 
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
                  Visit Portal
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
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

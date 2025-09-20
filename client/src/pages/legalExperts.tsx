import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Star, MapPin, Phone, Mail, Calendar, Filter, Search } from 'lucide-react';

interface Expert {
  id: string;
  name: string;
  title: string;
  specialization: string;   // DynamoDB gives single string
  bio: string;
  location: string;
  languages: string[];
  experience: string;
  hourlyRate: string;
  gender: string;
}

const LegalExperts = () => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/experts")
      .then((res) => res.json())
      .then((data) => {
        setExperts(data.experts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching experts:", err);
        setLoading(false);
      });
  }, []);

  const filteredExperts = experts.filter((expert) => {
    const matchesSearch =
      expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization =
      selectedSpecialization === 'all' ||
      expert.specialization.toLowerCase() === selectedSpecialization.toLowerCase();
    return matchesSearch && matchesSpecialization;
  });

  const uniqueSpecializations = Array.from(
    new Set(experts.map((e) => e.specialization))
  ).sort((a, b) => a.localeCompare(b));

  if (loading) {
    return <p className="text-center py-10">Loading experts...</p>;
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-success/10">
                <Users className="h-8 w-8 text-success" />
              </div>
              <h1 className="font-heading text-3xl font-bold">Legal Experts</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with qualified Malaysian labor law experts for professional consultation and legal advice.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search experts by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="md:col-span-2 relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
              >
                <option value="all">All Specializations</option>
                {uniqueSpecializations.map((specialization, index) => (
                  <option key={index} value={specialization}>
                    {specialization}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Experts Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredExperts.map((expert) => (
              <Card key={expert.id} className="hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{expert.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{expert.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {expert.location}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm">{expert.bio}</p>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Specialization</h4>
                    <Badge variant="secondary">{expert.specialization}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Languages:</span>
                      <p className="text-muted-foreground">{expert.languages.join(', ')}</p>
                    </div>
                    <div>
                      <span className="font-medium">Experience:</span>
                      <p className="text-muted-foreground">{expert.experience}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Consultation Rate:</span>
                    <p className="text-muted-foreground">{expert.hourlyRate}/hour</p>
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <a
                      href={`https://wa.me/60124203138?text=${encodeURIComponent(
                        `Hello ${expert.name}, I found your profile on Our Website and would like to consult regarding ${expert.specialization}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.52 3.48A11.85 11.85 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.12.55 4.2 1.6 6.04L0 24l6.2-1.6A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.24-6.2-3.48-8.52zM12 22c-1.92 0-3.8-.52-5.43-1.5l-.39-.23-3.68.95.98-3.58-.25-.39A9.96 9.96 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.14-7.45c-.28-.14-1.65-.81-1.9-.9-.25-.1-.43-.14-.62.14-.18.27-.71.9-.87 1.08-.16.18-.32.2-.6.07-.28-.14-1.2-.44-2.28-1.41-.84-.75-1.41-1.67-1.57-1.95-.16-.27-.02-.42.12-.56.12-.12.28-.32.42-.48.14-.16.18-.27.28-.45.09-.18.05-.34-.02-.48-.07-.14-.62-1.5-.85-2.07-.22-.53-.45-.46-.62-.47h-.53c-.18 0-.48.07-.74.34-.25.27-.97.95-.97 2.3s.99 2.67 1.13 2.86c.14.18 1.96 2.98 4.76 4.18.67.29 1.19.46 1.6.59.67.21 1.27.18 1.75.11.54-.08 1.65-.68 1.88-1.34.23-.65.23-1.21.16-1.34-.07-.14-.25-.22-.53-.36z" />
                      </svg>
                      Chat on WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalExperts;

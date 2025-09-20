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

  if (loading) {
    return <p className="text-center py-10">Loading experts...</p>;
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container px-4 py-8">
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

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
              >
                <option value="all">All Specializations</option>
                {experts.map((e) => (
                  <option key={e.id} value={e.specialization}>
                    {e.specialization}
                  </option>
                ))}
              </select>
            </div>

            <Button variant="outline" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Book Consultation
            </Button>
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

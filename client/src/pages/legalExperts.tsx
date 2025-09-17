import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Star, MapPin, Phone, Mail, Calendar, Filter, Search } from 'lucide-react';

interface Expert {
  id: string;
  name: string;
  title: string;
  specialization: string[];
  location: string;
  rating: number;
  reviews: number;
  languages: string[];
  experience: string;
  hourlyRate: string;
  availability: 'available' | 'busy' | 'unavailable';
  image: string;
}

const LegalExperts = () => {
//   const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');

  const experts: Expert[] = [
    {
      id: '1',
      name: 'Puan Sarah Ahmad',
      title: 'Senior Labor Law Advocate',
      specialization: ['Employment Law', 'Contract Review', 'Industrial Relations'],
      location: 'Kuala Lumpur',
      rating: 4.9,
      reviews: 127,
      languages: ['English', 'Bahasa Malaysia'],
      experience: '12 years',
      hourlyRate: 'RM 350-450',
      availability: 'available',
      image: '/api/placeholder/120/120'
    },
    {
      id: '2',
      name: 'En. Ahmad Rahman',
      title: 'Employment Law Specialist',
      specialization: ['Wrongful Termination', 'Workplace Rights', 'Contract Disputes'],
      location: 'Petaling Jaya',
      rating: 4.8,
      reviews: 89,
      languages: ['English', 'Bahasa Malaysia', 'Mandarin'],
      experience: '8 years',
      hourlyRate: 'RM 280-350',
      availability: 'available',
      image: '/api/placeholder/120/120'
    },
    {
      id: '3',
      name: 'Ms. Priya Devi',
      title: 'Corporate Employment Counsel',
      specialization: ['HR Compliance', 'Policy Review', 'Employment Contracts'],
      location: 'Shah Alam',
      rating: 4.7,
      reviews: 156,
      languages: ['English', 'Tamil', 'Bahasa Malaysia'],
      experience: '15 years',
      hourlyRate: 'RM 400-500',
      availability: 'busy',
      image: '/api/placeholder/120/120'
    },
    {
      id: '4',
      name: 'En. Lim Wei Ming',
      title: 'Industrial Relations Expert',
      specialization: ['Union Relations', 'Collective Bargaining', 'Labor Disputes'],
      location: 'Johor Bahru',
      rating: 4.6,
      reviews: 73,
      languages: ['English', 'Mandarin', 'Bahasa Malaysia'],
      experience: '10 years',
      hourlyRate: 'RM 300-400',
      availability: 'available',
      image: '/api/placeholder/120/120'
    }
  ];

  const specializations = ['all', 'Employment Law', 'Contract Review', 'Wrongful Termination', 'HR Compliance', 'Industrial Relations'];

  const filteredExperts = experts.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expert.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialization = selectedSpecialization === 'all' || 
                                 expert.specialization.includes(selectedSpecialization);
    return matchesSearch && matchesSpecialization;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-success text-success-foreground';
      case 'busy': return 'bg-warning text-warning-foreground';
      case 'unavailable': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Available Now';
      case 'busy': return 'Busy';
      case 'unavailable': return 'Unavailable';
      default: return 'Unknown';
    }
  };

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

          {/* Search and Filter */}
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
                {specializations.map(spec => (
                  <option key={spec} value={spec}>
                    {spec === 'all' ? 'All Specializations' : spec}
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
                        <Badge className={getAvailabilityColor(expert.availability)}>
                          {getAvailabilityText(expert.availability)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{expert.rating}</span>
                          <span className="text-xs text-muted-foreground">({expert.reviews} reviews)</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {expert.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Specializations */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {expert.specialization.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Languages & Experience */}
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

                  {/* Rate */}
                  <div className="text-sm">
                    <span className="font-medium">Consultation Rate:</span>
                    <p className="text-muted-foreground">{expert.hourlyRate}/hour</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1" 
                      disabled={expert.availability === 'unavailable'}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Consultation
                    </Button>
                    
                    <Button variant="outline" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" size="icon">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredExperts.length === 0 && (
            <Card className="mt-8">
              <CardContent className="text-center py-16">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Experts Found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Try adjusting your search criteria or browse all available legal experts.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpecialization('all');
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Contact CTA */}
          <Card className="mt-12 bg-primary/5 border-primary/20">
            <CardContent className="text-center py-8">
              <h2 className="font-heading text-2xl font-bold text-primary mb-4">
                Need Emergency Legal Advice?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our experts are available for urgent consultations. Get immediate help with critical employment law matters.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="default" size="lg">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Emergency Hotline
                </Button>
                <Button variant="outline" size="lg">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Urgent Query
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LegalExperts;
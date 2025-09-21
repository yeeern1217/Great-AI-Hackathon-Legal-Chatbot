import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  MapPin,
  Filter,
  Search,
  ExternalLink,
  MessageCircle,
  Languages,
  Clock,
  DollarSign,
  ChevronsRight,
  Heart
} from 'lucide-react';

interface Expert {
  id: string;
  name: string;
  title: string;
  specialization: string;
  bio: string;
  location: string;
  languages: string[];
  experience: string;
  hourlyRate: string;
  gender: string;
  imageUrl: string;
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
        // Add placeholder images if not provided
        const expertsWithImages = data.experts.map((expert: Expert, index: number) => ({
          ...expert,
          imageUrl: expert.imageUrl || `https://www.hurstpublishers.com/wp-content/uploads/2025/02/Ibrahim-Anwar-author-for-website-2240x2240.jpg`
        }));
        setExperts(expertsWithImages);
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

  const ExpertCard = ({ expert, index }: { expert: Expert; index: number }) => (
    <div
      className="w-full relative mt-4 h-[450px] overflow-hidden group mx-auto bg-white border rounded-md text-black flex flex-col"
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`,
        opacity: 0
      }}
    >
      {/* Background Image */}
      <div className='w-full h-full absolute inset-0'>
        <img
          src={expert.imageUrl}
          alt={expert.name}
          className='h-full w-full scale-105 group-hover:scale-100 object-cover transition-all duration-300 rounded-md'
        />
      </div>

      {/* Hover Overlay - Full Details */}
      <article className="p-8 w-full h-full overflow-hidden z-10 absolute top-0 flex flex-col justify-end rounded-md bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className='translate-y-10 group-hover:translate-y-0 transition-all duration-300 space-y-3'>
          

          <h1 className='text-2xl font-semibold text-white'>{expert.name}</h1>
          <Badge className="text-xs bg-blue-100 text-white backdrop-blur-sm bg-white/30 border border-white/20 w-fit">
            {expert.specialization}
          </Badge>
          <p className='text-white/80'>{expert.title}</p>

          <div className="grid grid-cols-2 gap-4 text-sm text-white">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-blue-300" />
              <div>
                <span className="font-medium">Languages:</span>
                <p className="text-white/80">{expert.languages.join(', ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-300" />
              <div>
                <span className="font-medium">Experience:</span>
                <p className="text-white/80">{expert.experience}</p>
              </div>
            </div>
          </div>

          <div className="text-sm flex items-center gap-2 text-white">
            <DollarSign className="h-4 w-4 text-blue-300" />
            <div>
              <span className="font-medium">Consultation Rate:</span>
              <p className="text-white/80">{expert.hourlyRate}/hour</p>
            </div>
          </div>

          <p className='text-white/80 text-sm'>{expert.bio}</p>

          <Button
            asChild
            className="w-fit bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            <a
              href={`https://wa.me/60124203138?text=${encodeURIComponent(
                `Hello ${expert.name}, I found your profile on Our Website and would like to consult regarding ${expert.specialization}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat on WhatsApp
              <ExternalLink className="ml-2 h-3 w-3" />
            </a>
          </Button>
        </div>
      </article>

      {/* Bottom Info - Visible by default */}
      <article className='p-4 w-full flex flex-col justify-end overflow-hidden absolute bottom-0 rounded-b-md bg-gradient-to-t from-black/90 to-transparent opacity-100 group-hover:opacity-0 group-hover:-bottom-4 transition-all duration-300 text-white'>
        <Badge className="text-xs bg-black text-white backdrop-blur-sm bg-white/30 border border-white/20 w-fit mb-2">
          {expert.specialization}
        </Badge>
        <h1 className='text-xl font-semibold'>{expert.name}</h1>
        <p className='text-sm text-white/80'>{expert.title}</p>
        <div className="flex items-center gap-2 mt-2 text-sm text-white/80">
          <MapPin className="h-3 w-3" />
          {expert.location}
        </div>
      </article>
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
            Legal Experts Directory
          </h2>
          <p className="font-bold text-gray-600 text-xl max-w-2xl mx-auto">
            Connect with qualified Malaysian labor law experts for professional consultation and legal advice.
          </p>
        </div>
      </div>

      <div className="flex-1 border-t border-gray-300 mb-8"></div>

      {/* Search & Filter */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search experts by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-white/30 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="md:col-span-2 relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-white/30 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
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

      {/* Timeline separator */}
      <div className="relative mb-12 flex items-center">
        {/* Center text */}
        <span className="px-6 text-4xl font-bold text-gray-600 rounded-lg">
          Available Experts
        </span>
      </div>

      {/* Experts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperts.map((expert, index) => (
          <ExpertCard key={expert.id} expert={expert} index={index} />
        ))}
      </div>

      {filteredExperts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No experts found matching your criteria.</p>
        </div>
      )}
    </main>
  );
};

export default LegalExperts;
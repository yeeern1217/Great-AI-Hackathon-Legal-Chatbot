import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import HeroSection from '@/components/hero-section';
import { MessageCircle, FileCheck, Users, Shield, Clock, Award } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

const Home = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: MessageCircle,
      title: t('features.chatbot.title'),
      description: t('features.chatbot.desc'),
      href: '/chat',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: FileCheck,
      title: t('features.checker.title'),
      description: t('features.checker.desc'),
      href: '/checker',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      icon: Users,
      title: t('features.experts.title'),
      description: t('features.experts.desc'),
      href: '/experts',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  const benefits = [
    { icon: Shield, title: 'Compliance Check', desc: 'Ensure contracts follow Malaysian Employment Act' },
    { icon: Clock, title: 'Instant Analysis', desc: 'Get results in minutes, not days' },
    { icon: Award, title: 'Expert Verified', desc: 'AI trained by Malaysian legal experts' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <HeroSection />

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1 border-border/50"
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${feature.bgColor} ${feature.color} mb-6`}
                  >
                    <feature.icon className="h-8 w-8" />
                  </div>

                  <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                    <Link to={feature.href}>Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
                Why Choose Our AI Legal Assistant?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Built specifically for Malaysian employment law, our AI understands local regulations and cultural context to provide accurate, relevant advice.
              </p>

              <div className="space-y-6">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{benefit.title}</h4>
                      <p className="text-muted-foreground">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Example Contract Analysis */}
            <div className="relative">
              <div className="bg-card rounded-xl p-8 shadow-card border border-border">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-danger" />
                    <span className="text-sm font-medium">High Risk Clauses Found</span>
                  </div>
                  <div className="bg-danger/10 rounded-lg p-4">
                    <p className="text-sm text-danger-foreground">
                      "Employee must work minimum 60 hours per week"
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      ⚠ Exceeds Malaysian legal working hour limits
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-sm font-medium">Compliant Clause</span>
                  </div>
                  <div className="bg-success/10 rounded-lg p-4">
                    <p className="text-sm text-success-foreground">
                      "Annual leave: 14 days minimum"
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      ✅ Meets Employment Act requirements
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Ready to Protect Your Employment Rights?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of Malaysians who trust our AI legal assistant to review their employment contracts and understand their rights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" size="lg">
              <Link to="/chat">Start Free Chat</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary">
              <Link to="/checker">Upload Contract</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
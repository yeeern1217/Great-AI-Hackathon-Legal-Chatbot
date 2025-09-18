import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, FileCheck, ArrowRight } from 'lucide-react';
import aiAvatar from '@/assets/ai-legal-avatar.png';
import { useLanguage } from '@/hooks/use-language';

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/30 to-primary/5 py-20 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-primary/5 bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="container relative grid lg:grid-cols-2 gap-12 items-center px-4">
        {/* Left: Text */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            {t('hero.subtitle')}
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="text-gradient-hero">{t('hero.title').split(' ').slice(0, 3).join(' ')}</span>
            <br />
            <span className="text-foreground">{t('hero.title').split(' ').slice(3).join(' ')}</span>
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            {t('hero.description')}
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" variant="hero" className="gap-2">
              <Link to="/chat">
                <MessageCircle className="h-5 w-5" />
                {t('hero.chatButton')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to="/checker">
                <FileCheck className="h-5 w-5" />
                {t('hero.uploadButton')}
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 mt-12 pt-8 border-t border-border">
            <div className="text-center">
              <div className="font-heading font-bold text-2xl text-primary">500+</div>
              <div className="text-sm text-muted-foreground">{t('stats.contracts')}</div>
            </div>
            <div className="text-center">
              <div className="font-heading font-bold text-2xl text-primary">2,000+</div>
              <div className="text-sm text-muted-foreground">{t('stats.users')}</div>
            </div>
            <div className="text-center">
              <div className="font-heading font-bold text-2xl text-primary">95%</div>
              <div className="text-sm text-muted-foreground">{t('stats.satisfaction')}</div>
            </div>
          </div>
        </div>

        {/* Right: Avatar */}
        <div className="relative">
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-xl" />
            <div className="relative rounded-2xl bg-card/80 backdrop-blur p-8 shadow-card border border-primary/10">
              <img
                src={aiAvatar}
                alt="AI Legal Assistant Avatar"
                className="w-full h-auto rounded-xl"
              />
              <div className="absolute -top-4 -right-4 bg-success text-success-foreground rounded-full px-3 py-1 text-xs font-medium shadow-lg animate-pulse">
                Online 24/7
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-lg px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-medium">Ready to Help</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


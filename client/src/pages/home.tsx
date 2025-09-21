"use client";
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";

const Home = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Features data
  const features = [
    {
      icon: "📄",
      title: "Upload legal documents",
      description: "Analyze contracts, agreements, and legal papers with our AI-powered system.",
    },
    {
      icon: "🎤",
      title: "Voice input support",
      description: "Speak naturally in your preferred language for easy interaction with the legal assistant.",
    },
    {
      icon: "🌐",
      title: "Multi-language support",
      description: "Get assistance in Bahasa Malaysia, English, Chinese, and Tamil.",
    },
    {
      icon: "🔒",
      title: "Secure & Private",
      description: "Your conversations and documents are kept completely confidential and secure.",
    },
  ];

  // Legal topics data
  const legalTopics = [
    "Employment Act 1955",
    "Industrial Relations Act 1967",
    "Employment Insurance System Act 2017",
    "Workmen's Compensation Act 1952",
    "Occupational Safety and Health Act 1994",
    "Minimum Wages Order"
  ];

  // Button component
  type ButtonSize = "sm" | "md" | "lg";
  type ButtonVariant = "default" | "outline" | "green";

  interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
  }

  const Button = ({
    children,
    className = "",
    variant = "default",
    size = "md",
    ...props
  }: ButtonProps) => {
    const baseClasses = "font-medium rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2";

    const sizeClasses: Record<ButtonSize, string> = {
      sm: "px-4 py-2 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-6 py-3 text-base"
    };

    const variantClasses: Record<ButtonVariant, string> = {
      default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      outline: "border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
      green: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
    };

    const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

    return (
      <button className={classes} {...props}>
        {children}
      </button>
    );
  };

  // Card components
  interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
  }

  const Card = ({ children, className = "", ...props }: CardProps) => {
    return (
      <div 
        className={`relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/20 border-white/20 transition-all duration-300 hover:scale-105 h-full group shadow-xl ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  };

  const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    return (
      <div className={`p-8 text-center flex flex-col items-center relative z-10 ${className}`}>
        {children}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Screen */}
      <div 
        ref={sectionRef}
        className="min-h-screen flex items-center justify-center px-4"
      >
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl text-center">
          <h1 
            className={`text-5xl sm:text-6xl md:text-7xl font-extrabold text-blue-900 leading-tight mb-6 transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            AI Labor Legal Assistant  
            <br />
            for Malaysians
          </h1>
          
          <p 
            className={`text-lg text-gray-700 max-w-3xl mx-auto mb-10 transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            Get instant help with employment contracts and labor law questions.  
            Our AI understands Malaysian labor laws and helps protect your rights.
          </p>
          
          {/* Sub-Headline */}
          <p 
            className={`text-sm text-blue-600 font-medium flex items-center justify-center space-x-2 mb-12 transition-all duration-1000 delay-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <span className="h-2 w-2 bg-green-500 rounded-full inline-block"></span>
            <span>Understand Your Rights. Check Your Contracts. Speak to Experts.</span>
          </p>
          
          {/* CTA Buttons */}
          <div 
            className={`flex flex-col sm:flex-row gap-3 justify-center mb-16 transition-all duration-1000 delay-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <Link href="/chat-assistant">
              <Button size="lg" className="rounded-full">
                Chat with AI Assistant 🤖
              </Button>
            </Link>
            <Link href="/labour-contract-analysis">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full"
              >
                Upload Contract to Check
              </Button>
            </Link>
            <Link href="/legal-experts">
              <Button
                size="lg"
                variant="green"
                className="rounded-full"
              >
                Talk to Legal Experts 👨‍⚖️
              </Button>
            </Link>
          </div>
          
          {/* Stats Section */}
          <div 
            className={`mt-12 flex flex-wrap gap-8 justify-center transition-all duration-1000 delay-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-900">500+</p>
              <p className="text-sm text-gray-600">Contracts Analyzed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-900">2,000+</p>
              <p className="text-sm text-gray-600">Users Helped</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-900">95%</p>
              <p className="text-sm text-gray-600">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Requires scrolling to see */}
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-center gap-4 mb-16">
            <div className="h-px w-16 bg-blue-300 flex-1 max-w-24"></div>
            <h2 className="text-3xl font-bold text-blue-900 px-4">How It Works</h2>
            <div className="h-px w-16 bg-blue-300 flex-1 max-w-24"></div>
          </div>
          
          {/* Features Cards Section - 4 columns with more blur and lower opacity */}
          <div 
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32 transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className={`transition-all duration-700 delay-${index * 100} ${
                  isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
                }`}
              >
                {/* Enhanced blur and opacity card */}
                <Card className="relative overflow-hidden h-full group min-h-[320px] w-full">
                  {/* Liquid effect elements */}
                  <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-purple-400/10 blur-xl"></div>
                  <div className="absolute -bottom-12 -left-12 w-24 h-24 rounded-full bg-blue-400/10 blur-xl"></div>
                  
                  <CardContent className="w-full">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600/10 rounded-full mb-8">
                      <span className="text-3xl">{feature.icon}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-blue-900 mb-6 px-4">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-700 text-base px-2">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Legal Topics Section */}
          <div 
            className={`text-center transition-all duration-1000 delay-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px w-16 bg-blue-300 flex-1 max-w-24"></div>
              <h2 className="text-2xl font-bold text-blue-900 px-4">Legal Topics We Cover</h2>
              <div className="h-px w-16 bg-blue-300 flex-1 max-w-24"></div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {legalTopics.map((topic, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 hover:bg-blue-200 cursor-pointer shadow-sm ${
                    isVisible ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
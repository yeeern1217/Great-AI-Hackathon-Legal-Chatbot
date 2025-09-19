import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import avatarImg from "@/assets/ai-legal-avatar.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center">
      <div className="container mx-auto px-6 lg:px-20 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Sub-Headline */}
          <p className="text-sm text-blue-600 font-medium flex items-center space-x-2">
            <span className="h-2 w-2 bg-green-500 rounded-full inline-block" />
            <span>Understand Your Rights. Check Your Contracts. Speak to Experts.</span>
          </p>
          
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-900 leading-tight">
            AI Labor Legal Assistant  
            <br />
            for Malaysians
          </h1>
          
          {/* Description */}
          <p className="text-lg text-gray-700 max-w-lg">
            Get instant help with employment contracts and labor law questions.  
            Our AI understands the Malaysian Employment Act and helps protect your rights.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/chat-assistant">
              <Button size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700">
                Chat with AI Assistant 🤖
              </Button>
            </Link>
            <Link href="/labour-contract-analysis">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Upload Contract to Check
              </Button>
            </Link>
            <Link href="/legal-experts">
              <Button
                size="lg"
                className="rounded-full bg-green-600 hover:bg-green-700 text-white"
              >
                Talk to Legal Experts 👨‍⚖️
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="mt-8 flex flex-wrap gap-8">
            <div>
              <p className="text-2xl font-bold text-blue-900">500+</p>
              <p className="text-sm text-gray-600">Contracts Analyzed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">2,000+</p>
              <p className="text-sm text-gray-600">Users Helped</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">95%</p>
              <p className="text-sm text-gray-600">Satisfaction Rate</p>
            </div>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="relative flex justify-center">
          
          {/* Avatar Card */}
          <div className="relative bg-white rounded-2xl shadow-lg p-6">
            <img
              src={avatarImg}
              alt="AI Assistant Avatar"
              className="w-64 h-64 object-cover rounded-xl"
            />

            
            {/* Online Tag */}
            <span className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
              Online 24/7
            </span>
          </div>
          
          {/* Ready to Help Badge */}
          <div className="absolute bottom-0 -mb-4 bg-white border border-gray-200 rounded-full px-4 py-1 text-sm text-gray-700 shadow-sm">
            ⭘ Ready to Help
          </div>
        </div>
      </div>
    </div>
  );
}
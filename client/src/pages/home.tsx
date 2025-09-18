import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-center justify-center text-center py-20 bg-gradient-to-b from-background to-muted/30 rounded-2xl">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
          AI Legal Assistant
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-8">
          Your trusted partner for tenancy agreement insights.  
          Get instant contract analysis, AI-powered legal checks, and connect with expert lawyers.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/chat-assistant">
            <Button size="lg" className="rounded-2xl">
              Try Chat Assistant
            </Button>
          </Link>
          <Link href="/labour-contract-analysis">
            <Button size="lg" variant="outline" className="rounded-2xl">
              Upload Contract
            </Button>
          </Link>
          <Link href="/legal-experts">
            <Button size="lg" variant="secondary" className="rounded-2xl">
              Consult Experts
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-3">
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle>AI Chat Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Get instant answers about tenancy agreements.  
              Ask anything in plain language and our AI will assist you.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle>Contract Checker</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Upload your tenancy agreement and let AI analyze clauses, highlight risks, and suggest improvements.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle>Expert Consultation</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Connect with qualified lawyers for professional advice, tailored to your tenancy needs.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

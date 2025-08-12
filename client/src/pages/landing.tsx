import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Zap, Users, Globe, CheckCircle, ArrowRight } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-purple-500/10 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 dark:from-primary dark:to-blue-300 mb-6">
            Alpha's AI Translation Portal
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Professional AI-powered translation services for businesses worldwide. 
            Fast, accurate, and reliable translations in 100+ languages.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Powerful Translation Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered platform delivers enterprise-grade translation services 
              with human-quality results at machine speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>AI-Powered Translation</CardTitle>
                <CardDescription>
                  Advanced neural machine translation with human-level accuracy 
                  and lightning-fast processing.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Multiple File Formats</CardTitle>
                <CardDescription>
                  Support for documents, presentations, spreadsheets, and more. 
                  Upload and translate seamlessly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <Globe className="h-12 w-12 text-primary mb-4" />
                <CardTitle>100+ Languages</CardTitle>
                <CardDescription>
                  Comprehensive language support covering major world languages 
                  and regional dialects.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Organize your translation projects with team management, 
                  role-based access, and progress tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Quality Assurance</CardTitle>
                <CardDescription>
                  Multiple workflow options including AI-only, AI with QC, 
                  and AI with human review.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>API Integration</CardTitle>
                <CardDescription>
                  Powerful REST API for seamless integration with your existing 
                  systems and workflows.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Translation Workflow?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using Alpha's AI Translation Portal 
            to break down language barriers and expand globally.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
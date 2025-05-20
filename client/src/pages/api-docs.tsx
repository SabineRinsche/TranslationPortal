import ApiDocumentation from "@/components/ApiDocumentation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function ApiDocsPage() {
  const [, navigate] = useLocation();
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          className="flex items-center" 
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">API Documentation</h1>
      </div>
      
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <ApiDocumentation />
      </div>
    </div>
  );
}
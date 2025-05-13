import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

const ApiDocumentation = () => {
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The code snippet has been copied to your clipboard."
    });
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-lg font-semibold text-card-foreground mb-4">Alpha's AI Translation API</h2>
      
      <div className="bg-muted rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-card-foreground mb-2">API Overview</h3>
        <p className="text-sm text-muted-foreground">
          Use our REST API to submit translation requests programmatically and integrate with your existing workflows. 
          Our API supports JSON and multipart/form-data for file uploads, with comprehensive translation memory support.
        </p>
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-card-foreground">Authentication</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2" 
              onClick={() => handleCopy("Authorization: Bearer YOUR_API_KEY")}
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Copy</span>
            </Button>
          </div>
          <div className="bg-slate-900 dark:bg-black/90 text-slate-200 rounded-lg p-4 text-sm font-mono overflow-x-auto">
            <p>// API requests require an API key in the header</p>
            <p>Authorization: Bearer YOUR_API_KEY</p>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-card-foreground">Submit a Translation Request</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2" 
              onClick={() => handleCopy(`POST /api/v1/translation
{
  "source_language": "en",
  "target_languages": ["fr", "de", "es"],
  "content": "Your text content here" // or file_id for uploaded files
}`)}
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Copy</span>
            </Button>
          </div>
          <div className="bg-slate-900 dark:bg-black/90 text-slate-200 rounded-lg p-4 text-sm font-mono overflow-x-auto">
            <p>POST /api/v1/translation</p>
            <p>{`{`}</p>
            <p className="ml-4">"source_language": "en",</p>
            <p className="ml-4">"target_languages": ["fr", "de", "es"],</p>
            <p className="ml-4">"content": "Your text content here" // or file_id for uploaded files</p>
            <p>{`}`}</p>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-card-foreground">Upload a File</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2" 
              onClick={() => handleCopy(`POST /api/v1/files
Content-Type: multipart/form-data
file=@/path/to/your/file.pdf`)}
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Copy</span>
            </Button>
          </div>
          <div className="bg-slate-900 dark:bg-black/90 text-slate-200 rounded-lg p-4 text-sm font-mono overflow-x-auto">
            <p>POST /api/v1/files</p>
            <p>Content-Type: multipart/form-data</p>
            <p>file=@/path/to/your/file.pdf</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex flex-wrap gap-3">
        <Button className="dark:bg-primary/90 dark:hover:bg-primary">
          Request API Key
        </Button>
        <Button variant="outline" className="border-border hover:bg-muted">
          View Full Documentation
        </Button>
      </div>
    </div>
  );
};

export default ApiDocumentation;

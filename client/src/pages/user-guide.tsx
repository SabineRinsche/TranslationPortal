import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Upload, Bell, CreditCard, Users, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function UserGuide() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">User Guide</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Complete guide to using Alpha's AI Translation Portal effectively
        </p>
      </div>

      {/* Quick Start */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Quick Start
          </CardTitle>
          <CardDescription>
            Get started with your first translation in 3 simple steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Upload Your File</h3>
              <p className="text-sm text-muted-foreground">
                Go to Workspace and upload your document for translation
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Choose Workflow</h3>
              <p className="text-sm text-muted-foreground">
                Select AI Translation, AI + LQE, or AI + LQE + Human Review
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your translation and receive notifications when complete
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Features */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              File Upload & Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Supported File Types</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">PDF</Badge>
                <Badge variant="secondary">DOCX</Badge>
                <Badge variant="secondary">TXT</Badge>
                <Badge variant="secondary">XLSX</Badge>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Upload Process</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Drag and drop files or click to browse</li>
                <li>• AI analyzes content and estimates word count</li>
                <li>• Select source and target languages</li>
                <li>• Choose translation workflow type</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Translation Workflows */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Translation Workflows
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                AI Translation only
              </h4>
              <p className="text-sm text-muted-foreground">
                Fast, AI-powered translation for general content
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                AI Translation + LQE
              </h4>
              <p className="text-sm text-muted-foreground">
                AI translation with Language Quality Evaluation
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                AI Translation + LQE + HR
              </h4>
              <p className="text-sm text-muted-foreground">
                Premium service with human review for critical content
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Stay updated on your translation progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Notification Types</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Job Completed</p>
                    <p className="text-xs text-muted-foreground">When your translation is ready</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Status Updates</p>
                    <p className="text-xs text-muted-foreground">Progress changes during processing</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">System Alerts</p>
                    <p className="text-xs text-muted-foreground">Important account or service updates</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">How to Use</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Click the bell icon in the header to view notifications</li>
                <li>• Red badge shows unread notification count</li>
                <li>• Click notifications to view related job details</li>
                <li>• Mark individual items as read or clear all at once</li>
                <li>• Notifications include animated alerts for new items</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard & Tracking */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Dashboard & Credit Management
          </CardTitle>
          <CardDescription>
            Monitor your usage and account status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Translation History</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View all past and current translation jobs</li>
                <li>• Filter by status, date, or language pair</li>
                <li>• Download completed translations</li>
                <li>• Track job progress in real-time</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Credit Usage</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Monitor remaining translation credits</li>
                <li>• View detailed usage breakdown by job</li>
                <li>• Track monthly spending patterns</li>
                <li>• Get alerts before credits run low</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Preferences */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Language Preferences</CardTitle>
          <CardDescription>
            Customize your language options for faster workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">How to Set Preferences</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Go to Settings from your profile menu</li>
                <li>Navigate to the Language Preferences section</li>
                <li>Search and select your commonly used languages</li>
                <li>Save preferences to filter language options</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Benefits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Faster language selection during file upload</li>
                <li>• Customized language dropdown menus</li>
                <li>• Improved workflow efficiency</li>
                <li>• Reduced selection errors</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips & Best Practices */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tips & Best Practices</CardTitle>
          <CardDescription>
            Get the most out of your translation experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">File Preparation</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use clear, well-formatted documents</li>
                <li>• Avoid scanned images when possible</li>
                <li>• Include context notes for technical terms</li>
                <li>• Check file size limits before upload</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Workflow Selection</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use AI-only for informal content</li>
                <li>• Choose AI + LQE for business documents</li>
                <li>• Select AI + LQE + HR for legal/medical content</li>
                <li>• Consider urgency vs. quality trade-offs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Help */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Getting Help</CardTitle>
          <CardDescription>
            Support resources and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Support Channels</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">AI Assistant</p>
                  <p className="text-xs text-muted-foreground">Chat with our AI helper for instant answers</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email Support</p>
                  <p className="text-xs text-muted-foreground">Contact support@alphatranslation.com</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Team Administrator</p>
                  <p className="text-xs text-muted-foreground">Reach out to your team admin for account issues</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Common Issues</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• File upload failures: Check file size and format</li>
                <li>• Missing notifications: Check browser permissions</li>
                <li>• Credit issues: Contact your team administrator</li>
                <li>• Quality concerns: Use higher-tier workflows</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/workspace">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Start Translation
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            View Jobs
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>
    </div>
  );
}
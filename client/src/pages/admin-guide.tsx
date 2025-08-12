import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Users, 
  CreditCard, 
  FileCode, 
  Settings, 
  UserPlus, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  Database,
  Key,
  Mail,
  Bell,
  Palette,
  BookOpen
} from "lucide-react";
import { Link } from "wouter";

export default function AdminGuide() {
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin User Guide</h1>
          <Badge variant="secondary" className="ml-2">Administrator</Badge>
        </div>
        <p className="text-lg text-muted-foreground">
          Complete administrative guide for managing teams, users, and system operations
        </p>
      </div>

      {/* Admin Overview */}
      <Alert className="mb-8">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Administrator Access:</strong> You have elevated privileges to manage teams, users, credits, and system settings. 
          Use these powers responsibly and follow your organization's policies.
        </AlertDescription>
      </Alert>

      {/* Quick Admin Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Quick Admin Actions
          </CardTitle>
          <CardDescription>
            Common administrative tasks you can perform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/teams">
              <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Manage Teams</h3>
                <p className="text-xs text-muted-foreground">View and edit team details</p>
              </div>
            </Link>
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <UserPlus className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Add Users</h3>
              <p className="text-xs text-muted-foreground">Create new user accounts</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <CreditCard className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Add Credits</h3>
              <p className="text-xs text-muted-foreground">Manage team credit balances</p>
            </div>
            <Link href="/api-docs">
              <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <FileCode className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">API Docs</h3>
                <p className="text-xs text-muted-foreground">View API documentation</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Team Management */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Management
          </CardTitle>
          <CardDescription>
            Comprehensive team administration and oversight
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Team Overview
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• View all teams in your organization</li>
                <li>• Monitor team credit balances and usage</li>
                <li>• Track subscription plans and billing status</li>
                <li>• Access detailed team analytics</li>
                <li>• View team member counts and roles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Team Operations
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Create new teams and configure settings</li>
                <li>• Edit team names and descriptions</li>
                <li>• Manage team subscription plans</li>
                <li>• Set credit limits and usage policies</li>
                <li>• Archive or deactivate teams</li>
              </ul>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-semibold mb-3">Team Detail Pages</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Click on any team to access the detailed management interface with three main tabs:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h5 className="font-medium mb-2">Team Members</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• View all team members</li>
                  <li>• Check user roles and status</li>
                  <li>• See email verification status</li>
                  <li>• Add new users to the team</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h5 className="font-medium mb-2">Credit Usage</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Monitor credit consumption</li>
                  <li>• View transaction history</li>
                  <li>• Add credits to team balance</li>
                  <li>• Track usage patterns</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h5 className="font-medium mb-2">Account Details</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Edit team information</li>
                  <li>• Manage subscription plans</li>
                  <li>• Update billing details</li>
                  <li>• Configure team settings</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Handle user accounts, registrations, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">New User Registration</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium mb-1">Creating Users</h5>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Use the "Add User" form in team detail pages</li>
                    <li>• Fill in first name, last name, and email</li>
                    <li>• Select the appropriate team assignment</li>
                    <li>• Choose user role (admin or client)</li>
                    <li>• Users receive email instructions automatically</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-1">Pending Registrations</h5>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Monitor the "New Registrations" tab</li>
                    <li>• Review unassigned user registrations</li>
                    <li>• Assign users to appropriate teams</li>
                    <li>• Approve or manage registration requests</li>
                  </ul>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">User Account Management</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium mb-1">User Status</h5>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Track email verification status</li>
                    <li>• Monitor user activity and last login</li>
                    <li>• Manage account permissions</li>
                    <li>• Handle account deactivation if needed</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-1">Role Management</h5>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• <strong>Admin:</strong> Full system access and management</li>
                    <li>• <strong>Client:</strong> Translation services and basic features</li>
                    <li>• Change user roles as needed</li>
                    <li>• Ensure proper access control</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Management */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credit Management
          </CardTitle>
          <CardDescription>
            Monitor and manage translation credits across teams
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Credit Operations</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• <strong>Add Credits:</strong> Increase team credit balances</li>
                <li>• <strong>Monitor Usage:</strong> Track credit consumption patterns</li>
                <li>• <strong>Set Limits:</strong> Configure usage alerts and limits</li>
                <li>• <strong>Transaction History:</strong> View detailed credit transactions</li>
                <li>• <strong>Billing Integration:</strong> Manage subscription-based credits</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Credit Types & Workflow Costs</h4>
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <h5 className="font-medium text-sm mb-1">AI Translation only</h5>
                  <p className="text-xs text-muted-foreground">Lowest cost, fastest turnaround</p>
                </div>
                <div className="border rounded-lg p-3">
                  <h5 className="font-medium text-sm mb-1">AI Translation + LQE</h5>
                  <p className="text-xs text-muted-foreground">Medium cost, quality evaluation included</p>
                </div>
                <div className="border rounded-lg p-3">
                  <h5 className="font-medium text-sm mb-1">AI Translation + LQE + HR</h5>
                  <p className="text-xs text-muted-foreground">Highest cost, human review included</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Administration */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Administration
          </CardTitle>
          <CardDescription>
            Advanced system management and configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Management
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Access comprehensive API documentation</li>
                <li>• Generate and manage API keys</li>
                <li>• Monitor API usage and rate limits</li>
                <li>• Configure webhook endpoints</li>
                <li>• Test external integrations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notification System
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Configure system-wide notifications</li>
                <li>• Manage email notification templates</li>
                <li>• Set up webhook notifications</li>
                <li>• Monitor notification delivery</li>
                <li>• Handle notification preferences</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Style Guide
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Access design system documentation</li>
                <li>• View color palettes and typography</li>
                <li>• Review UI component library</li>
                <li>• Maintain brand consistency</li>
                <li>• Guide development standards</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring & Analytics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Monitoring & Analytics
          </CardTitle>
          <CardDescription>
            Track system performance and user activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">System Metrics</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• <strong>Translation Volume:</strong> Track daily/monthly translation requests</li>
                <li>• <strong>User Activity:</strong> Monitor login patterns and usage</li>
                <li>• <strong>Credit Consumption:</strong> Analyze spending across teams</li>
                <li>• <strong>Workflow Distribution:</strong> See which workflows are most popular</li>
                <li>• <strong>Performance Metrics:</strong> Monitor system response times</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Reporting Tools</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Generate monthly usage reports</li>
                <li>• Export team activity summaries</li>
                <li>• Create billing and invoice data</li>
                <li>• Track system growth metrics</li>
                <li>• Monitor quality and satisfaction scores</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security & Compliance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Compliance
          </CardTitle>
          <CardDescription>
            Maintain security standards and regulatory compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Security Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Regularly review user access and permissions</li>
                <li>• Monitor for unusual activity patterns</li>
                <li>• Ensure strong password policies</li>
                <li>• Implement two-factor authentication</li>
                <li>• Keep system configurations secure</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Data Protection</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Handle customer data according to GDPR/CCPA</li>
                <li>• Maintain translation confidentiality</li>
                <li>• Secure file upload and storage</li>
                <li>• Regular backup and recovery procedures</li>
                <li>• Audit trail maintenance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Troubleshooting & Support
          </CardTitle>
          <CardDescription>
            Common issues and resolution procedures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Common Admin Issues</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium">User Can't Access Team</h5>
                  <p className="text-xs text-muted-foreground">Check team assignment and user role permissions</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium">Credit Balance Problems</h5>
                  <p className="text-xs text-muted-foreground">Verify team credits and transaction history</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium">Registration Issues</h5>
                  <p className="text-xs text-muted-foreground">Check new registrations tab for pending approvals</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium">API Integration Problems</h5>
                  <p className="text-xs text-muted-foreground">Review API documentation and key configurations</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support Resources</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    Admin Support Channel
                  </h5>
                  <p className="text-xs text-muted-foreground">admin-support@alphatranslation.com</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium flex items-center gap-2">
                    <FileCode className="h-3 w-3" />
                    Technical Documentation
                  </h5>
                  <p className="text-xs text-muted-foreground">Access API docs and integration guides</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="h-3 w-3" />
                    User Training
                  </h5>
                  <p className="text-xs text-muted-foreground">Help users with the client user guide</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium flex items-center gap-2">
                    <Database className="h-3 w-3" />
                    System Status
                  </h5>
                  <p className="text-xs text-muted-foreground">Monitor system health and performance</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/teams">
          <Button className="gap-2">
            <Users className="h-4 w-4" />
            Manage Teams
          </Button>
        </Link>
        <Link href="/api-docs">
          <Button variant="outline" className="gap-2">
            <FileCode className="h-4 w-4" />
            API Documentation
          </Button>
        </Link>
        <Link href="/style-guide">
          <Button variant="outline" className="gap-2">
            <Palette className="h-4 w-4" />
            Style Guide
          </Button>
        </Link>
        <Link href="/user-guide">
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Client User Guide
          </Button>
        </Link>
      </div>
    </div>
  );
}
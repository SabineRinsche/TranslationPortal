import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Dashboard from '@/components/Dashboard';
import JobsList from '@/components/JobsList';

export default function DashboardPage() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState('analytics');
  
  // Get tab from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    
    if (tabParam === 'usage') {
      setActiveTab('usage');
    } else if (tabParam === 'jobs') {
      setActiveTab('jobs');
    } else if (tabParam === 'analytics') {
      setActiveTab('analytics');
    }
  }, [location]);
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', value);
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Translation Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="usage">Credit Usage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics">
          <Dashboard />
        </TabsContent>
        
        <TabsContent value="jobs">
          <JobsList />
        </TabsContent>
        
        <TabsContent value="usage">
          <div className="grid gap-6">
            <h2 className="text-xl font-semibold">Credit Usage History</h2>
            <p className="text-muted-foreground">
              Track your translation credit usage across all projects and time periods
            </p>
            <Dashboard initialTab="usage" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Dashboard from '@/components/Dashboard';
import JobsList from '@/components/JobsList';
import TranslationAssetsList from '@/components/TranslationAssetsList';

export default function DashboardPage() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get tab from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    
    if (tabParam === 'usage') {
      setActiveTab('usage');
    } else if (tabParam === 'jobs') {
      setActiveTab('jobs');
    } else if (tabParam === 'assets') {
      setActiveTab('assets');
    } else if (tabParam === 'overview') {
      setActiveTab('overview');
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
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="assets">Translation Assets</TabsTrigger>
          <TabsTrigger value="usage">Credit Usage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Dashboard initialTab="overview" />
        </TabsContent>
        
        <TabsContent value="jobs">
          <JobsList />
        </TabsContent>
        
        <TabsContent value="assets">
          <TranslationAssetsList />
        </TabsContent>
        
        <TabsContent value="usage">
          <Dashboard initialTab="usage" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
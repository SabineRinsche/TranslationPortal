import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Dashboard from '@/components/Dashboard';
import JobsList from '@/components/ProjectsList';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Translation Dashboard</h1>
      
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="projects">Jobs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics">
          <Dashboard />
        </TabsContent>
        
        <TabsContent value="projects">
          <JobsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
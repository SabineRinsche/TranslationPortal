import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TranslationRequest } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { format } from 'date-fns';

// TranslationRequestTable component to show translation requests
const TranslationRequestTable = ({ requests }: { requests: TranslationRequest[] }) => {
  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">File Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Source Language</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Target Languages</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Credits Used</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Cost</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((request) => (
                <tr key={request.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">{request.id}</td>
                  <td className="px-4 py-3 text-sm">{request.fileName}</td>
                  <td className="px-4 py-3 text-sm">{request.sourceLanguage}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {request.targetLanguages.map((lang) => (
                        <span key={lang} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{request.creditsRequired.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">{request.totalCost}</td>
                  <td className="px-4 py-3 text-sm">{format(new Date(request.createdAt), 'MMM dd, yyyy')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No translation requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { data: requests, isLoading } = useQuery({
    queryKey: ['/api/translation-requests'],
    staleTime: 60000, // 1 minute
  });

  // Prepare data for credit usage chart (by month)
  const creditUsageData = requests ? prepareMonthlyData(requests) : [];
  
  // Prepare data for language popularity
  const languagePopularityData = requests ? prepareLanguageData(requests) : [];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Translation Dashboard</h1>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Translation Requests</TabsTrigger>
          <TabsTrigger value="usage">Credit Usage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Requests</CardTitle>
                <CardDescription>All time translation requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{requests?.length || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Credits Used</CardTitle>
                <CardDescription>All time credit usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {requests?.reduce((total, req) => total + req.creditsRequired, 0).toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Spent</CardTitle>
                <CardDescription>All time cost</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  £{(requests?.reduce((total, req) => {
                    const cost = parseFloat(req.totalCost.replace('£', ''));
                    return total + cost;
                  }, 0) || 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Credit Usage Over Time</CardTitle>
                <CardDescription>Monthly usage trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={creditUsageData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} credits`, 'Usage']} />
                      <Line 
                        type="monotone" 
                        dataKey="credits" 
                        stroke="#16173f" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Languages</CardTitle>
                <CardDescription>Target language distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={languagePopularityData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="language" />
                      <Tooltip formatter={(value) => [`${value} requests`, 'Frequency']} />
                      <Bar dataKey="count" fill="#ee3667" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Translation Request History</CardTitle>
              <CardDescription>View all your past translation requests</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <TranslationRequestTable requests={requests || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Credit Usage Analytics</CardTitle>
              <CardDescription>Monitor your translation credit usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={creditUsageData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} credits`, 'Usage']} />
                    <Legend />
                    <Bar dataKey="credits" name="Credits Used" fill="#16173f" />
                    <Bar dataKey="cost" name="Cost (£)" fill="#ee3667" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to prepare monthly data for charts
function prepareMonthlyData(requests: TranslationRequest[]) {
  const monthlyData: Record<string, { credits: number; cost: number }> = {};
  
  requests.forEach(request => {
    const date = new Date(request.createdAt);
    const monthYear = format(date, 'MMM yyyy');
    const cost = parseFloat(request.totalCost.replace('£', ''));
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { credits: 0, cost: 0 };
    }
    
    monthlyData[monthYear].credits += request.creditsRequired;
    monthlyData[monthYear].cost += cost;
  });
  
  // Convert to array and sort by date
  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      credits: data.credits,
      cost: parseFloat(data.cost.toFixed(2))
    }))
    .sort((a, b) => {
      // Sort by date (convert month strings back to date objects for comparison)
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
}

// Helper function to prepare language popularity data
function prepareLanguageData(requests: TranslationRequest[]) {
  const languageCount: Record<string, number> = {};
  
  requests.forEach(request => {
    request.targetLanguages.forEach(lang => {
      if (!languageCount[lang]) {
        languageCount[lang] = 0;
      }
      languageCount[lang]++;
    });
  });
  
  // Convert to array and sort by count (descending)
  return Object.entries(languageCount)
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Take top 10 languages
}

export default Dashboard;
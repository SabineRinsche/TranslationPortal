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
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
} from 'recharts';
import { 
  Activity, 
  BarChart as BarChartIcon, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  Clock, 
  CreditCard, 
  DollarSign, 
  FileText, 
  HelpCircle, 
  MoreHorizontal, 
  PieChart as PieChartIcon,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
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

interface DashboardProps {
  initialTab?: string;
}

const Dashboard = ({ initialTab }: DashboardProps = {}) => {
  const { data: requests, isLoading } = useQuery<TranslationRequest[]>({
    queryKey: ['/api/translation-requests'],
    staleTime: 60000, // 1 minute
  });

  // Prepare data for credit usage chart (by month)
  const creditUsageData = requests && requests.length > 0 ? prepareMonthlyData(requests) : [];
  
  // Prepare data for language popularity
  const languagePopularityData = requests && requests.length > 0 ? prepareLanguageData(requests) : [];
  
  // Prepare data for workflow distribution
  const workflowData = requests && requests.length > 0 ? prepareWorkflowData(requests) : [];
  
  // Prepare data for target language count by source language
  const languagePairsData = requests && requests.length > 0 ? prepareLanguagePairsData(requests) : [];
  
  // Calculate month-over-month change in credit usage
  const creditTrend = calculateTrend(creditUsageData, 'credits');
  const costTrend = calculateTrend(creditUsageData, 'cost');
  
  // Color palette for charts
  const COLORS = ['#16173f', '#ee3667', '#5271ff', '#28c1f5', '#8b5cf6', '#fca5a5', '#34d399'];
  
  // Analytics summary data
  const totalCredits = requests ? requests.reduce((total, req) => total + req.creditsRequired, 0) : 0;
  const totalCost = requests ? requests.reduce((total, req) => {
    const cost = parseFloat(req.totalCost.replace('£', ''));
    return total + cost;
  }, 0) : 0;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Translation Dashboard</h1>
      
      <Tabs defaultValue={initialTab || "overview"} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Translation Requests</TabsTrigger>
          <TabsTrigger value="usage">Credit Usage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* KPI Cards with trend indicators */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden border-l-4 border-l-primary">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <CardDescription className="text-xs">All time translation requests</CardDescription>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requests?.length.toLocaleString() ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-xs font-medium">
                    {creditUsageData.length > 1 ? (
                      creditUsageData[creditUsageData.length - 1].month
                    ) : "No data"}
                  </span>
                </p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-l-4 border-l-blue-500">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-medium">Total Credits Used</CardTitle>
                  <CardDescription className="text-xs">All time credit usage</CardDescription>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-full">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCredits.toLocaleString()}</div>
                {creditTrend.percentage !== 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {creditTrend.isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${creditTrend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {creditTrend.percentage}% from last month
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-l-4 border-l-purple-500">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <CardDescription className="text-xs">All time cost</CardDescription>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-full">
                  <DollarSign className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">£{totalCost.toFixed(2)}</div>
                {costTrend.percentage !== 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {costTrend.isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${costTrend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {costTrend.percentage}% from last month
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-l-4 border-l-amber-500">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-medium">Average Cost per Request</CardTitle>
                  <CardDescription className="text-xs">Cost efficiency metric</CardDescription>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-full">
                  <Activity className="h-4 w-4 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  £{requests && requests.length > 0 ? (totalCost / requests.length).toFixed(2) : '0.00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Per translation request</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Visualization Row 1 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Workflow Distribution */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Workflow Distribution</CardTitle>
                <CardDescription className="text-xs">Translation workflow usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  {workflowData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={workflowData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="count"
                          label={({ name, percent }) => `${name.split(' ').pop() || ''} ${(percent * 100).toFixed(0)}%`}
                        >
                          {workflowData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => [`${value} requests`, props.payload.name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-muted-foreground">No workflow data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Credit Usage Over Time (Area Chart) */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Credit Usage Over Time</CardTitle>
                <CardDescription className="text-xs">Monthly usage trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  {creditUsageData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={creditUsageData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                      >
                        <defs>
                          <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16173f" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#16173f" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            `${value.toLocaleString()}`, 
                            name === 'credits' ? 'Credits' : 'Cost (£)'
                          ]}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="credits" 
                          name="Credits Used"
                          stroke="#16173f" 
                          fillOpacity={1}
                          fill="url(#colorCredits)" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cost" 
                          name="Cost (£)"
                          stroke="#ee3667" 
                          strokeWidth={2}
                          activeDot={{ r: 6 }} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-muted-foreground">No credit usage data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Visualization Row 2 */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Language Popularity Chart (Horizontal Bar) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Most Popular Languages</CardTitle>
                <CardDescription className="text-xs">Target language distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {languagePopularityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={languagePopularityData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 80, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="language" />
                        <Tooltip formatter={(value) => [`${value} requests`, 'Frequency']} />
                        <Bar 
                          dataKey="count" 
                          name="Requests" 
                          radius={[0, 4, 4, 0]}
                        >
                          {languagePopularityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-muted-foreground">No language data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Workflow Credit Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Workflow Credit Usage</CardTitle>
                <CardDescription className="text-xs">Credits by workflow type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {workflowData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={workflowData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          tickFormatter={(value) => value.split(' ').pop() || value} 
                          angle={-45} 
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            `${value.toLocaleString()}`, 
                            name === 'credits' ? 'Credits' : 'Cost (£)'
                          ]} 
                        />
                        <Legend />
                        <Bar dataKey="credits" name="Credits Used" fill="#16173f" />
                        <Bar dataKey="cost" name="Cost (£)" fill="#ee3667" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-muted-foreground">No workflow data available</p>
                    </div>
                  )}
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
        
        <TabsContent value="usage" className="space-y-4">
          {/* Credit Usage Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Credits Used</CardTitle>
                <CardDescription className="text-xs">All time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCredits.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  £{(totalCredits * 0.001).toFixed(2)} total value
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Credits Per Request</CardTitle>
                <CardDescription className="text-xs">Efficiency metric</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {requests && requests.length > 0 
                    ? Math.round(totalCredits / requests.length).toLocaleString() 
                    : '0'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per translation request
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Characters</CardTitle>
                <CardDescription className="text-xs">Per target language</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {requests && requests.length > 0 
                    ? Math.round(requests.reduce((sum, req) => sum + req.charCount, 0) / requests.length).toLocaleString() 
                    : '0'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Characters per document
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Languages</CardTitle>
                <CardDescription className="text-xs">Per request</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {requests && requests.length > 0 
                    ? (requests.reduce((sum, req) => sum + req.targetLanguages.length, 0) / requests.length).toFixed(1) 
                    : '0'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Target languages per request
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Credit Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Usage Trends</CardTitle>
              <CardDescription>Monthly credit and cost analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {creditUsageData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={creditUsageData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" stroke="#16173f" />
                      <YAxis yAxisId="right" orientation="right" stroke="#ee3667" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'Credits Used') {
                            const numValue = Number(value);
                            return [isNaN(numValue) ? '0 credits' : `${numValue.toLocaleString()} credits`, name];
                          } else {
                            const numValue = Number(value);
                            return [isNaN(numValue) ? '£0.00' : `£${numValue.toFixed(2)}`, name];
                          }
                        }} 
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="credits" name="Credits Used" fill="#16173f" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="cost" name="Cost (£)" stroke="#ee3667" strokeWidth={3} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-muted-foreground">No credit usage data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Credit Usage by Workflow Type */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Comparison</CardTitle>
                <CardDescription>Credit usage by workflow type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {workflowData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={workflowData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          tickFormatter={(value) => value.split(' ').pop() || value}
                        />
                        <Tooltip 
                          formatter={(value, name) => [
                            `${Number(value).toLocaleString()} credits`, 
                            'Credit Usage'
                          ]} 
                        />
                        <Bar 
                          dataKey="credits" 
                          name="Credits Used" 
                          radius={[0, 4, 4, 0]}
                        >
                          {workflowData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-muted-foreground">No workflow data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Cost Distribution</CardTitle>
                <CardDescription>Cost breakdown by workflow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {workflowData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={workflowData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          dataKey="cost"
                          nameKey="name"
                          label={({ name, percent }) => 
                            `${name.split(' ').pop()}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {workflowData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => {
                            const numValue = Number(value);
                            return isNaN(numValue) ? '£0.00' : `£${numValue.toFixed(2)}`;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-muted-foreground">No cost data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to prepare monthly data for charts
function prepareMonthlyData(requests: TranslationRequest[]) {
  const monthlyData: Record<string, { credits: number; cost: number }> = {};
  
  requests.forEach(request => {
    // Ensure we can handle both string dates and Date objects
    const date = request.createdAt instanceof Date 
      ? request.createdAt 
      : new Date(request.createdAt as unknown as string);
      
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
      const monthAStr = a.month.split(' ')[0]; // Get month abbreviation
      const monthBStr = b.month.split(' ')[0]; 
      const yearA = parseInt(a.month.split(' ')[1]);
      const yearB = parseInt(b.month.split(' ')[1]);
      
      // First compare years
      if (yearA !== yearB) {
        return yearA - yearB;
      }
      
      // Then compare months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(monthAStr) - months.indexOf(monthBStr);
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

// Helper function to prepare workflow distribution data
function prepareWorkflowData(requests: TranslationRequest[]) {
  const workflowCount: Record<string, {count: number, credits: number, cost: number}> = {
    'AI Neural Translation': {count: 0, credits: 0, cost: 0},
    'AI Translation with Quality Assurance': {count: 0, credits: 0, cost: 0},
    'AI Translation with Expert Review': {count: 0, credits: 0, cost: 0},
  };
  
  requests.forEach(request => {
    let workflowName = 'AI Neural Translation'; // Default
    
    if (request.workflow === 'ai-translation-qc') {
      workflowName = 'AI Translation with Quality Assurance';
    } else if (request.workflow === 'ai-translation-human') {
      workflowName = 'AI Translation with Expert Review';
    }
    
    workflowCount[workflowName].count++;
    workflowCount[workflowName].credits += request.creditsRequired;
    workflowCount[workflowName].cost += parseFloat(request.totalCost.replace('£', ''));
  });
  
  // Convert to array format for charts
  return Object.entries(workflowCount)
    .map(([name, data]) => ({
      name,
      count: data.count,
      credits: data.credits,
      cost: parseFloat(data.cost.toFixed(2)),
      value: data.count, // For pie charts
    }))
    .filter(item => item.count > 0); // Only include workflows with requests
}

// Helper function to prepare language pair data
function prepareLanguagePairsData(requests: TranslationRequest[]) {
  const languagePairs: Record<string, {[targetLang: string]: number}> = {};
  
  requests.forEach(request => {
    const sourceLang = request.sourceLanguage;
    
    if (!languagePairs[sourceLang]) {
      languagePairs[sourceLang] = {};
    }
    
    request.targetLanguages.forEach(targetLang => {
      if (!languagePairs[sourceLang][targetLang]) {
        languagePairs[sourceLang][targetLang] = 0;
      }
      languagePairs[sourceLang][targetLang]++;
    });
  });
  
  // Convert to array format for charts
  const result = [];
  for (const [source, targets] of Object.entries(languagePairs)) {
    for (const [target, count] of Object.entries(targets)) {
      result.push({
        sourceLang: source,
        targetLang: target,
        count
      });
    }
  }
  
  return result.sort((a, b) => b.count - a.count).slice(0, 15); // Top 15 language pairs
}

// Helper function to calculate trend (percentage change)
function calculateTrend(data: any[], key: string): { value: number, percentage: number, isPositive: boolean } {
  if (data.length < 2) {
    return { value: 0, percentage: 0, isPositive: true };
  }
  
  // Get the last two months of data
  const current = data[data.length - 1][key] || 0;
  const previous = data[data.length - 2][key] || 0;
  
  const difference = current - previous;
  const percentage = previous === 0 ? 100 : Math.round((difference / previous) * 100);
  
  return {
    value: difference,
    percentage,
    isPositive: percentage >= 0
  };
}

export default Dashboard;
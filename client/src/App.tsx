import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ManualNotificationTrigger } from "@/components/ManualNotificationTrigger";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import DashboardPage from "@/pages/dashboard";
import ProfilePage from "@/pages/profile";
import SettingsPage from "@/pages/settings";
import JobDetail from "@/pages/job-detail";
import Login from "@/pages/login";
import ApiDocsPage from "@/pages/api-docs";
import StyleGuide from "@/pages/style-guide";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Protected route component that requires authentication
const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <Component {...rest} />;
};

// Admin-only route component
const AdminRoute = ({ component: Component, ...rest }: any) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user || user.role !== 'admin') {
    return <Redirect to="/dashboard" />;
  }
  
  return <Component {...rest} />;
};

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Home} />
      <Route path="/dashboard">
        {(params) => <ProtectedRoute component={DashboardPage} params={params} />}
      </Route>
      <Route path="/profile">
        {(params) => <ProtectedRoute component={ProfilePage} params={params} />}
      </Route>
      <Route path="/settings">
        {(params) => <ProtectedRoute component={SettingsPage} params={params} />}
      </Route>
      <Route path="/jobs/:id">
        {(params) => <ProtectedRoute component={JobDetail} params={params} />}
      </Route>
      <Route path="/api-docs">
        {(params) => <AdminRoute component={ApiDocsPage} params={params} />}
      </Route>
      <Route path="/style-guide">
        {(params) => <AdminRoute component={StyleGuide} params={params} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <TooltipProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <Router />
                </main>
                <ManualNotificationTrigger />
              </div>
              <Toaster />
            </TooltipProvider>
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

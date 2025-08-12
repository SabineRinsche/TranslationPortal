import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'wouter';
import Landing from './landing';

const Home = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Show landing page for unauthenticated users
  if (!isAuthenticated) {
    return <Landing />;
  }

  // Redirect authenticated users to workspace (AI assistant and file upload)
  return <Redirect to="/workspace" />;
};

export default Home;

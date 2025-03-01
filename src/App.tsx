
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import { MessagingProvider } from "./context/MessagingContext";
import { AuthProvider } from "./context/AuthContext";
import { StoryProvider } from "./context/StoryContext";
import { useAuth } from "./context/AuthContext";
import { StoryViewer } from "./components/story/StoryViewer";
import { StoryCreator } from "./components/story/StoryCreator";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/user/:userId" 
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <MessagingProvider>
          <StoryProvider>
            <Toaster />
            <Sonner />
            <StoryViewer />
            <StoryCreator />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </StoryProvider>
        </MessagingProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

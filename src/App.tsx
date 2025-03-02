
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Chat from '@/pages/Chat';
import Status from '@/pages/Status';
import UserProfile from '@/pages/UserProfile';
import Settings from '@/pages/Settings';
import { Toaster } from '@/components/ui/toaster';
import { CallModal } from '@/components/CallModal';
import { useMessaging } from '@/context/MessagingContext';
import { MobileNavBar } from '@/components/MobileNavBar';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { StoryProvider } from '@/context/StoryContext';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { incomingCall, activeCall } = useMessaging();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-pulse-subtle space-y-3 text-center">
          <div className="h-8 w-32 mx-auto bg-muted rounded-md"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
  };

  return (
    <>
      <Router>
        <div className="flex">
          {isAuthenticated && <DesktopSidebar />}
          <div className={`${isAuthenticated ? 'md:ml-64' : ''} flex-1 min-h-screen transition-all duration-300`}>
            <Routes>
              <Route path="/login" element={isAuthenticated ? <Navigate to="/chat" /> : <Login />} />
              <Route path="/register" element={isAuthenticated ? <Navigate to="/chat" /> : <Register />} />
              <Route
                path="/chat"
                element={
                  <PrivateRoute>
                    <StoryProvider>
                      <Chat />
                    </StoryProvider>
                  </PrivateRoute>
                }
              />
              <Route
                path="/status"
                element={
                  <PrivateRoute>
                    <Status />
                  </PrivateRoute>
                }
              />
              <Route
                path="/user/:userId"
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to={isAuthenticated ? "/chat" : "/login"} />} />
            </Routes>
          </div>
        </div>
        
        {isAuthenticated && <MobileNavBar />}
      </Router>

      <CallModal incomingCall={incomingCall} activeCall={activeCall} />
      
      <Toaster />
    </>
  );
}

export default App;

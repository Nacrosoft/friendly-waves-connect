
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Chat from '@/pages/Chat';
import Status from '@/pages/Status';
import UserProfile from '@/pages/UserProfile';
import { Toaster } from '@/components/ui/toaster';
import { CallModal } from '@/components/CallModal';
import { useMessaging } from '@/context/MessagingContext';
import { MobileNavBar } from '@/components/MobileNavBar';
import { StoryProvider } from '@/context/StoryContext';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { incomingCall, activeCall } = useMessaging();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
  };

  return (
    <>
      <Router>
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
          <Route path="/" element={<Navigate to={isAuthenticated ? "/chat" : "/login"} />} />
        </Routes>
        
        {isAuthenticated && <MobileNavBar />}
      </Router>

      <CallModal incomingCall={incomingCall} activeCall={activeCall} />
      
      <Toaster />
    </>
  );
}

export default App;

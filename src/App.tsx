import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { MessagingProvider } from '@/context/MessagingContext';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Chat from '@/pages/Chat';
import { Toaster } from '@/components/ui/toaster';
import { CallModal } from '@/components/CallModal';
import { useMessaging } from '@/context/MessagingContext';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { incomingCall, activeCall } = useMessaging();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
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
                <Chat />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/chat" />} />
        </Routes>
      </Router>
      
      {/* Add CallModal at the root level */}
      <CallModal incomingCall={incomingCall} activeCall={activeCall} />
      
      <Toaster />
    </>
  );
}

export default App;

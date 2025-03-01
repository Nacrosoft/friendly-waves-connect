
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from '@/context/AuthContext';
import { MessagingProvider } from '@/context/MessagingContext';

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <MessagingProvider>
      <App />
    </MessagingProvider>
  </AuthProvider>
);

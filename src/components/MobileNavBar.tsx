
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Phone, Camera, PlusCircle } from 'lucide-react';

export function MobileNavBar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  return (
    <div className="mobile-nav-bar">
      <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}>
        <MessageSquare className="mobile-nav-icon" />
        <span className="mobile-nav-label">Chats</span>
      </Link>
      
      <Link to="/calls" className={`mobile-nav-item ${isActive('/calls') ? 'active' : ''}`}>
        <Phone className="mobile-nav-icon" />
        <span className="mobile-nav-label">Calls</span>
      </Link>
      
      <Link to="/camera" className={`mobile-nav-item ${isActive('/camera') ? 'active' : ''}`}>
        <Camera className="mobile-nav-icon" />
        <span className="mobile-nav-label">Camera</span>
      </Link>
      
      <Link to="/new" className={`mobile-nav-item ${isActive('/new') ? 'active' : ''}`}>
        <PlusCircle className="mobile-nav-icon" />
        <span className="mobile-nav-label">New</span>
      </Link>
    </div>
  );
}

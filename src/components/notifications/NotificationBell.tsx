import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { auth, db } from '../../lib/supabase';
import NotificationCenter from './NotificationCenter';

const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const bellRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    loadUnreadCount();
    
    // Set up polling to check for new notifications
    const interval = setInterval(loadUnreadCount, 60000); // Check every minute
    
    // Add click outside listener
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const loadUnreadCount = async () => {
    try {
      setLoading(true);
      const user = await auth.getCurrentUser();
      if (!user) return;
      
      const { data, error } = await db.getUserNotifications(user.id);
      
      if (error) throw error;
      
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  const handleClose = () => {
    setShowNotifications(false);
  };
  
  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={toggleNotifications}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {showNotifications && (
        <div className="absolute right-0 mt-2 z-50">
          <NotificationCenter onClose={handleClose} />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
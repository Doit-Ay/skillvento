import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, Calendar, Lightbulb, Users, Info, ExternalLink } from 'lucide-react';
import { auth, db } from '../../lib/supabase';
import { Notification } from '../../types';
import { format, formatDistanceToNow } from 'date-fns';
import Button from '../common/Button';

interface NotificationCenterProps {
  onClose?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    loadNotifications();
    
    // Add click outside listener
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node) && onClose) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const user = await auth.getCurrentUser();
      if (!user) return;
      
      const { data, error: fetchError } = await db.getUserNotifications(user.id);
      
      if (fetchError) throw fetchError;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (err: any) {
      console.error('Error loading notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkAsRead = async (id: string) => {
    try {
      await db.markNotificationAsRead(id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      const user = await auth.getCurrentUser();
      if (!user) return;
      
      await db.markAllNotificationsAsRead(user.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const handleDeleteNotification = async (id: string) => {
    try {
      await db.deleteNotification(id);
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (!notifications.find(n => n.id === id)?.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'certificate_expiry':
        return <Calendar className="h-5 w-5 text-orange-500" />;
      case 'learning_recommendation':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'team_update':
        return <Users className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-purple-500" />;
    }
  };
  
  return (
    <div 
      ref={notificationRef}
      className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden"
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          <h2 className="font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="ml-2 bg-white text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-100 hover:text-white transition-colors duration-200"
            >
              Mark all as read
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadNotifications}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map(notification => (
              <li 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${
                  !notification.is_read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex">
                  <div className="flex-shrink-0 mr-3 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <div className="flex items-center ml-2">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            title="Mark as read"
                          >
                            <CheckCheck className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                          title="Delete notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                      {notification.action_url && (
                        <a
                          href={notification.action_url}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          View <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <a 
          href="/settings/notifications" 
          className="text-xs text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          Manage notification settings
        </a>
      </div>
    </div>
  );
};

export default NotificationCenter;
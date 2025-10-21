'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import Loading from '@/app/loading';
import { 
  Bell,
  CheckCircle,
  DollarSign,
  FileText,
  Calendar,
  Info,
  Filter,
  Check
} from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'FEE' | 'TEST' | 'ATTENDANCE' | 'ANNOUNCEMENT' | 'HOMEWORK' | 'EVENT';
  read: boolean;
  createdAt: string;
}

interface NotificationsData {
  notifications: Notification[];
  unreadCount: number;
}

export default function ParentNotificationsPage() {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async (): Promise<NotificationsData> => {
      const response = await apiClient.get<NotificationsData>(`/notifications/user/${user?.id}`);
      return response.data;
    },
    enabled: !!user,
  });

  if (isLoading) return <Loading />;

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const typeConfig = {
    FEE: {
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      label: 'Fee Payment'
    },
    TEST: {
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      label: 'Test Result'
    },
    ATTENDANCE: {
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      label: 'Attendance'
    },
    ANNOUNCEMENT: {
      icon: Info,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      label: 'Announcement'
    },
    HOMEWORK: {
      icon: FileText,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      label: 'Homework'
    },
    EVENT: {
      icon: Calendar,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      label: 'Event'
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !notif.read;
    return notif.type.toLowerCase() === filterType;
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const mins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${mins} min${mins !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const handleMarkAsRead = (id: number) => {
    // TODO: Implement mark as read API call
    console.log('Mark as read:', id);
  };

  const handleMarkAllAsRead = () => {
    // TODO: Implement mark all as read API call
    console.log('Mark all as read');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Notifications
          </h1>
          <p className="text-gray-600">
            Stay updated with latest announcements and alerts
            {unreadCount > 0 && (
              <span className="ml-2 px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
          >
            <Check className="w-5 h-5" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Filter:</span>
          </div>
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterType === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterType === 'unread'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilterType('fee')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterType === 'fee'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Fees
          </button>
          <button
            onClick={() => setFilterType('test')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterType === 'test'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tests
          </button>
          <button
            onClick={() => setFilterType('attendance')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterType === 'attendance'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => setFilterType('announcement')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterType === 'announcement'
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Announcements
          </button>
        </div>
      </div>

      {/* Notifications Timeline */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {filterType === 'unread' ? "You're All Caught Up!" : 'No Notifications'}
          </h3>
          <p className="text-gray-600">
            {filterType === 'unread'
              ? 'All notifications have been read.'
              : filterType === 'all'
              ? 'No notifications at the moment.'
              : `No ${filterType} notifications.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const config = typeConfig[notification.type];
            const NotifIcon = config.icon;

            return (
              <div
                key={notification.id}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all ${
                  !notification.read ? 'border-l-4 border-purple-600' : 'border-l-4 border-transparent'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <NotifIcon className={`w-6 h-6 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                            )}
                          </div>
                          <span className={`text-xs font-medium ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{notification.message}</p>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-medium"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

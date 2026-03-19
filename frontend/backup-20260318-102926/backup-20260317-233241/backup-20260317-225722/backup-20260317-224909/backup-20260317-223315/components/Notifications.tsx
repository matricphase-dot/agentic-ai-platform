"use client";

import { Fragment, useState, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/lib/websocket';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export default function NotificationsDropdown() {
  const { user } = useAuth();
  const { socket } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  // Fetch notifications on mount
  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;
    const handleNotification = (data: any) => {
      const newNotif: Notification = {
        id: Date.now().toString(), // temporary; real one comes from DB
        type: data.type,
        title: data.title || 'New Event',
        message: data.message || 'Something happened.',
        read: false,
        createdAt: new Date().toISOString(),
        data,
      };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('agent-staked', (data) => {
      handleNotification({ ...data, type: 'STAKE', title: 'Agent Staked', message: `Someone staked $${data.stakeAmount} on your agent.` });
      toast.success(`💰 $${data.stakeAmount} stake received on your agent!`);
    });
    socket.on('agent-hired', (data) => {
      handleNotification({ ...data, type: 'HIRE', title: 'Agent Hired', message: `Your agent was hired by ${data.businessName}.` });
      toast.success(`🤝 Your agent was hired by ${data.businessName}!`);
    });
    socket.on('agent-earned', (data) => {
      handleNotification({ ...data, type: 'EARN', title: 'Agent Earned', message: `Your agent earned $${data.amount} from ${data.businessName}.` });
      toast.success(`💵 Your agent earned $${data.amount}!`);
    });
    socket.on('revenue-recorded', (data) => {
      handleNotification({ ...data, type: 'REVENUE', title: 'Revenue Recorded', message: `Business earned $${data.amount}.` });
      toast.success(`📈 Recorded $${data.amount} revenue!`);
    });

    return () => {
      socket.off('agent-staked');
      socket.off('agent-hired');
      socket.off('agent-earned');
      socket.off('revenue-recorded');
    };
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter((n: any) => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  if (!user) return null;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="relative p-2 text-gray-400 hover:text-gray-600">
          <BellIcon className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No notifications yet.
              </div>
            ) : (
              notifications.slice(0, 10).map((notif) => (
                <Menu.Item key={notif.id}>
                  {({ active }) => (
                    <div
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                        !notif.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => !notif.read && markAsRead(notif.id)}
                    >
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                        {!notif.read && (
                          <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </Menu.Item>
              ))
            )}
          </div>
          <div className="px-4 py-2 text-center">
            <Link href="/notifications" className="text-xs text-blue-600 hover:text-blue-800">
              View all notifications
            </Link>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

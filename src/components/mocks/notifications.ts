// src/mocks/notifications.ts

import { useQuery, useQueryClient } from 'react-query';

export interface Notification {
  id: string;
  type: 'newContent' | 'recommendation' | 'update' | 'account';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

let mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'newContent',
    title: 'New Episode Available',
    message: 'The latest episode of "Stranger Things" is now streaming!',
    timestamp: new Date('2024-03-15T10:00:00Z'),
    read: false,
  },
  {
    id: '2',
    type: 'recommendation',
    title: 'Recommended for You',
    message: 'Based on your watching history, you might enjoy "The Witcher".',
    timestamp: new Date('2024-03-14T15:30:00Z'),
    read: true,
  },
  {
    id: '3',
    type: 'update',
    title: 'Profile Update',
    message: 'Your profile settings have been successfully updated.',
    timestamp: new Date('2024-03-13T09:45:00Z'),
    read: false,
  },
  {
    id: '4',
    type: 'account',
    title: 'Subscription Renewal',
    message: 'Your subscription will renew in 7 days. Please check your payment method.',
    timestamp: new Date('2024-03-12T14:20:00Z'),
    read: false,
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch all notifications
export const fetchNotifications = async (): Promise<Notification[]> => {
  await delay(800); // Simulate network delay
  
  // Simulate occasional network errors
  if (Math.random() < 0.1) {
    throw new Error('Failed to fetch notifications');
  }

  return mockNotifications;
};

// Mark a notification as read
export const markNotificationAsRead = async (id: string): Promise<void> => {
  await delay(500); // Simulate network delay

  mockNotifications = mockNotifications.map(notification =>
    notification.id === id ? { ...notification, read: true } : notification
  );
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await delay(800); // Simulate network delay

  mockNotifications = mockNotifications.map(notification => ({ ...notification, read: true }));
};

// Delete a notification
export const deleteNotification = async (id: string): Promise<void> => {
  await delay(500); // Simulate network delay

  mockNotifications = mockNotifications.filter(notification => notification.id !== id);
};

// Add a new notification (for testing purposes)
export const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp'>): Promise<Notification> => {
  await delay(500); // Simulate network delay

  const newNotification: Notification = {
    ...notification,
    id: String(mockNotifications.length + 1),
    timestamp: new Date(),
  };

  mockNotifications = [newNotification, ...mockNotifications];

  return newNotification;
};

// Custom hook for using notifications with React Query
export const useNotifications = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery('notifications', fetchNotifications, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const markAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    queryClient.setQueryData('notifications', (oldData: Notification[] | undefined) =>
      oldData ? oldData.map(n => n.id === id ? { ...n, read: true } : n) : []
    );
  };

  const markAllAsRead = async () => {
    await markAllNotificationsAsRead();
    queryClient.setQueryData('notifications', (oldData: Notification[] | undefined) =>
      oldData ? oldData.map(n => ({ ...n, read: true })) : []
    );
  };

  const deleteNotif = async (id: string) => {
    await deleteNotification(id);
    queryClient.setQueryData('notifications', (oldData: Notification[] | undefined) =>
      oldData ? oldData.filter(n => n.id !== id) : []
    );
  };

  const addNewNotification = async (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification = await addNotification(notification);
    queryClient.setQueryData('notifications', (oldData: Notification[] | undefined) =>
      oldData ? [newNotification, ...oldData] : [newNotification]
    );
  };

  return {
    notifications: data,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotif,
    addNewNotification,
  };
};
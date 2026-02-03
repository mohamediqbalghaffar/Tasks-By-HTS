/**
 * Notification Service
 * Handles browser push notifications for task and letter reminders
 */

export type NotificationData = {
  id: string;
  type: 'task' | 'letter';
  title: string;
  body: string;
};

/**
 * Request notification permission from the browser
 * @returns Promise<NotificationPermission> - 'granted', 'denied', or 'default'
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Check if notifications are supported and permitted
 */
export function areNotificationsEnabled(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Send a browser notification
 * @param title - Notification title
 * @param body - Notification body text
 * @param data - Additional data to attach to the notification
 * @param icon - Optional icon URL
 */
export function sendNotification(
  title: string,
  body: string,
  data?: NotificationData,
  icon?: string
): Notification | null {
  if (!areNotificationsEnabled()) {
    console.warn('Notifications are not enabled');
    return null;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: data?.id || `notification-${Date.now()}`,
      requireInteraction: true, // Keep notification visible until user interacts
      data: data,
      vibrate: [200, 100, 200], // Vibration pattern for mobile
    });

    // Handle notification click
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      
      // If we have item data, navigate to it
      if (data?.id) {
        window.location.href = `/item/${data.id}`;
      }
      
      notification.close();
    };

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
}

/**
 * Send a reminder notification for a task or letter
 * @param item - Task or letter item
 * @param type - 'task' or 'letter'
 * @param language - Current language for translations
 */
export function sendReminderNotification(
  item: { id: string; name: string; detail?: string },
  type: 'task' | 'letter',
  language: string = 'ckb'
): Notification | null {
  const isKurdish = language === 'ckb';
  
  const title = isKurdish 
    ? `⏰ یادخستنەوە: ${type === 'task' ? 'ئەرک' : 'نامە'}`
    : `⏰ Reminder: ${type === 'task' ? 'Task' : 'Letter'}`;
  
  const body = item.name || (isKurdish ? 'بێ ناونیشان' : 'Untitled');
  
  return sendNotification(title, body, {
    id: item.id,
    type,
    title: item.name,
    body: item.detail || '',
  });
}

/**
 * Request permission and show a test notification
 */
export async function testNotification(language: string = 'ckb'): Promise<boolean> {
  const permission = await requestNotificationPermission();
  
  if (permission === 'granted') {
    const isKurdish = language === 'ckb';
    sendNotification(
      isKurdish ? '✅ یادخستنەوەکان چالاککراون' : '✅ Notifications Enabled',
      isKurdish ? 'ئێستا یادخستنەوە وەردەگریت بۆ ئەرک و نامەکانت' : 'You will now receive notifications for your tasks and letters'
    );
    return true;
  }
  
  return false;
}

/**
 * Store notified reminder IDs to prevent duplicate notifications
 */
const notifiedReminders = new Set<string>();

/**
 * Check if a reminder has already been notified
 */
export function hasBeenNotified(id: string): boolean {
  return notifiedReminders.has(id);
}

/**
 * Mark a reminder as notified
 */
export function markAsNotified(id: string): void {
  notifiedReminders.add(id);
}

/**
 * Clear notified status (useful when reminder is updated)
 */
export function clearNotified(id: string): void {
  notifiedReminders.delete(id);
}

/**
 * Clear all notified reminders (useful on app restart)
 */
export function clearAllNotified(): void {
  notifiedReminders.clear();
}

/**
 * Notification sound utilities for the Civic Portal
 * Provides optional audio feedback for new notifications
 */

// Simple notification sound using Web Audio API
export const playNotificationSound = (enabled: boolean = false) => {
  if (!enabled || typeof window === 'undefined') return;

  try {
    // Create a simple notification beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for the beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure the sound
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz frequency
    oscillator.type = 'sine';
    
    // Configure volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
    
    // Play the sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

// Alternative using HTML5 Audio (requires audio file)
export const playNotificationSoundFromFile = (soundUrl: string, enabled: boolean = false) => {
  if (!enabled || typeof window === 'undefined') return;

  try {
    const audio = new Audio(soundUrl);
    audio.volume = 0.3; // Set volume to 30%
    audio.play().catch(error => {
      console.warn('Could not play notification sound from file:', error);
    });
  } catch (error) {
    console.warn('Could not create audio element:', error);
  }
};

// Check if user has granted permission for notifications
export const checkNotificationPermission = (): boolean => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  
  return Notification.permission === 'granted';
};

// Request notification permission from user
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.warn('Could not request notification permission:', error);
    return false;
  }
};

// Show browser notification (requires permission)
export const showBrowserNotification = (
  title: string,
  options: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
  } = {}
) => {
  if (!checkNotificationPermission()) {
    return null;
  }

  try {
    const notification = new Notification(title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      badge: options.badge || '/favicon.ico',
      tag: options.tag || 'civic-portal-notification',
      requireInteraction: options.requireInteraction || false,
    });

    // Auto-close after 5 seconds unless requireInteraction is true
    if (!options.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    return notification;
  } catch (error) {
    console.warn('Could not show browser notification:', error);
    return null;
  }
};

// Notification preferences (can be stored in localStorage)
export interface NotificationPreferences {
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  soundVolume: number;
}

export const getNotificationPreferences = (): NotificationPreferences => {
  if (typeof window === 'undefined') {
    return {
      soundEnabled: false,
      browserNotificationsEnabled: false,
      soundVolume: 0.3,
    };
  }

  try {
    const stored = localStorage.getItem('notification-preferences');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Could not load notification preferences:', error);
  }

  return {
    soundEnabled: false,
    browserNotificationsEnabled: false,
    soundVolume: 0.3,
  };
};

export const saveNotificationPreferences = (preferences: NotificationPreferences) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('notification-preferences', JSON.stringify(preferences));
  } catch (error) {
    console.warn('Could not save notification preferences:', error);
  }
};

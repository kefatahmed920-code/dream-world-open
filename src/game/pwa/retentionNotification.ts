/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GameNotification {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

const PREF_KEY = 'dream_notifications_enabled';

class RetentionNotificationManager {
  public isSupported = false;
  public permission: NotificationPermission = 'default';

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'Notification' in window;
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  public isEnabled(): boolean {
    if (!this.isSupported) return false;
    return Notification.permission === 'granted';
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      this.permission = result;
      const granted = result === 'granted';
      localStorage.setItem(PREF_KEY, granted ? 'true' : 'false');

      if (granted) {
        this.sendImmediateNotification({
          title: 'DREAM WORLD: Daily Alerts Active',
          body: 'You will receive reminders for Dhaka events, co-op invites, and daily Taka rewards!',
        });
      }
      return granted;
    } catch {
      return false;
    }
  }

  public sendImmediateNotification(note: GameNotification) {
    if (!this.isEnabled()) return;

    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(note.title, {
            body: note.body,
            icon: note.icon || '/icon.svg',
            badge: '/icon.svg',
            tag: note.tag || `dream-world-alert-${Date.now()}`,
          });
        }).catch(() => {
          new Notification(note.title, {
            body: note.body,
            icon: note.icon || '/icon.svg',
          });
        });
      } else {
        new Notification(note.title, {
          body: note.body,
          icon: note.icon || '/icon.svg',
        });
      }
    } catch {
      // Notification failed
    }
  }

  public scheduleExplorationReminders() {
    if (!this.isEnabled()) return;

    // Simulate scheduling random interesting Dhaka world tips when inactive
    const alerts: GameNotification[] = [
      {
        title: 'Rahim Bhai needs assistance!',
        body: 'A special shipment arrived at the tea stall in Dhanmondi. Earn 500 Taka!',
      },
      {
        title: 'Online Co-op Explorers Nearby',
        body: 'New players joined the Dhaka-Hub-1 server. Jump in for joint driving!',
      },
      {
        title: 'Daily Explorer Taka Bonus',
        body: 'Claim your 350 Taka daily exploration stipend in Dream World.',
      },
    ];

    const pick = alerts[Math.floor(Math.random() * alerts.length)];
    // Set a lightweight reminder after 4 hours of inactivity if app is open/installed
    setTimeout(() => {
      this.sendImmediateNotification(pick);
    }, 4 * 60 * 60 * 1000);
  }
}

export const retentionManager = new RetentionNotificationManager();

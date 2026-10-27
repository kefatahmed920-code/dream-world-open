/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NetworkConfig } from '../config/networkConfig';

export interface PlayerAccount {
  uid: string;
  email: string;
  displayName: string;
  isGuest: boolean;
  avatarSeed?: string;
  createdAt: number;
  lastLoginAt: number;
  stats: {
    level: number;
    taka: number;
    questsCompleted: number;
    distanceExploredKm: number;
  };
}

const STORAGE_KEY_CURRENT_USER = 'dream_world_current_user';
const STORAGE_KEY_REGISTERED_USERS = 'dream_world_registered_users';

type AuthListener = (user: PlayerAccount | null) => void;

class AuthManager {
  private currentUser: PlayerAccount | null = null;
  private listeners: Set<AuthListener> = new Set();

  constructor() {
    this.loadSession();
    // Background sync on startup if online
    if (this.currentUser && !this.currentUser.isGuest) {
      this.syncWithServer(this.currentUser.uid).catch(() => {});
    }
  }

  private loadSession() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    } catch {
      this.currentUser = null;
    }
  }

  public getCurrentUser(): PlayerAccount | null {
    return this.currentUser;
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    listener(this.currentUser);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    if (this.currentUser) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
    for (const listener of this.listeners) {
      listener(this.currentUser);
    }
  }

  private generateUid(prefix = 'DW'): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${code}`;
  }

  private getStoredUsers(): Record<string, { passwordHash: string; account: PlayerAccount }> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveStoredUsers(users: Record<string, { passwordHash: string; account: PlayerAccount }>) {
    localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(users));
  }

  public async register(email: string, password: string, displayName: string): Promise<PlayerAccount> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim() || 'Explorer';

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // Try cloud registration first
    try {
      const resp = await fetch(NetworkConfig.getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password, displayName: cleanName }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.account) {
          const acc: PlayerAccount = data.account;
          // Also save in local offline store
          const users = this.getStoredUsers();
          users[cleanEmail] = { passwordHash: btoa(password), account: acc };
          this.saveStoredUsers(users);

          this.currentUser = acc;
          localStorage.setItem('dream_player_name', acc.displayName);
          this.notify();
          return acc;
        }
      } else if (resp.status === 409) {
        throw new Error('An account with this email already exists on the server.');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('already exists')) {
        throw err;
      }
      // If network unreachable, continue with offline registration
    }

    const users = this.getStoredUsers();
    if (users[cleanEmail]) {
      throw new Error('An account with this email already exists locally.');
    }

    const newAccount: PlayerAccount = {
      uid: this.generateUid('DW'),
      email: cleanEmail,
      displayName: cleanName,
      isGuest: false,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      stats: {
        level: 1,
        taka: 500,
        questsCompleted: 0,
        distanceExploredKm: 0,
      },
    };

    // Store user credentials locally
    users[cleanEmail] = {
      passwordHash: btoa(password),
      account: newAccount,
    };
    this.saveStoredUsers(users);

    this.currentUser = newAccount;
    localStorage.setItem('dream_player_name', newAccount.displayName);
    this.notify();
    return newAccount;
  }

  public async login(email: string, password: string): Promise<PlayerAccount> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      throw new Error('Please enter both email and password.');
    }

    // Try cloud login first
    try {
      const resp = await fetch(NetworkConfig.getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.account) {
          const acc: PlayerAccount = data.account;
          const users = this.getStoredUsers();
          users[cleanEmail] = { passwordHash: btoa(password), account: acc };
          this.saveStoredUsers(users);

          this.currentUser = acc;
          localStorage.setItem('dream_player_name', acc.displayName);
          this.notify();
          return acc;
        }
      } else if (resp.status === 401) {
        throw new Error('Invalid email or password. Please try again.');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Invalid email')) {
        throw err;
      }
      // Fallback to local offline check
    }

    const users = this.getStoredUsers();
    const record = users[cleanEmail];

    if (!record || record.passwordHash !== btoa(password)) {
      throw new Error('Invalid email or password. Please try again.');
    }

    record.account.lastLoginAt = Date.now();
    this.saveStoredUsers(users);

    this.currentUser = record.account;
    localStorage.setItem('dream_player_name', record.account.displayName);
    this.notify();
    return record.account;
  }

  public async guestLogin(customName?: string): Promise<PlayerAccount> {
    const defaultNames = ['Tanvir', 'Afnan', 'Sami', 'Nafis', 'Sadia', 'Farhan', 'Rifat', 'Ananya'];
    const selectedName = customName?.trim() || defaultNames[Math.floor(Math.random() * defaultNames.length)];

    const guestAccount: PlayerAccount = {
      uid: this.generateUid('GUEST'),
      email: `guest_${Math.random().toString(36).substring(2, 7)}@dreamworld.local`,
      displayName: selectedName,
      isGuest: true,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      stats: {
        level: 1,
        taka: 350,
        questsCompleted: 0,
        distanceExploredKm: 0,
      },
    };

    this.currentUser = guestAccount;
    localStorage.setItem('dream_player_name', guestAccount.displayName);
    this.notify();
    return guestAccount;
  }

  public async resetPassword(email: string): Promise<string> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please provide a valid email address.');
    }
    const users = this.getStoredUsers();
    if (!users[cleanEmail]) {
      throw new Error('No account found with this email address.');
    }
    // Simulate recovery link
    return `Password reset verification link sent to ${cleanEmail}. Check your inbox.`;
  }

  public async updateProfile(updates: { displayName?: string }): Promise<PlayerAccount> {
    if (!this.currentUser) throw new Error('Not logged in');

    if (updates.displayName) {
      this.currentUser.displayName = updates.displayName.trim();
      localStorage.setItem('dream_player_name', this.currentUser.displayName);
    }

    if (!this.currentUser.isGuest) {
      const users = this.getStoredUsers();
      if (users[this.currentUser.email]) {
        users[this.currentUser.email].account = this.currentUser;
        this.saveStoredUsers(users);
      }

      // Sync with cloud server
      try {
        fetch(NetworkConfig.getApiUrl('/api/auth/profile'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: this.currentUser.uid, updates }),
        }).catch(() => {});
      } catch {}
    }

    this.notify();
    return this.currentUser;
  }

  public updateStats(statsUpdate: Partial<PlayerAccount['stats']>) {
    if (!this.currentUser) return;
    this.currentUser.stats = {
      ...this.currentUser.stats,
      ...statsUpdate,
    };
    this.notify();

    if (!this.currentUser.isGuest) {
      try {
        fetch(NetworkConfig.getApiUrl('/api/auth/profile'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: this.currentUser.uid, updates: { stats: this.currentUser.stats } }),
        }).catch(() => {});
      } catch {}
    }
  }

  public async syncWithServer(uid: string): Promise<void> {
    try {
      const resp = await fetch(NetworkConfig.getApiUrl(`/api/auth/profile/${uid}`));
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.account && this.currentUser && this.currentUser.uid === uid) {
          this.currentUser = {
            ...this.currentUser,
            ...data.account,
            stats: {
              ...this.currentUser.stats,
              ...data.account.stats,
            },
          };
          this.notify();
        }
      }
    } catch {}
  }

  public logout() {
    this.currentUser = null;
    this.notify();
  }
}

export const authManager = new AuthManager();

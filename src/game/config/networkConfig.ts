/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const STORAGE_KEY_BACKEND_URL = 'dream_backend_url';
export const DEFAULT_PRODUCTION_BACKEND = 'https://dream-world-open.onrender.com';

export class NetworkConfig {
  /**
   * Returns the permanent default production backend URL
   */
  public static getDefaultBackendUrl(): string {
    return DEFAULT_PRODUCTION_BACKEND;
  }

  /**
   * Returns the configured backend HTTP base URL.
   * Defaults permanently to https://dream-world-open.onrender.com for production / GitHub Pages.
   */
  public static getBackendBaseUrl(): string {
    // 1. User manual override from Advanced Settings modal (if saved)
    const saved = localStorage.getItem(STORAGE_KEY_BACKEND_URL)?.trim();
    if (saved) {
      return saved.replace(/\/+$/, '');
    }

    // 2. Vite environment variable if configured
    const envUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim();
    if (envUrl) {
      return envUrl.replace(/\/+$/, '');
    }

    // 3. If running locally on localhost, use local server origin
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
        return window.location.origin;
      }
    }

    // 4. Default for production, GitHub Pages, Android PWA, and all external players
    return DEFAULT_PRODUCTION_BACKEND;
  }

  /**
   * Sets or clears a custom backend URL in localStorage
   */
  public static setCustomBackendUrl(url: string | null) {
    if (!url || !url.trim() || url.trim() === DEFAULT_PRODUCTION_BACKEND) {
      localStorage.removeItem(STORAGE_KEY_BACKEND_URL);
    } else {
      let clean = url.trim().replace(/\/+$/, '');
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = `https://${clean}`;
      }
      localStorage.setItem(STORAGE_KEY_BACKEND_URL, clean);
    }
  }

  /**
   * Gets the stored custom backend URL, if any
   */
  public static getCustomBackendUrl(): string {
    return localStorage.getItem(STORAGE_KEY_BACKEND_URL) || '';
  }

  /**
   * Resets backend URL to the production default
   */
  public static resetToDefaultBackend(): void {
    localStorage.removeItem(STORAGE_KEY_BACKEND_URL);
  }

  /**
   * Checks if current page is running on GitHub Pages
   */
  public static isGitHubPages(): boolean {
    if (typeof window === 'undefined') return false;
    return window.location.hostname.endsWith('github.io');
  }

  /**
   * Checks if using the official production backend
   */
  public static isUsingProductionBackend(): boolean {
    return this.getBackendBaseUrl() === DEFAULT_PRODUCTION_BACKEND;
  }

  /**
   * Generates a fully qualified WebSocket URL for the /ws/game endpoint.
   * Always uses secure WebSocket (wss://) in production.
   */
  public static getGameWebSocketUrl(params: { room: string; id: string; name: string }): string {
    const baseUrl = this.getBackendBaseUrl();
    let host = 'dream-world-open.onrender.com';
    let protocol = 'wss:';

    if (baseUrl) {
      try {
        const parsed = new URL(baseUrl);
        host = parsed.host;
        protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
      } catch {
        host = baseUrl.replace(/^https?:\/\//, '').replace(/\/+.*$/, '');
        protocol = 'wss:';
      }
    } else if (typeof window !== 'undefined') {
      host = window.location.host;
      protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    }

    const query = new URLSearchParams({
      room: params.room,
      id: params.id,
      name: params.name,
    }).toString();

    return `${protocol}//${host}/ws/game?${query}`;
  }

  /**
   * Generates a fully qualified API URL path (e.g. /api/stats -> https://dream-world-open.onrender.com/api/stats)
   */
  public static getApiUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const base = this.getBackendBaseUrl();
    if (base) {
      return `${base}${cleanEndpoint}`;
    }
    return cleanEndpoint;
  }
}

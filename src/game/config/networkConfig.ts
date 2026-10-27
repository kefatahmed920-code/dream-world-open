/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const STORAGE_KEY_BACKEND_URL = 'dream_backend_url';

export class NetworkConfig {
  /**
   * Returns the configured backend HTTP base URL (e.g. "https://my-backend.onrender.com" or "").
   * If empty, defaults to current origin window.location.origin unless running on github.io.
   */
  public static getBackendBaseUrl(): string {
    const saved = localStorage.getItem(STORAGE_KEY_BACKEND_URL)?.trim();
    if (saved) {
      return saved.replace(/\/+$/, '');
    }

    const envUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim();
    if (envUrl) {
      return envUrl.replace(/\/+$/, '');
    }

    // If running in browser and not on GitHub Pages, use same origin
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }

    return '';
  }

  /**
   * Sets or clears a custom backend URL in localStorage
   */
  public static setCustomBackendUrl(url: string | null) {
    if (!url || !url.trim()) {
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
   * Checks if current page is running on GitHub Pages (static hosting without built-in backend)
   */
  public static isGitHubPages(): boolean {
    if (typeof window === 'undefined') return false;
    return window.location.hostname.endsWith('github.io');
  }

  /**
   * Generates a fully qualified WebSocket URL for the /ws/game endpoint
   */
  public static getGameWebSocketUrl(params: { room: string; id: string; name: string }): string {
    const custom = this.getCustomBackendUrl();
    let host = '';
    let protocol = 'ws:';

    if (custom) {
      try {
        const parsed = new URL(custom);
        host = parsed.host;
        protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
      } catch {
        host = custom.replace(/^https?:\/\//, '');
        protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
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
   * Generates an API URL path (e.g. /api/stats -> https://mybackend.com/api/stats or /api/stats)
   */
  public static getApiUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const custom = this.getCustomBackendUrl();
    if (custom) {
      return `${custom}${cleanEndpoint}`;
    }
    return cleanEndpoint;
  }
}

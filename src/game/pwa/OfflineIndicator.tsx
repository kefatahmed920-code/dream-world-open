/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="flex items-center gap-2 rounded-2xl bg-amber-600/95 border border-amber-400 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xl backdrop-blur-xs animate-fade-in">
        <WifiOff className="w-3.5 h-3.5 text-white" />
        <span>অফলাইন মোড (Offline Mode) — ক্যাশ করা গেম ডেটা ব্যবহৃত হচ্ছে</span>
      </div>
    </div>
  );
};

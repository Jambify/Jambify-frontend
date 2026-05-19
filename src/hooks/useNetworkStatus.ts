// src/hooks/useNetworkStatus.ts
import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean; // true when connection was just restored
  quality: 'good' | 'slow' | 'offline';
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [quality, setQuality] = useState<'good' | 'slow' | 'offline'>(
    navigator.onLine ? 'good' : 'offline'
  );

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setWasOffline(true);
    setQuality('good');
    // Reset the wasOffline flag after 4 seconds
    setTimeout(() => setWasOffline(false), 4000);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setWasOffline(false);
    setQuality('offline');
  }, []);

  // Detect slow connections via Network Information API (Chrome/Android)
  useEffect(() => {
    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

    const updateQuality = () => {
      if (!navigator.onLine) {
        setQuality('offline');
        return;
      }
      if (conn) {
        const { effectiveType, downlink } = conn;
        if (effectiveType === '2g' || effectiveType === 'slow-2g' || downlink < 0.5) {
          setQuality('slow');
        } else {
          setQuality('good');
        }
      } else {
        setQuality('good');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    conn?.addEventListener('change', updateQuality);

    updateQuality();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      conn?.removeEventListener('change', updateQuality);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, wasOffline, quality };
}
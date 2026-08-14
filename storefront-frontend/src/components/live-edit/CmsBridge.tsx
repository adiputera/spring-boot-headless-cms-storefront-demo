'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CmsBridge() {
  const router = useRouter();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.action === 'UPDATE') {
        if (event.data.slots) {
          sessionStorage.setItem('cms_slots_sync_status', JSON.stringify(event.data.slots));
        }
        router.refresh();
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Request initial data from CMS parent
    window.parent.postMessage({ action: 'REQUEST_UPDATE' }, '*');
    
    return () => window.removeEventListener('message', handleMessage);
  }, [router]);

  return null;
}

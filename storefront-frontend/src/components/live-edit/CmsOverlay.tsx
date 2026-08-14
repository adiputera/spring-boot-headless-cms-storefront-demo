'use client';

import { useEffect, useState, useCallback } from 'react';

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
  slotId?: string;
  slotName?: string;
  componentId?: string;
  syncStatus?: string;
  type: 'slot' | 'component';
};

export default function CmsOverlay() {
  const [targetElements, setTargetElements] = useState<{slot: HTMLElement | null, component: HTMLElement | null}>({slot: null, component: null});
  const [rects, setRects] = useState<Rect[]>([]);

  const updateRect = useCallback(() => {
    const newRects: Rect[] = [];
    
    let slotsData: any[] = [];
    try {
      const stored = sessionStorage.getItem('cms_slots_sync_status');
      if (stored) {
        slotsData = JSON.parse(stored);
      }
    } catch (e) {
      // ignore
    }

    // Always show all slots
    const allSlots = document.querySelectorAll('[data-cms-slot]');
    allSlots.forEach(slotEl => {
      const rect = slotEl.getBoundingClientRect();
      const slotId = slotEl.getAttribute('data-cms-slot');
      
      let syncStatus = slotEl.getAttribute('data-cms-sync-status') || undefined;
      if (slotId && slotsData.length > 0) {
        const slotData = slotsData.find(s => s.id.toString() === slotId);
        if (slotData) {
          syncStatus = slotData.syncStatus;
        }
      }
      
      newRects.push({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        slotId: slotId || undefined,
        slotName: slotEl.getAttribute('data-cms-slot-name') || undefined,
        syncStatus,
        type: 'slot'
      });
    });

    if (targetElements.component) {
      const rect = targetElements.component.getBoundingClientRect();
      const slotEl = targetElements.component.closest('[data-cms-slot]');
      const componentId = targetElements.component.getAttribute('data-cms-component');
      const slotId = slotEl?.getAttribute('data-cms-slot');
      
      let syncStatus = targetElements.component.getAttribute('data-cms-sync-status') || undefined;
      if (componentId && slotId && slotsData.length > 0) {
        const slotData = slotsData.find(s => s.id.toString() === slotId);
        if (slotData && slotData.components) {
          const compData = slotData.components.find((c: any) => c.id.toString() === componentId);
          if (compData) {
            syncStatus = compData.syncStatus;
          }
        }
      }

      newRects.push({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        componentId: componentId || undefined,
        slotId: slotId || undefined,
        syncStatus,
        type: 'component'
      });
    }
    setRects(newRects);
  }, [targetElements]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    let target = e.target as HTMLElement | null;

    // Ignore if we are hovering over the overlay itself (like the buttons)
    if (target?.closest('#cms-overlay-container')) {
      return;
    }

    let slotEl: HTMLElement | null = null;
    let compEl: HTMLElement | null = null;

    while (target && target !== document.body) {
      if (!compEl && target.hasAttribute('data-cms-component')) {
        compEl = target;
      }
      if (!slotEl && target.hasAttribute('data-cms-slot')) {
        slotEl = target;
      }
      if (slotEl && compEl) break;
      target = target.parentElement as HTMLElement | null;
    }

    setTargetElements(prev => {
      if (prev.slot !== slotEl || prev.component !== compEl) {
        return { slot: slotEl, component: compEl };
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    updateRect();
  }, [targetElements, updateRect]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.action === 'UPDATE') {
        // Wait a tiny bit for CmsBridge to update sessionStorage
        setTimeout(updateRect, 50);
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', updateRect);
    window.addEventListener('resize', updateRect);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', updateRect);
      window.removeEventListener('resize', updateRect);
    };
  }, [handleMouseMove, updateRect]);

  const handleEdit = (e: React.MouseEvent, rect: Rect) => {
    e.preventDefault();
    e.stopPropagation();
    if (rect.componentId) {
      window.parent.postMessage({ action: 'EDIT_COMPONENT', id: rect.componentId }, '*');
    } else if (rect.slotId) {
      window.parent.postMessage({ action: 'ADD_COMPONENT', slotId: rect.slotId }, '*');
    }
  };

  if (rects.length === 0) return null;

  return (
    <div id="cms-overlay-container">
      {rects.map((rect, index) => {
        const color = rect.type === 'slot' ? '#3b82f6' : '#10b981';
        const bgColor = rect.type === 'slot' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)';
        
        return (
          <div
            key={`${rect.type}-${index}`}
            style={{
              position: 'absolute',
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              border: `2px solid ${color}`,
              backgroundColor: bgColor,
              pointerEvents: 'none',
              zIndex: rect.type === 'slot' ? 9998 : 9999, // Component on top of slot
              transition: 'all 0.1s ease-out'
            }}
          >
            <div 
              style={{
                position: 'absolute',
                top: 0,
                // slot button on left, component button on right to prevent overlap
                left: rect.type === 'slot' ? 0 : undefined,
                right: rect.type === 'component' ? 0 : undefined,
                pointerEvents: 'auto',
                display: 'flex',
                gap: '4px'
              }}
            >
              <button
                onClick={(e) => handleEdit(e, rect)}
                style={{
                  backgroundColor: color,
                  color: 'white',
                  border: 'none',
                  padding: '4px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  borderRadius: rect.type === 'slot' ? '0 0 4px 0' : '0 0 0 4px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {rect.type === 'slot' ? `+ Add to ${rect.slotName || rect.slotId}` : '✎ Edit Component'}
              </button>
              
              {/* Sync Button */}
              {(rect.syncStatus === 'OUT_OF_SYNC' || rect.syncStatus === 'NOT_SYNCED') ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.parent.postMessage({ 
                      action: 'SYNC_ITEM', 
                      id: rect.type === 'slot' ? rect.slotId : rect.componentId, 
                      itemType: rect.type === 'slot' ? 'Slot' : 'Component' 
                    }, '*');
                  }}
                  style={{
                    backgroundColor: '#eab308', // Yellow-500
                    color: 'white',
                    border: 'none',
                    padding: '4px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  Sync
                </button>
              ) : (
                <button
                  disabled
                  style={{
                    backgroundColor: '#10b981', // Emerald-500
                    color: 'white',
                    border: 'none',
                    padding: '4px 12px',
                    fontSize: '12px',
                    cursor: 'not-allowed',
                    fontWeight: 'bold',
                    opacity: 0.8,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  Synced
                </button>
              )}

              {rect.type === 'component' && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.parent.postMessage({ action: 'REORDER_COMPONENT', id: rect.componentId, slotId: rect.slotId, direction: 'up' }, '*');
                    }}
                    style={{
                      backgroundColor: '#374151',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    ↑
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.parent.postMessage({ action: 'REORDER_COMPONENT', id: rect.componentId, slotId: rect.slotId, direction: 'down' }, '*');
                    }}
                    style={{
                      backgroundColor: '#374151',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      borderRadius: '0 0 4px 0',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    ↓
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

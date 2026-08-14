import type { Slot as SlotType, Product } from '@/types';
import ComponentRenderer from '@/components/ComponentRenderer';

interface SlotRendererProps {
  slot: SlotType;
  className?: string;
  product?: Product;
}

export default function SlotRenderer({ slot, className = '', product }: SlotRendererProps) {
  if (!slot.components || slot.components.length === 0) {
    return null;
  }

  return (
    <div 
      className={`slot slot-${slot.code} ${className}`} 
      data-cms-slot={slot.id}
      data-cms-slot-name={slot.name}
      data-cms-sync-status={slot.syncStatus}
    >
      {slot.components
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((component) => (
          <ComponentRenderer key={component.id} component={component} product={product} />
        ))}
    </div>
  );
}

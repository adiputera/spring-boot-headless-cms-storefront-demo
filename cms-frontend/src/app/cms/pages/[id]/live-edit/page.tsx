'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cmsApiClient } from '@/lib/cms-api-client';
import SyncSingleItemButton from '../../../components/SyncSingleItemButton';
import ImageUploader from '@/components/ImageUploader';

interface Slot {
  id: number;
  code: string;
  name: string;
  syncStatus?: string;
  components: Component[];
}


interface Component {
  id: number;
  uid: string;
  name: string;
  type: string;
  sortOrder: number;
  syncStatus?: string;
  [key: string]: any;
}

export default function LiveEditPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<any>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    try {
      setLoading(true);
      const pageData = await cmsApiClient.getPage(parseInt(unwrappedParams.id));
      const slotsData = await cmsApiClient.getSlotsByPage(parseInt(unwrappedParams.id));
      setPage(pageData.data);
      setSlots(slotsData);
      setLoading(false);
      
      // Notify iframe to refresh if it exists
      const iframe = document.getElementById('storefront-preview') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ action: 'UPDATE', slots: slotsData }, '*');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.action === 'EDIT_COMPONENT') {
        const componentId = parseInt(e.data.id);
        const comp = slots.flatMap(s => s.components).find(c => c.id === componentId);
        if (comp) {
          setEditingComponent(comp);
        } else {
          alert(`Could not find component with id ${componentId} in slots!`);
        }
      } else if (e.data?.action === 'ADD_COMPONENT') {
        const slotIdStr = e.data.slotId;
        const slotId = parseInt(slotIdStr);
        const slot = slots.find(s => s.id === slotId);
        if (slot) {
          setSelectedSlot(slot);
          setShowAddComponent(true);
        } else {
          alert(`Could not find slot with id ${slotId} in slots!`);
        }
      } else if (e.data?.action === 'REORDER_COMPONENT') {
        const componentIdStr = e.data.id;
        const slotIdStr = e.data.slotId;
        const direction = e.data.direction;
        
        if (componentIdStr && slotIdStr && direction) {
          handleMoveComponent(parseInt(slotIdStr), parseInt(componentIdStr), direction);
        }
      } else if (e.data?.action === 'SYNC_ITEM') {
        const id = parseInt(e.data.id);
        const itemType = e.data.itemType; // 'Slot' or 'Component'
        
        if (id && itemType) {
          handleSyncItem(itemType, id);
        }
      } else if (e.data?.action === 'REQUEST_UPDATE') {
        const iframe = document.getElementById('storefront-preview') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow && slots.length > 0) {
          iframe.contentWindow.postMessage({ action: 'UPDATE', slots }, '*');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [slots]);

  const handleAddSlot = async (slotData: { code: string; name: string }) => {
    try {
      await cmsApiClient.createSlot({
        ...slotData,
        pageId: parseInt(unwrappedParams.id),
      });
      setShowAddSlot(false);
      await loadPageData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    if (!confirm('Delete this slot and all its components?')) return;

    try {
      await cmsApiClient.deleteSlot(slotId);
      await loadPageData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddComponent = async (componentData: any, isExisting?: boolean) => {
    try {
      if (isExisting) {
        await cmsApiClient.linkComponent(componentData.slotId, componentData.componentId, componentData.sortOrder);
      } else {
        await cmsApiClient.createComponent(componentData);
      }
      setShowAddComponent(false);
      setSelectedSlot(null);
      await loadPageData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateComponent = async (id: number, componentData: any) => {
    try {
      await cmsApiClient.updateComponent(id, componentData);
      setEditingComponent(null);
      await loadPageData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteComponent = async (slotId: number, id: number) => {
    if (!confirm('Remove this component from the slot?')) return;

    try {
      await cmsApiClient.removeComponentFromSlot(slotId, id);
      await loadPageData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleMoveComponent = async (slotId: number, componentId: number, direction: 'up' | 'down') => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    const componentIndex = slot.components.findIndex(c => c.id === componentId);
    const newOrder = direction === 'up' ? componentIndex - 1 : componentIndex + 1;

    if (newOrder < 0 || newOrder >= slot.components.length) return;

    try {
      await cmsApiClient.reorderComponent(slotId, componentId, newOrder);
      await loadPageData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSyncItem = async (itemType: string, id: number) => {
    try {
      await cmsApiClient.syncItem(itemType, id);
      await loadPageData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleMoveSlot = async (slotId: number, direction: 'up' | 'down') => {
    const slotIndex = slots.findIndex(s => s.id === slotId);
    const newOrder = direction === 'up' ? slotIndex - 1 : slotIndex + 1;

    if (newOrder < 0 || newOrder >= slots.length) return;

    try {
      await cmsApiClient.reorderSlot(slotId, newOrder);
      await loadPageData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading page management...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-8">
        <p className="text-red-600">Page not found</p>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6">
      <div className="mb-6 flex flex-col gap-2">
        <button
          onClick={() => router.push('/cms/pages')}
          className="text-blue-600 hover:text-blue-800 mb-2 self-start font-semibold text-sm font-sans"
        >
          ← Back to Pages
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Live Edit: {page.title}</h1>
        <p className="text-sm text-gray-600 font-mono bg-gray-50 border border-gray-250 rounded px-2.5 py-1.5 self-start">Slug: {page.slug}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Iframe Preview Section */}
      <div className="mb-8 h-[700px] border-2 border-gray-300 rounded-xl overflow-hidden shadow-lg bg-gray-50">
        <iframe
          id="storefront-preview"
          src={`${typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3000` : (process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000')}/${page.slug === 'home' ? '' : page.slug}?edit=true`}
          className="w-full h-full border-none"
          title="Storefront Live Preview"
        />
      </div>

      {/* Add Slot Modal */}
      {showAddSlot && (
        <SlotFormModal
          onClose={() => setShowAddSlot(false)}
          onSave={handleAddSlot}
        />
      )}

      {/* Add Component Modal */}
      {showAddComponent && selectedSlot && (
        <ComponentFormModal
          slotId={selectedSlot.id}
          onClose={() => {
            setShowAddComponent(false);
            setSelectedSlot(null);
          }}
          onSave={handleAddComponent}
        />
      )}

      {/* Edit Component Modal */}
      {editingComponent && (
        <ComponentFormModal
          component={editingComponent}
          slotId={slots.find(s => s.components.some(c => c.id === editingComponent.id))?.id || 0}
          onClose={() => setEditingComponent(null)}
          onSave={(data) => handleUpdateComponent(editingComponent.id, data)}
        />
      )}
    </div>
  );
}

// Component Preview
function ComponentPreview({ component }: { component: Component }) {
  const renderPreview = () => {
    switch (component.type) {
      case 'BANNER':
        return (
          <div className="text-sm text-gray-600 mt-2">
            <p><strong>Title:</strong> {component.title || 'N/A'}</p>
            <p><strong>Subtitle:</strong> {component.subtitle || 'N/A'}</p>
            {component.ctaText && <p><strong>CTA:</strong> {component.ctaText} → {component.ctaUrl}</p>}
          </div>
        );
      case 'PARAGRAPH':
        return (
          <div className="text-sm text-gray-600 mt-2">
            <p><strong>Title:</strong> {component.title || 'N/A'}</p>
            <p className="truncate"><strong>Content:</strong> {component.content?.substring(0, 100)}...</p>
          </div>
        );
      case 'PRODUCT_CAROUSEL':
        return (
          <div className="text-sm text-gray-600 mt-2">
            <p><strong>Title:</strong> {component.title || 'N/A'}</p>
            <p><strong>Products:</strong> {Array.isArray(component.productCodes) ? component.productCodes.join(', ') : component.productCodes}</p>
          </div>
        );
      case 'NAVIGATION':
        return (
          <div className="text-sm text-gray-600 mt-2">
            <p><strong>Text:</strong> {component.displayText || 'N/A'}</p>
            <p><strong>URL:</strong> {component.url || 'N/A'}</p>
            {component.icon && <p><strong>Icon:</strong> {component.icon}</p>}
          </div>
        );
      case 'QUICK_MENU':
        return (
          <div className="text-sm text-gray-600 mt-2">
            <p><strong>Title:</strong> {component.title || 'N/A'}</p>
            <p><strong>URL:</strong> {component.url || 'N/A'}</p>
            <p><strong>Image:</strong> {component.imageUrl || 'N/A'}</p>
          </div>
        );
      case 'PRODUCT_DETAIL':
        return (
          <div className="text-sm text-gray-600 mt-2">
            <p><strong>Title Override:</strong> {component.title || 'N/A'}</p>
            <p><strong>Show Price:</strong> {component.showPrice !== false ? 'Yes' : 'No'}</p>
            <p><strong>Show Description:</strong> {component.showDescription !== false ? 'Yes' : 'No'}</p>
          </div>
        );
      default:
        return (
          <div className="text-sm text-gray-600 mt-2">
            <p><strong>Type:</strong> {component.type}</p>
            <p><strong>Name:</strong> {component.name}</p>
            <p><strong>UID:</strong> {component.uid}</p>
          </div>
        );
    }
  };

  return <div>{renderPreview()}</div>;
}

// Slot Form Modal
function SlotFormModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: { code: string; name: string }) => void;
}) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ code, name });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Add New Slot</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="e.g., hero, content, footer"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Hero Section"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Slot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Component Form Modal (Dynamically generated using schema from backend)
function ComponentFormModal({
  component,
  slotId,
  onClose,
  onSave,
}: {
  component?: Component;
  slotId: number;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [componentTypes, setComponentTypes] = useState<any[]>([]);
  const [type, setType] = useState(component?.type || 'BANNER');
  const [uid, setUid] = useState(component?.uid || '');
  const [name, setName] = useState(component?.name || '');
  const [sortOrder, setSortOrder] = useState(component?.sortOrder || 0);

  const [fields, setFields] = useState<any>({});
  const [schema, setSchema] = useState<any>(null);
  const [loadingSchema, setLoadingSchema] = useState(true);
  const [searchMetadata, setSearchMetadata] = useState<Record<string, any>>({});
  const [searchCriteria, setSearchCriteria] = useState<Record<string, Record<string, { value: string, operator: string }>>>({});
  const [searchResults, setSearchResults] = useState<Record<string, any[]>>({});

  const deduplicateItems = (items: any[]) => {
    if (!Array.isArray(items)) return [];
    const map = new Map();
    items.forEach(item => {
      if (item && item.id && !map.has(item.id)) {
        map.set(item.id, item);
      }
    });
    return Array.from(map.values());
  };

  // Fetch available component types on mount
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await cmsApiClient.getComponentTypes();
        setComponentTypes(types);
      } catch (err) {
        console.error('Error fetching component types:', err);
      }
    };
    fetchTypes();
  }, []);

  // Fetch schema whenever type changes
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        setLoadingSchema(true);
        const schemaData = await cmsApiClient.getComponentSchema(type);
        setSchema(schemaData);

        const newMetadata: Record<string, any> = {};

        // Initialize fields from component values or schema defaults
        const initialFields: any = {};
        if (schemaData && schemaData.fields) {
          for (const field of schemaData.fields) {
            const val = component?.[field.name];
            if (field.type === 'array_string') {
              initialFields[field.name] = Array.isArray(val) ? val.join(', ') : val || '';
            } else if (field.type === 'reference') {
              const isMultiple = field.referenceCardinality === 'MULTIPLE';
              if (!isMultiple) {
                initialFields[field.name] = val || '';
              } else {
                initialFields[field.name] = typeof val === 'string' ? val.split(',').map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(val) ? val : []);
              }

              const itemType = field.referenceTarget;
              if (!newMetadata[itemType]) {
                try {
                  const meta = await cmsApiClient.getSearchMetadata(itemType);
                  newMetadata[itemType] = meta.data;
                  // Auto trigger initial search with empty criteria
                  const res = await cmsApiClient.searchItems(itemType, []);
                  setSearchResults(prev => ({ ...prev, [itemType]: deduplicateItems(res.data) }));
                } catch (err) {
                  console.error('Error fetching search metadata or initial items:', err);
                }
              }
            } else if (field.type === 'boolean') {
              initialFields[field.name] = val !== undefined ? !!val : false;
            } else {
              initialFields[field.name] = val || '';
            }
          }
        }
        setSearchMetadata(newMetadata);
        setFields(initialFields);
        setLoadingSchema(false);
      } catch (err) {
        console.error('Error fetching component schema:', err);
        setLoadingSchema(false);
      }
    };
    fetchSchema();
  }, [type, component]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      Object.keys(searchCriteria).forEach(async (itemType) => {
        try {
          const typeCriteriaMap = searchCriteria[itemType] || {};
          const formattedCriteria = Object.entries(typeCriteriaMap)
            .filter(([_, data]) => data.value !== undefined && data.value !== null && data.value.trim() !== '')
            .map(([field, data]) => ({
              field,
              operator: data.operator,
              value: data.value.trim()
            }));
          const res = await cmsApiClient.searchItems(itemType, formattedCriteria);
          setSearchResults(prev => ({ ...prev, [itemType]: deduplicateItems(res.data) }));
        } catch (err) {
          console.error(`Error searching items for type ${itemType}:`, err);
        }
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchCriteria]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse form values based on schema field types
    const parsedFields: any = {};
    if (schema && schema.fields) {
      schema.fields.forEach((field: any) => {
        const val = fields[field.name];
        if (field.type === 'array_string') {
          parsedFields[field.name] = typeof val === 'string'
            ? val.split(',').map((s: string) => s.trim()).filter(Boolean)
            : val || [];
        } else if (field.type === 'reference') {
          const isMultiple = field.referenceCardinality === 'MULTIPLE';
          if (isMultiple) {
            parsedFields[field.name] = Array.isArray(val) ? val : (typeof val === 'string' ? val.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
          } else {
            parsedFields[field.name] = val || null;
          }
        } else if (field.type === 'boolean') {
          parsedFields[field.name] = !!val;
        } else {
          parsedFields[field.name] = val;
        }
      });
    }

    const baseData = {
      uid,
      name,
      type,
      sortOrder,
      slotId,
    };

    const componentData = { ...baseData, ...parsedFields };
    onSave(componentData);
  };

  const renderDynamicFields = () => {
    if (loadingSchema) {
      return (
        <div className="py-4 text-center text-gray-500 text-sm animate-pulse">
          Loading component details...
        </div>
      );
    }
    if (!schema || !schema.fields) {
      return (
        <div className="py-4 text-center text-red-500 text-sm">
          Failed to load fields schema.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {schema.fields.map((field: any) => (
          <div key={field.name} className="border-b border-gray-50 pb-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center justify-between">
              <span>
                {field.displayName} {field.required && <span className="text-red-500">*</span>}
              </span>
            </label>
            {field.type === 'text' ? (
              <textarea
                value={fields[field.name] || ''}
                onChange={(e) => setFields({ ...fields, [field.name]: e.target.value })}
                required={field.required}
                placeholder={field.placeholder}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            ) : field.type === 'boolean' ? (
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id={`field-${field.name}`}
                  checked={!!fields[field.name]}
                  onChange={(e) => setFields({ ...fields, [field.name]: e.target.checked })}
                  className="h-4.5 w-4.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`field-${field.name}`} className="ml-2 text-sm text-gray-600 font-medium select-none">
                  Enable / Yes
                </label>
              </div>
            ) : field.type === 'image' ? (
              <div className="mt-2">
                <ImageUploader
                  value={fields[field.name] || ''}
                  onChange={(url) => setFields({ ...fields, [field.name]: url })}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              </div>
            ) : field.type === 'reference' ? (
              <div className="space-y-2 mt-2">
                {searchMetadata[field.referenceTarget]?.fields?.map((metaField: any) => (
                  <div key={metaField.name} className="flex gap-2 mb-2">
                    <select
                      value={searchCriteria[field.referenceTarget]?.[metaField.name]?.operator || (metaField.type === 'number' ? 'EQUALS' : 'CONTAINS')}
                      onChange={(e) => {
                        const itemType = field.referenceTarget;
                        setSearchCriteria(prev => ({
                          ...prev,
                          [itemType]: {
                            ...(prev[itemType] || {}),
                            [metaField.name]: {
                              ...(prev[itemType]?.[metaField.name] || { value: '' }),
                              operator: e.target.value
                            }
                          }
                        }));
                      }}
                      className="w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      {metaField.type !== 'number' && <option value="CONTAINS">Contains</option>}
                      <option value="EQUALS">Equals</option>
                      {metaField.type === 'number' && (
                        <>
                          <option value="MORE_THAN">More Than</option>
                          <option value="LESS_THAN">Less Than</option>
                        </>
                      )}
                    </select>
                    <input
                      type="text"
                      placeholder={`Search ${metaField.displayName}...`}
                      value={searchCriteria[field.referenceTarget]?.[metaField.name]?.value || ''}
                      onChange={(e) => {
                        const itemType = field.referenceTarget;
                        setSearchCriteria(prev => ({
                          ...prev,
                          [itemType]: {
                            ...(prev[itemType] || {}),
                            [metaField.name]: {
                              ...(prev[itemType]?.[metaField.name] || { operator: metaField.type === 'number' ? 'EQUALS' : 'CONTAINS' }),
                              value: e.target.value
                            }
                          }
                        }));
                      }}
                      className="w-2/3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                ))}

                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-2 bg-gray-50">
                  {(!searchResults[field.referenceTarget] || searchResults[field.referenceTarget].length === 0) && (
                    <p className="text-sm text-gray-500">No items found.</p>
                  )}
                  {searchResults[field.referenceTarget]?.map((item: any, idx: number) => {
                    const isMultiple = field.referenceCardinality === 'MULTIPLE';
                    const isChecked = isMultiple
                      ? (fields[field.name] || []).includes(item.id)
                      : fields[field.name] === item.id;
                    return (
                      <label key={`${item.id}-${idx}`} className="flex items-start space-x-3 cursor-pointer p-1 hover:bg-gray-100 rounded">
                        <input
                          type={isMultiple ? "checkbox" : "radio"}
                          name={`field-${field.name}`}
                          checked={isChecked}
                          onChange={(e) => {
                            if (isMultiple) {
                              const currentSelected = fields[field.name] || [];
                              if (e.target.checked) {
                                setFields({ ...fields, [field.name]: [...currentSelected, item.id] });
                              } else {
                                setFields({ ...fields, [field.name]: currentSelected.filter((c: string) => c !== item.id) });
                              }
                            } else {
                              setFields({ ...fields, [field.name]: item.id });
                            }
                          }}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.subLabel}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : (
              <input
                type="text"
                value={fields[field.name] || ''}
                onChange={(e) => setFields({ ...fields, [field.name]: e.target.value })}
                required={field.required}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-12">
        <h3 className="text-xl font-bold mb-4">
          {component ? 'Edit Component' : 'Add New Component'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Component Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={!!component}
              className="w-full px-3 py-2 border rounded-md"
            >
              {componentTypes.length > 0 ? (
                componentTypes.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.displayName}
                  </option>
                ))
              ) : (
                <>
                  <option value="BANNER">Banner</option>
                  <option value="PARAGRAPH">Paragraph</option>
                  <option value="PRODUCT_CAROUSEL">Product Carousel</option>
                  <option value="NAVIGATION">Navigation</option>
                  <option value="QUICK_MENU">Quick Menu</option>
                  <option value="PRODUCT_DETAIL">Product Details</option>
                </>
              )}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">UID (Unique Identifier)</label>
            <input
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              required
              placeholder="e.g., hero-banner-1"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Main Hero Banner"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value))}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="mb-4 border-t border-gray-100 pt-4">
            <label className="block text-sm font-semibold mb-2 text-gray-900">Component-Specific Fields</label>
            {renderDynamicFields()}
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {component ? 'Update' : 'Create'} Component
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

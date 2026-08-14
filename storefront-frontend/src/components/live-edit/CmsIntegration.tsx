'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import CmsOverlay from './CmsOverlay';
import CmsBridge from './CmsBridge';

function CmsIntegrationInner() {
  const searchParams = useSearchParams();
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    setIsEditMode(searchParams.has('edit'));
  }, [searchParams]);

  if (!isEditMode) return null;

  return (
    <>
      <CmsOverlay />
      <CmsBridge />
    </>
  );
}

export default function CmsIntegration() {
  return (
    <Suspense fallback={null}>
      <CmsIntegrationInner />
    </Suspense>
  );
}

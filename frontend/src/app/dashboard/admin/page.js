'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminOverviewPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to spaces page
    router.replace('/dashboard/admin/spaces');
  }, [router]);

  return null;
}

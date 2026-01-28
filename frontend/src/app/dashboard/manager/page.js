'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManagerDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Users page by default
    router.push('/dashboard/manager/users');
  }, [router]);

  return null;
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = auth.isAuthenticated();
      
      if (!authenticated) {
        // Redirect to login if not authenticated
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };

    // Run check after a small delay to ensure cookies are loaded
    const timer = setTimeout(checkAuth, 50);
    
    return () => clearTimeout(timer);
  }, [router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? children : null;
}

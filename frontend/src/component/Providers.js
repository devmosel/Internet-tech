/**
 * Client-side Providers Wrapper
 * Wraps children with all necessary context providers
 */

'use client';

import { ToastProvider } from "@/contexts/ToastContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { SpacesWebSocketProvider } from "@/contexts/SpacesWebSocketContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function Providers({ children }) {
  // Create QueryClient inside component to ensure it's created on the client side
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <WebSocketProvider>
          <SpacesWebSocketProvider>
            {children}
          </SpacesWebSocketProvider>
        </WebSocketProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

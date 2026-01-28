'use client';

import { useLogout } from '@/hooks';

export default function LogoutButton({ className = '', children = 'Logout' }) {
  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={isPending}
      className={className || "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"}
    >
      {isPending ? 'Logging out...' : children}
    </button>
  );
}

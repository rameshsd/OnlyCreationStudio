
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProfileRedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Use replace to avoid adding a redirect step to the browser history
        router.replace(`/profile/${user.uid}`);
      } else {
        // If not logged in, redirect to the login page
        router.replace('/login');
      }
    }
    // The dependency array ensures this effect runs only when user or loading state changes.
  }, [user, loading, router]);

  // Render a loading indicator while the redirect is being prepared.
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}

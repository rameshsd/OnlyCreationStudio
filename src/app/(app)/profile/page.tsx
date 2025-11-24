
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function ProfileRedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace(`/profile/${user.uid}`);
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return null; // Or a loading spinner
}

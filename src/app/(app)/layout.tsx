

import { AppLayout } from '@/components/app-layout';
import { type ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  // Adding a unique key to AppLayout forces a remount on navigation.
  // This is a temporary workaround to ensure dnd works correctly with turbopack.
  // In a production app, this might have performance implications.
  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}

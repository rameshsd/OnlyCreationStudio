"use client";

import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { FirebaseErrorListener } from '@/components/firebase-error-listener';
import { type ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
        <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        >
        {children}
        <FirebaseErrorListener />
        </ThemeProvider>
    </AuthProvider>
  );
}

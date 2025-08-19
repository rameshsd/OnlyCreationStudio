
"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page will likely become a list of projects in the future.
// For now, it just redirects to the first project.
export default function ProjectsPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/projects/1');
    }, [router]);

    return (
        <div className="flex h-full w-full items-center justify-center">
            <p>Redirecting to your project...</p>
        </div>
    );
}

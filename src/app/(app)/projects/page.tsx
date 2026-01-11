

"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FolderKanban, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { useMemoFirebase } from '@/firebase/useMemoFirebase';
import { useCollection } from '@/firebase/firestore/use-collection';

interface Project {
    id: string;
    name: string;
    description: string;
}

const ProjectCardSkeleton = () => (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
        </CardHeader>
    </Card>
)

export default function ProjectsPage() {
    const { user } = useAuth();
    
    const projectsQuery = useMemoFirebase(
        user ? query(collection(db, "projects"), where("ownerId", "==", user.uid)) : null,
        [user]
    );
    
    const { data: projects, isLoading: loading } = useCollection<Project>(projectsQuery);


    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage all your projects in one place.</p>
                </div>
                <Button asChild>
                    <Link href="/projects/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create new project
                    </Link>
                </Button>
            </div>

            {loading ? (
                <div className="space-y-4">
                   <ProjectCardSkeleton />
                   <ProjectCardSkeleton />
                   <ProjectCardSkeleton />
                </div>
            ) : projects && projects.length > 0 ? (
                <div className="space-y-4">
                    {projects.map(project => (
                        <Link key={project.id} href={`/projects/${project.id}`}>
                            <Card className="hover:bg-accent hover:border-primary/50 transition-colors cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-lg">
                                            <FolderKanban className="h-8 w-8 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">{project.name}</CardTitle>
                                            <CardDescription>{project.description}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center text-center py-24 border-2 border-dashed rounded-lg">
                    <FolderKanban className="h-16 w-16 text-muted-foreground" />
                    <h2 className="mt-6 text-xl font-semibold">No projects yet</h2>
                    <p className="mt-2 text-muted-foreground">Get started by creating your first project.</p>
                    <Button asChild className="mt-6">
                        <Link href="/projects/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Project
                        </Link>
                    </Button>
                 </div>
            )}
        </div>
    );
}

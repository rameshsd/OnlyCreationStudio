
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FolderKanban, Plus } from 'lucide-react';
import Link from 'next/link';

// In a real app, you would fetch and display a list of projects from your database.
const projects = [
    { id: '1', name: 'Creator Canvas Product Roadmap', description: 'The main product roadmap and backlog for the Creator Canvas application.' }
];

export default function ProjectsPage() {
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

            {projects.length > 0 ? (
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

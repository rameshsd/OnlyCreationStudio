
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { GitBranch, Eye, Users, Shield, Rocket, ListChecks, Activity, BrainCircuit, Loader2 } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';


export default function CreateProjectPage() {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [versionControl, setVersionControl] = useState('git');
  const [workItemProcess, setWorkItemProcess] = useState('agile');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to create a project.", variant: "destructive" });
        return;
    }
    if (!projectName.trim()) {
        toast({ title: "Project Name Required", description: "Please enter a name for your project.", variant: "destructive" });
        return;
    }
    setLoading(true);

    try {
      const projectData = {
        name: projectName,
        description,
        visibility,
        versionControl,
        workItemProcess,
        ownerId: user.uid,
        createdAt: new Date(),
        columns: {
            'todo': { id: 'todo', title: 'To Do', tasks: [] },
            'in-progress': { id: 'in-progress', title: 'In Progress', tasks: [] },
            'done': { id: 'done', title: 'Done', tasks: [] },
        },
        columnOrder: ['todo', 'in-progress', 'done'],
      };

      const docRef = await addDoc(collection(db, "projects"), projectData);

      toast({
        title: "Project Created!",
        description: `The project "${projectName}" has been successfully created.`,
      });
      
      router.push(`/projects/${docRef.id}`);

    } catch (error) {
        console.error("Error creating project: ", error);
        toast({ title: "Error", description: "Failed to create project. Please try again.", variant: "destructive"});
        setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Create a New Project</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Define the details for your new project to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 grid gap-8">
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-lg font-semibold">Project Name</Label>
              <Input
                id="project-name"
                placeholder="e.g., Clinical Trial Management, Social Media App"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-lg font-semibold">Description</Label>
              <Textarea
                id="description"
                placeholder="A short overview of what this project is about."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Visibility</Label>
              <RadioGroup value={visibility} onValueChange={setVisibility} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <RadioGroupItem value="public" id="public" className="peer sr-only" disabled={loading} />
                  <Label htmlFor="public" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    <Eye className="mb-3 h-6 w-6" />
                    Public
                    <span className="text-xs text-center mt-1 text-muted-foreground">Anyone can see this project.</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="private" id="private" className="peer sr-only" disabled={loading} />
                  <Label htmlFor="private" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    <Shield className="mb-3 h-6 w-6" />
                    Private
                     <span className="text-xs text-center mt-1 text-muted-foreground">You choose who can see this project.</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="version-control" className="text-lg font-semibold flex items-center gap-2"><GitBranch className="h-5 w-5"/>Version Control</Label>
                  <Select value={versionControl} onValueChange={setVersionControl} disabled={loading}>
                    <SelectTrigger id="version-control">
                      <SelectValue placeholder="Select version control" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="git">Git</SelectItem>
                      <SelectItem value="tfvc">Team Foundation Version Control</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                   <Label htmlFor="work-item-process" className="text-lg font-semibold flex items-center gap-2"><ListChecks className="h-5 w-5"/>Work Item Process</Label>
                  <Select value={workItemProcess} onValueChange={setWorkItemProcess} disabled={loading}>
                    <SelectTrigger id="work-item-process">
                      <SelectValue placeholder="Select a process" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agile"><div className="flex items-center gap-2"><Activity className="h-4 w-4"/>Agile</div></SelectItem>
                      <SelectItem value="scrum"><div className="flex items-center gap-2"><Rocket className="h-4 w-4"/>Scrum</div></SelectItem>
                      <SelectItem value="cmmi"><div className="flex items-center gap-2"><BrainCircuit className="h-4 w-4"/>CMMI</div></SelectItem>
                       <SelectItem value="basic"><div className="flex items-center gap-2"><Users className="h-4 w-4"/>Basic</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end p-6">
            <Button type="submit" size="lg" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

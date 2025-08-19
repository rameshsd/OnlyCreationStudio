
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
import { GitBranch, Eye, Users, Shield, Rocket, ListChecks, Activity, BrainCircuit } from 'lucide-react';

export default function CreateProjectPage() {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [versionControl, setVersionControl] = useState('git');
  const [workItemProcess, setWorkItemProcess] = useState('agile');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // In a real application, you would save this data to your database and get a new project ID.
    console.log({
      projectName,
      description,
      visibility,
      versionControl,
      workItemProcess,
    });
    
    toast({
      title: "Project Created!",
      description: `The project "${projectName}" has been successfully created.`,
    });

    // Simulate async operation
    setTimeout(() => {
      setLoading(false);
      // Redirect to the newly created project's page, passing details in query params.
      const newProjectId = `proj-${Date.now()}`;
      const query = new URLSearchParams({
        name: projectName,
        description: description,
      }).toString();
      router.push(`/projects/${newProjectId}?${query}`); 
    }, 1000);
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
              />
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Visibility</Label>
              <RadioGroup value={visibility} onValueChange={setVisibility} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <RadioGroupItem value="public" id="public" className="peer sr-only" />
                  <Label htmlFor="public" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    <Eye className="mb-3 h-6 w-6" />
                    Public
                    <span className="text-xs text-center mt-1 text-muted-foreground">Anyone can see this project.</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="private" id="private" className="peer sr-only" />
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
                  <Select value={versionControl} onValueChange={setVersionControl}>
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
                  <Select value={workItemProcess} onValueChange={setWorkItemProcess}>
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
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

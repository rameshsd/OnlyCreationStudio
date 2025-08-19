
"use client";

import { useState } from 'react';
import type { Project, Task, WorkItemType } from "@/app/(app)/projects/[projectId]/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, BookOpen, Bug, Puzzle, Rocket, Trophy, Plus, GripVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"


const workItemTypes: { value: WorkItemType; label: string; icon: React.ElementType }[] = [
    { value: "Epic", label: "Epic", icon: Rocket },
    { value: "Feature", label: "Feature", icon: Trophy },
    { value: "User Story", label: "User Story", icon: BookOpen },
    { value: "Task", label: "Task", icon: Puzzle },
    { value: "Bug", label: "Bug", icon: Bug },
]

const getIconForTaskType = (type: WorkItemType): React.ElementType => {
    return workItemTypes.find(item => item.value === type)?.icon || Puzzle;
}

const WorkItemRow = ({ item, allItems, level = 0 }: { item: Task, allItems: Task[], level?: number }) => {
    const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand Epics and Features
    const children = allItems.filter(child => child.parentId === item.id);
    const Icon = getIconForTaskType(item.type);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex items-center" style={{ paddingLeft: `${level * 2}rem` }}>
                 <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className={cn("h-8 w-8", children.length === 0 && "invisible")}>
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span className="sr-only">Toggle</span>
                    </Button>
                </CollapsibleTrigger>
                
                <div className="flex-1 flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium flex-1 truncate">{item.title}</span>
                    <div className="flex items-center gap-2 -space-x-2 mr-2">
                        {item.assignees.map(assignee => (
                             <Avatar key={assignee} className="h-6 w-6 border-2 border-card">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${assignee}`} data-ai-hint="user avatar" />
                                <AvatarFallback className="text-xs">{assignee.substring(0,1)}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" className="h-7"><Plus className="h-4 w-4 mr-1" /> Add Child</Button>
                </div>
            </div>
            <CollapsibleContent>
                 {children.map(child => (
                    <WorkItemRow key={child.id} item={child} allItems={allItems} level={level + 1} />
                ))}
            </CollapsibleContent>
        </Collapsible>
    )
}


export function BacklogView({ project }: { project: Project }) {
    if (!project || !project.workItems) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Backlog</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>No work items found for this project.</p>
                </CardContent>
            </Card>
        )
    }

    const topLevelItems = project.workItems.filter(item => !item.parentId);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Backlog</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    {topLevelItems.map(item => (
                        <WorkItemRow key={item.id} item={item} allItems={project.workItems} />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

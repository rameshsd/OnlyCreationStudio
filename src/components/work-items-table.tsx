
"use client";

import type { Project, Task, WorkItemType } from "@/app/(app)/projects/[projectId]/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { getInfoForTaskType, statusColors } from "@/app/(app)/projects/[projectId]/page";

const tagColors: {[key: string]: string} = {
    "HIGH": "bg-red-100 text-red-800 border-red-200",
    "MEDIUM": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Fix-on-priority": "bg-blue-100 text-blue-800 border-blue-200",
}


const WorkItemRow = ({ item }: { item: Task }) => {
    const { icon: Icon } = getInfoForTaskType(item.type);

    return (
        <TableRow>
            <TableCell className="w-10">
                <Checkbox />
            </TableCell>
            <TableCell className="font-medium">{item.id.split('-')[1]}</TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{item.title}</span>
                </div>
            </TableCell>
            <TableCell>
                 {item.assignees && item.assignees.length > 0 ? (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={item.assignees[0].avatar} data-ai-hint="user avatar" />
                            <AvatarFallback className="text-xs">{item.assignees[0].name.substring(0,2)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{item.assignees[0].name}</span>
                    </div>
                ) : <span className="text-xs text-muted-foreground">Unassigned</span>}
            </TableCell>
            <TableCell>
                 <div className="flex items-center gap-2 text-xs">
                    <div className={cn("w-2.5 h-2.5 rounded-full", statusColors[item.status])} />
                    <span>{item.status}</span>
                </div>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">{item.areaPath}</TableCell>
            <TableCell>
                {item.tags.map(tag => (
                    <Badge key={tag.label} variant="outline" className={cn("font-normal", tagColors[tag.label])}>
                        {tag.label}
                    </Badge>
                ))}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1 text-muted-foreground">
                   <MessageCircle className="h-4 w-4"/> 
                   <span>{item.comments}</span>
                </div>
            </TableCell>
             <TableCell className="text-xs text-muted-foreground">{item.updatedAt}</TableCell>
        </TableRow>
    )
}


export function WorkItemsTable({ project }: { project: Project | null }) {
    if (!project || !project.workItems) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Work Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>No work items found for this project.</p>
                </CardContent>
            </Card>
        )
    }

    const allItems = Object.values(project.workItems);
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Work Items</CardTitle>
                <Button><Plus className="h-4 w-4 mr-2"/> Add Work Item</Button>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10"><Checkbox /></TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>State</TableHead>
                                <TableHead>Area Path</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead>Comments</TableHead>
                                <TableHead>Updated At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allItems.map(item => (
                                <WorkItemRow key={item.id} item={item} />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}


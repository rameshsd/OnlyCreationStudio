

"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, BookOpen, Bug, Puzzle, Rocket, Trophy, GanttChartSquare, ListTodo, BarChart2, Calendar, History, Archive } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WorkItemsTable } from '@/components/work-items-table';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';


export type WorkItemType = "Epic" | "Feature" | "User Story" | "Task" | "Bug";

export type Task = {
    id: string;
    icon?: React.ElementType;
    title: string;
    type: WorkItemType;
    status: "New" | "Active" | "Resolved" | "Closed" | "Doing";
    tags: { label: string; color: string }[];
    assignees: { name: string, avatar: string }[];
    parentId?: string | null;
    progress?: { current: number, total: number };
    areaPath: string;
    comments: number;
    updatedAt: string;
}

export type Column = {
    id: string;
    title: string;
    taskIds: string[];
}

export type Project = {
    id?: string;
    name: string;
    description: string;
    columns: { [key: string]: Column };
    columnOrder: string[];
    workItems: { [key: string]: Task };
}

const workItemTypes: { value: WorkItemType; label: string; icon: React.ElementType, color: string }[] = [
    { value: "Epic", label: "Epic", icon: Rocket, color: 'bg-orange-400' },
    { value: "Feature", label: "Feature", icon: Trophy, color: 'bg-purple-400' },
    { value: "User Story", label: "User Story", icon: BookOpen, color: 'bg-blue-400' },
    { value: "Task", label: "Task", icon: Puzzle, color: 'bg-gray-400' },
    { value: "Bug", label: "Bug", icon: Bug, color: 'bg-red-400' },
]

export const getInfoForTaskType = (type: WorkItemType) => {
    return workItemTypes.find(item => item.value === type) || { icon: Puzzle, color: 'bg-gray-400' };
}

export const statusColors: {[key: string]: string} = {
    "New": "bg-gray-500",
    "Active": "bg-blue-500",
    "Resolved": "bg-purple-500",
    "Closed": "bg-green-500",
    "Doing": "bg-yellow-500"
}


const AddTaskForm = ({ columnId, onAddTask, onCancel }: { columnId: string, onAddTask: (columnId: string, taskTitle: string, taskType: WorkItemType) => void, onCancel: () => void }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<WorkItemType>("Task");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onAddTask(columnId, title.trim(), type);
            setTitle('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-1 mt-2 space-y-4">
            <Textarea 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                className="w-full"
                rows={3}
                autoFocus
            />
            <div>
                 <Label htmlFor="task-type">Type</Label>
                 <Select value={type} onValueChange={(value) => setType(value as WorkItemType)}>
                    <SelectTrigger id="task-type">
                        <SelectValue placeholder="Select work item type" />
                    </SelectTrigger>
                    <SelectContent>
                        {workItemTypes.map(item => (
                             <SelectItem key={item.value} value={item.value}>
                                 <div className="flex items-center gap-2">
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                 </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                <Button type="submit" size="sm">Add Task</Button>
                <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
            </div>
        </form>
    )
}

const ProjectSkeleton = () => (
    <div className="flex flex-col gap-8 h-full">
        <div>
            <Skeleton className="h-9 w-1/3 mb-2" />
            <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex-1 overflow-x-auto">
            <div className="flex gap-6 items-start h-full pb-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-80 flex-shrink-0 bg-secondary/50 rounded-lg p-3 space-y-3">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const TaskCard = ({ task }: { task: Task }) => {
    const { icon: Icon, color } = getInfoForTaskType(task.type);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`relative bg-card p-3 rounded-md shadow-sm border-l-4`}
            data-is-dragging={isDragging}
        >
            <div className={cn("absolute top-0 left-0 bottom-0 w-1 rounded-l-md", color)}></div>
            <div className="pl-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Icon className="h-4 w-4" />
                    <span>{task.id.split('-')[1]}</span>
                    <h4 className="font-semibold text-sm text-foreground flex-1 truncate">{task.title}</h4>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className={cn("w-2.5 h-2.5 rounded-full", statusColors[task.status])} />
                    <span>{task.status}</span>
                </div>

                <div className="flex items-center justify-between mt-2">
                    {task.assignees && task.assignees.length > 0 ? (
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={task.assignees[0].avatar} data-ai-hint="user avatar" />
                                <AvatarFallback className="text-xs">{task.assignees[0].name.substring(0,2)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{task.assignees[0].name}</span>
                        </div>
                    ) : <div />}
                    
                    {task.progress && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ListTodo className="h-3 w-3" />
                            <span>{task.progress.current}/{task.progress.total}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [newColumnName, setNewColumnName] = useState('');
  const [addingTaskToColumn, setAddingTaskToColumn] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!user || !projectId) return;

    setLoading(true);
    const docRef = doc(db, "projects", projectId);
    const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data() as Omit<Project, 'id'>;

            const workItemsArray = Array.isArray(data.workItems) ? data.workItems : [];
            
            const workItemsMap = workItemsArray.reduce((acc, item) => {
                acc[item.id] = item;
                return acc;
            }, {} as {[key: string]: Task});

            const sanitizedColumns = (data.columnOrder || []).reduce((acc, columnId) => {
                const column = data.columns[columnId];
                if(column) {
                    const taskIds = (column.taskIds || []).map(task => typeof task === 'string' ? task : (task as any).id).filter(Boolean);
                    acc[columnId] = { ...column, taskIds: taskIds };
                }
                return acc;
            }, {} as {[key: string]: Column});


            setProject({ ...data, id: doc.id, workItems: workItemsMap, columns: sanitizedColumns });

        } else {
            toast({ title: "Error", description: "Project not found.", variant: "destructive" });
            setProject(null);
        }
        setLoading(false);
    }, (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `projects/${projectId}`,
            operation: 'get'
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId, user, toast]);

  const updateProjectInDb = async (updatedProjectData: Partial<Omit<Project, 'id'>>) => {
    if (!projectId) return;
    const docRef = doc(db, "projects", projectId);

    const dataToUpdate: { [key: string]: any } = { ...updatedProjectData };
    if (updatedProjectData.workItems) {
        dataToUpdate.workItems = Object.values(updatedProjectData.workItems);
    }
    
    updateDoc(docRef, dataToUpdate).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: `projects/${projectId}`,
            operation: 'update',
            requestResourceData: dataToUpdate
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }

 const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over || !project) return;
    if (active.id === over.id) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;

    const newProject = { ...project };
    const { columns } = newProject;
    
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId) || findColumnContainer(overId);
    
    if (!activeContainer || !overContainer || !columns[activeContainer] || !columns[overContainer]) {
      return;
    }

    if (activeContainer === overContainer) {
      // Move within the same column
      const taskIds = columns[activeContainer].taskIds;
      const oldIndex = taskIds.indexOf(activeId);
      const newIndex = taskIds.indexOf(overId);
      columns[activeContainer].taskIds = arrayMove(taskIds, oldIndex, newIndex);
    } else {
      // Move to a different column
      const activeTaskIds = columns[activeContainer].taskIds;
      const overTaskIds = columns[overContainer].taskIds;
      const activeIndex = activeTaskIds.indexOf(activeId);
      
      let newIndex = overTaskIds.length;
      if (columns[overContainer].taskIds.includes(overId)){
        newIndex = overTaskIds.indexOf(overId);
      }
      
      columns[activeContainer].taskIds.splice(activeIndex, 1);
      columns[overContainer].taskIds.splice(newIndex, 0, activeId);
    }

    setProject(newProject);
    updateProjectInDb({ columns: newProject.columns });
  };
  
  const findContainer = (id: string) => {
    if (!project) return;
    if (id in project.columns) {
      return id;
    }
    for (const columnId in project.columns) {
      if (project.columns[columnId].taskIds.includes(id)) {
        return columnId;
      }
    }
  };

  const findColumnContainer = (id: string) => {
    if (project?.columns[id]) return id;
    return undefined;
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim() || !project) return;
    const newColumnId = `column-${Date.now()}`;
    const newColumn: Column = { id: newColumnId, title: newColumnName, taskIds: [] };

    const newProjectData: Project = {
      ...project,
      columns: { ...project.columns, [newColumnId]: newColumn },
      columnOrder: [...project.columnOrder, newColumnId],
    };

    setProject(newProjectData);
    await updateProjectInDb({
        columns: newProjectData.columns, 
        columnOrder: newProjectData.columnOrder, 
    });
    setNewColumnName('');
  };

  const handleAddTask = async (columnId: string, taskTitle: string, taskType: WorkItemType) => {
    if(!project) return;

    const newTaskId = `task-${Date.now()}`;
    const newTask: Task = {
        id: newTaskId,
        title: taskTitle,
        type: taskType,
        tags: [],
        assignees: [],
        parentId: null,
        status: 'New',
        progress: {current: 0, total: 1},
        areaPath: 'Project Management',
        comments: 0,
        updatedAt: new Date().toLocaleDateString(),
    };

    const targetColumn = project.columns[columnId];
    const newTaskIds = [...targetColumn.taskIds, newTaskId];
    const updatedColumn = { ...targetColumn, taskIds: newTaskIds };
    
    const newProjectData: Project = {
        ...project,
        columns: {
            ...project.columns,
            [columnId]: updatedColumn
        },
        workItems: {...project.workItems, [newTaskId]: newTask }
    }
    setProject(newProjectData);
    await updateProjectInDb({ 
        columns: newProjectData.columns, 
        workItems: newProjectData.workItems as any,
    });
    setAddingTaskToColumn(null);
  }

  if (loading) return <ProjectSkeleton />;
  if (!project) return <div>Project not found. Start by creating a new one.</div>;
  
  const activeTask = activeId ? project.workItems[activeId] : null;

  return (
    <div className="flex flex-col gap-4 h-full">
         <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            </div>
        </header>

         <Tabs defaultValue="board" className="w-full">
            <TabsList>
                <TabsTrigger value="board"><GanttChartSquare className="mr-2 h-4 w-4"/>Board</TabsTrigger>
                <TabsTrigger value="work-items"><Archive className="mr-2 h-4 w-4"/>Work Items</TabsTrigger>
                <TabsTrigger value="analytics"><BarChart2 className="mr-2 h-4 w-4"/>Analytics</TabsTrigger>
                <TabsTrigger value="timeline"><History className="mr-2 h-4 w-4"/>Feature Timeline</TabsTrigger>
                <TabsTrigger value="roadmap"><Calendar className="mr-2 h-4 w-4"/>Epic Roadmap</TabsTrigger>
            </TabsList>
            <TabsContent value="board" className="mt-4">
                <div className="flex-1 overflow-x-auto">
                    {isMounted && (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex gap-4 items-start h-full pb-4">
                            <SortableContext items={project.columnOrder || []} strategy={rectSortingStrategy}>
                                {(project.columnOrder || []).map((columnId) => {
                                    const column = project.columns[columnId];
                                    if (!column) return null;
                                    
                                    const tasks = column.taskIds.map(id => project.workItems[id]).filter(Boolean);

                                    return (
                                        <div key={column.id} className="w-80 flex-shrink-0">
                                            <div className="flex justify-between items-center bg-secondary p-2 rounded-t-lg">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-foreground text-sm">{column.title}</h3>
                                                    <Badge variant="secondary" className="text-xs">{tasks.length}/10</Badge>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAddingTaskToColumn(column.id)}><Plus className="h-4 w-4" /></Button>
                                                </div>
                                            </div>
                                             <div className={`space-y-2 p-2 rounded-b-lg transition-colors min-h-[200px] bg-secondary/70`}>
                                                <SortableContext items={column.taskIds} strategy={rectSortingStrategy}>
                                                    {tasks.map(task => (
                                                        <TaskCard key={task.id} task={task} />
                                                    ))}
                                                </SortableContext>

                                                {addingTaskToColumn === column.id && (
                                                    <AddTaskForm 
                                                        columnId={column.id} 
                                                        onAddTask={handleAddTask}
                                                        onCancel={() => setAddingTaskToColumn(null)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                              </SortableContext>

                                <DragOverlay>
                                    {activeTask ? <TaskCard task={activeTask} /> : null}
                                </DragOverlay>

                                <div className="w-72 flex-shrink-0">
                                    <div className="bg-secondary/50 p-2 rounded-lg">
                                        <div className="flex gap-2">
                                            <Input value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)} placeholder="Add new column..." className="bg-background" />
                                            <Button onClick={handleAddColumn} size="icon"><Plus className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DndContext>
                    )}
                 </div>
            </TabsContent>
            <TabsContent value="work-items">
                <WorkItemsTable project={project} />
            </TabsContent>
         </Tabs>
    </div>
  )
}

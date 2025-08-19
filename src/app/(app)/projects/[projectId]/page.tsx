
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, BookOpen, Bug, Puzzle, Rocket, Trophy } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BacklogView } from '@/components/backlog-view';
import { ListTodo, GanttChartSquare } from 'lucide-react';


export type WorkItemType = "Epic" | "Feature" | "User Story" | "Task" | "Bug";

export type Task = {
    id: string;
    icon?: React.ElementType;
    title: string;
    type: WorkItemType;
    tags: { label: string; color: string }[];
    assignees: string[];
    parentId?: string | null;
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


export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [addingTaskToColumn, setAddingTaskToColumn] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (!user || !projectId) return;

    setLoading(true);
    const docRef = doc(db, "projects", projectId);
    const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data() as Omit<Project, 'id'>;

            const workItemsArray = Array.isArray(data.workItems) ? data.workItems : [];
            
            // Normalize workItems to a map if it's an array
            const workItemsMap = workItemsArray.reduce((acc, item) => {
                acc[item.id] = item;
                return acc;
            }, {} as {[key: string]: Task});

            // Ensure columns have taskIds array
            const sanitizedColumns = Object.entries(data.columns).reduce((acc, [columnId, column]) => {
                const taskIds = (column.tasks || []).map(task => typeof task === 'string' ? task : task.id);
                acc[columnId] = { ...column, taskIds: taskIds || [] };
                delete (acc[columnId] as any).tasks;
                return acc;
            }, {} as {[key: string]: Column});


            setProject({ ...data, id: doc.id, workItems: workItemsMap, columns: sanitizedColumns });

        } else {
            toast({ title: "Error", description: "Project not found.", variant: "destructive" });
            setProject(null);
        }
        setLoading(false);
    }, (error) => {
        console.error("Error fetching project:", error);
        toast({ title: "Error", description: "Failed to fetch project data.", variant: "destructive" });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId, user, toast]);

  const updateProjectInDb = async (updatedProjectData: Partial<Omit<Project, 'id'>>) => {
    if (!projectId) return;
    const docRef = doc(db, "projects", projectId);
    try {
        // When updating, convert workItems map back to array for Firestore
        if (updatedProjectData.workItems) {
            (updatedProjectData as any).workItems = Object.values(updatedProjectData.workItems);
        }
        await updateDoc(docRef, updatedProjectData);
    } catch (error) {
        console.error("Error updating project:", error);
        toast({ title: "Update Error", description: "Failed to save changes.", variant: "destructive" });
    }
  }

  const onDragEnd = (result: DropResult) => {
    if (!project) return;
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    const startColumn = project.columns[source.droppableId];
    const endColumn = project.columns[destination.droppableId];
    
    const newProject = { ...project };

    if (startColumn === endColumn) {
        const newTaskIds = Array.from(startColumn.taskIds);
        newTaskIds.splice(source.index, 1);
        newTaskIds.splice(destination.index, 0, draggableId);
        
        const newColumn = { ...startColumn, taskIds: newTaskIds };
        newProject.columns[newColumn.id] = newColumn;
    } else {
        const startTaskIds = Array.from(startColumn.taskIds);
        startTaskIds.splice(source.index, 1);
        const newStartColumn = { ...startColumn, taskIds: startTaskIds };

        const endTaskIds = Array.from(endColumn.taskIds);
        endTaskIds.splice(destination.index, 0, draggableId);
        const newEndColumn = { ...endColumn, taskIds: endTaskIds };
        
        newProject.columns[newStartColumn.id] = newStartColumn;
        newProject.columns[newEndColumn.id] = newEndColumn;
    }
    
    setProject(newProject as Project);
    updateProjectInDb({ columns: newProject.columns });
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
  
  const allWorkItems = project.workItems ? Object.values(project.workItems) : [];
  const topLevelTasks = allWorkItems.filter(task => !task.parentId);

  const getTasksForColumn = (columnId: string): Task[] => {
      const column = project.columns[columnId];
      if (!column) return [];
      
      const taskIdsInColumn = new Set(column.taskIds);
      return topLevelTasks
        .filter(task => taskIdsInColumn.has(task.id))
        .sort((a, b) => column.taskIds.indexOf(a.id) - column.taskIds.indexOf(b.id));
  }


  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        <p className="text-muted-foreground max-w-3xl">{project.description}</p>
      </div>
      
        <Tabs defaultValue="board" className="w-full">
            <TabsList>
                <TabsTrigger value="board"><GanttChartSquare className="mr-2 h-4 w-4" /> Board</TabsTrigger>
                <TabsTrigger value="backlog"><ListTodo className="mr-2 h-4 w-4" /> Backlog</TabsTrigger>
            </TabsList>
            <TabsContent value="board" className="mt-4">
                 <div className="flex-1 overflow-x-auto">
                    {isMounted && (
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="flex gap-6 items-start h-full pb-4">
                            {project.columnOrder.map((columnId) => {
                                const column = project.columns[columnId];
                                if (!column) return null;
                                
                                const tasks = getTasksForColumn(columnId).map(task => ({
                                    ...task,
                                    icon: getIconForTaskType(task.type)
                                }));

                                return (
                                    <div key={column.id} className="w-80 flex-shrink-0">
                                        <div className="flex justify-between items-center bg-secondary/50 p-3 rounded-t-lg">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-foreground">{column.title}</h3>
                                                <Badge variant="secondary" className="text-sm">{tasks.length}</Badge>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAddingTaskToColumn(column.id)}><Plus className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                        <Droppable droppableId={column.id}>
                                            {(provided, snapshot) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    className={`space-y-3 p-2 rounded-b-lg transition-colors min-h-[200px] bg-secondary/50 ${snapshot.isDraggingOver ? 'bg-primary/10' : ''}`}
                                                >
                                                {tasks.map((task, index) => (
                                                    <Draggable draggableId={task.id} index={index} key={task.id}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`bg-card p-4 rounded-lg shadow-sm border ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}
                                                            >
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    {task.icon && <task.icon className="h-4 w-4 text-muted-foreground" />}
                                                                    <p className="font-semibold leading-none">{task.title}</p>
                                                                </div>
                                                                
                                                                {task.assignees && task.assignees.length > 0 && (
                                                                    <div className="flex items-center gap-2 mt-3 -space-x-2">
                                                                        {task.assignees.map(assignee => (
                                                                            <Avatar key={assignee} className="h-6 w-6 border-2 border-card">
                                                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${assignee}`} data-ai-hint="user avatar" />
                                                                                <AvatarFallback className="text-xs">{assignee.substring(0,1)}</AvatarFallback>
                                                                            </Avatar>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                
                                                                {task.tags && task.tags.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                                                        {task.tags.map(tag => (
                                                                            <Badge key={tag.label} variant="secondary">{tag.label}</Badge>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}

                                                {addingTaskToColumn === column.id && (
                                                    <AddTaskForm 
                                                        columnId={column.id} 
                                                        onAddTask={handleAddTask}
                                                        onCancel={() => setAddingTaskToColumn(null)}
                                                    />
                                                )}
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                );
                            })}
                            <div className="w-72 flex-shrink-0">
                                <div className="bg-secondary/50 p-2 rounded-lg">
                                    <div className="flex gap-2">
                                        <Input value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)} placeholder="Add new column..." className="bg-background" />
                                        <Button onClick={handleAddColumn} size="icon"><Plus className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </DragDropContext>
                    )}
                 </div>
            </TabsContent>
            <TabsContent value="backlog">
                 <BacklogView project={project} />
            </TabsContent>
        </Tabs>
    </div>
  )
}


"use client";

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Paperclip, FileText, Video, Music, Clock, GripVertical, Bug, Award, Wrench, Eye, KeyRound, Plane, Rocket, Puzzle } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const initialProjectData = {
  name: 'Creator Canvas Product Roadmap',
  description: 'A collaborative project to launch our new sustainable product line. This workspace is for coordinating tasks, sharing files, and tracking progress.',
  columns: {
    'todo': {
      id: 'todo',
      title: 'Not Started',
      tasks: [
        { id: 'task-1', icon: KeyRound, title: 'Login Bugs', tags: [{label: 'Bug', color: 'bg-red-500/20 text-red-700'}, {label: 'Sprint 20', color: 'bg-gray-500/20 text-gray-700'}], assignees: ['Camille Ricketts', 'Nate Martins'] },
        { id: 'task-2', icon: Rocket, title: 'Mobile Start Up Time', tags: [{label: 'Epic', color: 'bg-green-500/20 text-green-700'},], assignees: ['Camille Ricketts', 'David Tibbitts', 'Andrea Lim'] },
        { id: 'task-3', icon: Bug, title: 'Error Codes', tags: [{label: 'Bug', color: 'bg-red-500/20 text-red-700'}, {label: 'Sprint 21', color: 'bg-gray-500/20 text-gray-700'}], assignees: ['Andrea Lim', 'Cory Etzkorn'] },
      ],
    },
    'in-progress': {
      id: 'in-progress',
      title: 'In Progress',
      tasks: [
        { id: 'task-4', icon: Plane, title: 'Onboarding', tags: [{label: 'Epic', color: 'bg-green-500/20 text-green-700'}], assignees: ['Andrea Lim', 'Nate Martins'] },
        { id: 'task-5', icon: Puzzle, title: 'Rewriting Flow', tags: [{label: 'Task', color: 'bg-yellow-500/20 text-yellow-700'}, {label: 'Sprint 23', color: 'bg-gray-500/20 text-gray-700'}], assignees: ['David Tibbitts', 'Camille Ricketts', 'Nate Martins'] },
        { id: 'task-8', icon: Wrench, title: 'Landing Page Redesign', tags: [], assignees: ['Cory Etzkorn', 'Nate Martins', 'Andrea Lim'] },
      ],
    },
    'review': {
        id: 'review',
        title: 'Complete',
        tasks: [
             { id: 'task-6', icon: Wrench, title: 'Rewrite Query Caching Logic', tags: [{label: 'Task', color: 'bg-yellow-500/20 text-yellow-700'}, {label: 'Sprint 23', color: 'bg-gray-500/20 text-gray-700'}, {label: 'Sprint 24', color: 'bg-gray-500/20 text-gray-700'}], assignees: ['David Tibbitts', 'Cory Etzkorn'] },
             { id: 'task-7', icon: Eye, title: 'Mobile', tags: [{label: 'Task', color: 'bg-yellow-500/20 text-yellow-700'}, {label: 'Sprint 23', color: 'bg-gray-500/20 text-gray-700'}], assignees: ['Ben Lang', 'Cory Etzkorn'] },
        ],
    },
  },
  columnOrder: ['todo', 'in-progress', 'review'],
};

// In a real app, you'd fetch this from Firestore based on params.projectId
const useProject = (projectId: string) => {
    const [project, setProject] = useState(initialProjectData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching data from a database
        setProject(initialProjectData);
        setLoading(false);
    }, [projectId]);

    const updateProject = (newProjectData: typeof initialProjectData) => {
        // In a real app, this would also save to Firestore
        setProject(newProjectData);
        console.log("Project state updated. In a real app, this would be saved to DB.");
    }

    return { project, loading, updateProject };
}

type Task = {
    id: string;
    icon: React.ElementType;
    title: string;
    tags: { label: string; color: string }[];
    assignees: string[];
}

type Column = {
    id: string;
    title: string;
    tasks: Task[];
}

const AddTaskForm = ({ columnId, onAddTask, onCancel }: { columnId: string, onAddTask: (columnId: string, taskTitle: string) => void, onCancel: () => void }) => {
    const [title, setTitle] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onAddTask(columnId, title.trim());
            setTitle('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-1 mt-2 space-y-2">
            <Textarea 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                className="w-full"
                rows={3}
                autoFocus
            />
            <div className="flex items-center gap-2">
                <Button type="submit" size="sm">Add Task</Button>
                <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
            </div>
        </form>
    )
}

export default function ProjectWorkspacePage({ params }: { params: { projectId: string } }) {
  const projectId = params.projectId;
  const { project, loading, updateProject } = useProject(projectId);
  const [isMounted, setIsMounted] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [addingTaskToColumn, setAddingTaskToColumn] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!project) return;
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const startColumn = project.columns[source.droppableId as keyof typeof project.columns];
    const endColumn = project.columns[destination.droppableId as keyof typeof project.columns];

    const newProject = { ...project };

    if (startColumn === endColumn) {
        const newTasks = Array.from(startColumn.tasks);
        const [removed] = newTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, removed);

        const newColumn = { ...startColumn, tasks: newTasks };
        newProject.columns[newColumn.id as keyof typeof project.columns] = newColumn;
    } else {
        const startTasks = Array.from(startColumn.tasks);
        const [removed] = startTasks.splice(source.index, 1);
        const newStartColumn = { ...startColumn, tasks: startTasks };

        const endTasks = Array.from(endColumn.tasks);
        endTasks.splice(destination.index, 0, removed);
        const newEndColumn = { ...endColumn, tasks: endTasks };
        
        newProject.columns[newStartColumn.id as keyof typeof project.columns] = newStartColumn;
        newProject.columns[newEndColumn.id as keyof typeof project.columns] = newEndColumn;
    }
    
    updateProject(newProject);
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim() || !project) return;
    const newColumnId = `column-${Object.keys(project.columns).length + 1}`;
    const newColumn: Column = { id: newColumnId, title: newColumnName, tasks: [] };

    const newProject = {
      ...project,
      columns: { ...project.columns, [newColumnId]: newColumn },
      columnOrder: [...project.columnOrder, newColumnId],
    };

    updateProject(newProject);
    setNewColumnName('');
  };

  const handleAddTask = (columnId: string, taskTitle: string) => {
    if(!project) return;

    const newTaskId = `task-${Date.now()}`;
    const newTask: Task = {
        id: newTaskId,
        title: taskTitle,
        icon: Puzzle, // Default icon
        tags: [],
        assignees: []
    };

    const targetColumn = project.columns[columnId as keyof typeof project.columns];
    const newTasks = [...targetColumn.tasks, newTask];
    const updatedColumn = { ...targetColumn, tasks: newTasks };
    
    const newProject = {
        ...project,
        columns: {
            ...project.columns,
            [columnId]: updatedColumn
        }
    }
    updateProject(newProject);
    setAddingTaskToColumn(null); // Close the form
  }

  if (loading) return <div>Loading project...</div>;
  if (!project) return <div>Project not found.</div>;

  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        <p className="text-muted-foreground max-w-3xl">{project.description}</p>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        {isMounted && (
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-6 items-start h-full pb-4">
                {project.columnOrder.map((columnId) => {
                    const column = project.columns[columnId as keyof typeof project.columns];
                    return (
                        <div key={column.id} className="w-80 flex-shrink-0 bg-secondary/50 rounded-lg">
                             <div className="flex justify-between items-center p-3">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-foreground">{column.title}</h3>
                                    <Badge variant="secondary" className="text-sm">{column.tasks.length}</Badge>
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
                                        className={`space-y-3 p-2 rounded-b-lg transition-colors min-h-[200px] ${snapshot.isDraggingOver ? 'bg-primary/10' : ''}`}
                                    >
                                    {column.tasks.map((task, index) => (
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
                                                        <div className="flex items-center gap-2 mb-3">
                                                            {task.assignees.map(assignee => (
                                                                <div key={assignee} className="flex items-center gap-1.5">
                                                                     <Avatar className="h-5 w-5">
                                                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${assignee}`} data-ai-hint="user avatar" />
                                                                        <AvatarFallback className="text-xs">{assignee.substring(0,1)}</AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-xs text-muted-foreground">{assignee}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
                                                    {task.tags && task.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {task.tags.map(tag => (
                                                                <Badge key={tag.label} className={`${tag.color} border-0`}>{tag.label}</Badge>
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
    </div>
  )
}

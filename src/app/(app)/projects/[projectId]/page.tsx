
"use client";

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, GripVertical, Plus, Paperclip, FileText, Video, Music, Clock, User, Edit } from "lucide-react";
import { Textarea } from '@/components/ui/textarea';

const initialProjectData = {
  name: 'Eco-Friendly Product Launch Campaign',
  description: 'A collaborative project to launch our new sustainable product line. This workspace is for coordinating tasks, sharing files, and tracking progress.',
  columns: {
    'todo': {
      id: 'todo',
      title: 'To Do',
      tasks: [
        { id: 'task-1', content: 'Draft initial campaign brief' },
        { id: 'task-2', content: 'Research target audience demographics' },
        { id: 'task-3', content: 'Create mood board for visual direction' },
      ],
    },
    'in-progress': {
      id: 'in-progress',
      title: 'In Progress',
      tasks: [
        { id: 'task-4', content: 'Design promotional graphics for social media' },
        { id: 'task-5', content: 'Write copy for launch announcement email' },
      ],
    },
    'review': {
        id: 'review',
        title: 'In Review',
        tasks: [
            { id: 'task-6', content: 'Review influencer collaboration contracts' },
        ],
    },
    'done': {
      id: 'done',
      title: 'Done',
      tasks: [
        { id: 'task-7', content: 'Finalize project budget' },
      ],
    },
  },
  columnOrder: ['todo', 'in-progress', 'review', 'done'],
  files: [
      { id: 'file-1', name: 'Campaign-Brief_v2.pdf', type: 'pdf', user: 'Alexa R.', date: '2023-10-26', version: 2 },
      { id: 'file-2', name: 'Launch_Video_Ad_Cut_1.mp4', type: 'video', user: 'John D.', date: '2023-10-25', version: 1 },
      { id: 'file-3', name: 'Product_Photos_Q4.zip', type: 'zip', user: 'Alexa R.', date: '2023-10-24', version: 3 },
      { id: 'file-4', name: 'Jingle_Idea.mp3', type: 'audio', user: 'Jane S.', date: '2023-10-23', version: 1 },
  ],
  activity: [
      { id: 'act-1', user: 'Alexa R.', action: 'moved "Finalize project budget" to Done', time: '2 hours ago' },
      { id: 'act-2', user: 'John D.', action: 'added "Launch_Video_Ad_Cut_1.mp4"', time: '8 hours ago' },
      { id: 'act-3', user: 'Alexa R.', action: 'moved "Review influencer collaboration contracts" to In Review', time: '1 day ago' },
      { id: 'act-4', user: 'Jane S.', action: 'commented on "Draft initial campaign brief"', time: '2 days ago' },
  ]
};

const getFileIcon = (type: string) => {
    switch (type) {
        case 'pdf': return <FileText className="w-6 h-6 text-red-500" />;
        case 'video': return <Video className="w-6 h-6 text-blue-500" />;
        case 'audio': return <Music className="w-6 h-6 text-purple-500" />;
        default: return <Paperclip className="w-6 h-6 text-gray-500" />;
    }
}


export default function ProjectWorkspacePage({ params }: { params: { projectId: string } }) {
  const [project, setProject] = useState(initialProjectData);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const startColumn = project.columns[source.droppableId as keyof typeof project.columns];
    const endColumn = project.columns[destination.droppableId as keyof typeof project.columns];

    if (startColumn === endColumn) {
        const newTasks = Array.from(startColumn.tasks);
        const [removed] = newTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, removed);

        const newColumn = {
            ...startColumn,
            tasks: newTasks,
        };

        setProject(prev => ({
            ...prev,
            columns: {
                ...prev.columns,
                [newColumn.id]: newColumn,
            },
        }));
        return;
    }

    // Moving from one list to another
    const startTasks = Array.from(startColumn.tasks);
    const [removed] = startTasks.splice(source.index, 1);
    const newStartColumn = {
      ...startColumn,
      tasks: startTasks,
    };

    const endTasks = Array.from(endColumn.tasks);
    endTasks.splice(destination.index, 0, removed);
    const newEndColumn = {
      ...endColumn,
      tasks: endTasks,
    };

    setProject(prev => ({
      ...prev,
      columns: {
        ...prev.columns,
        [newStartColumn.id]: newStartColumn,
        [newEndColumn.id]: newEndColumn,
      },
    }));

  };

  const [newColumnName, setNewColumnName] = useState('');

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    const newColumnId = `column-${Object.keys(project.columns).length + 1}`;
    const newColumn = {
      id: newColumnId,
      title: newColumnName,
      tasks: [],
    };

    setProject(prev => ({
      ...prev,
      columns: {
        ...prev.columns,
        [newColumnId]: newColumn,
      },
      columnOrder: [...prev.columnOrder, newColumnId],
    }));
    setNewColumnName('');
  };


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        <p className="text-muted-foreground max-w-3xl">{project.description}</p>
      </div>

      <div className="flex flex-col gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Kanban Board</CardTitle>
                <CardDescription>Drag and drop tasks to organize your workflow.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto pb-4">
                {isMounted && (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="flex gap-4 items-start">
                        {project.columnOrder.map((columnId) => {
                            const column = project.columns[columnId as keyof typeof project.columns];
                            return (
                                <Droppable droppableId={column.id} key={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`w-72 flex-shrink-0 rounded-lg p-2 ${snapshot.isDraggingOver ? 'bg-primary/10' : 'bg-secondary'}`}
                                        >
                                            <div className="flex justify-between items-center mb-4 px-2">
                                                <h3 className="font-semibold">{column.title}</h3>
                                                <Badge variant="secondary">{column.tasks.length}</Badge>
                                            </div>
                                            <div className="space-y-2 min-h-[100px]">
                                            {column.tasks.map((task, index) => (
                                                <Draggable draggableId={task.id} index={index} key={task.id}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`bg-card p-3 rounded-md shadow-sm border ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}
                                                        >
                                                            {task.content}
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            </div>
                                            <Button variant="ghost" className="w-full mt-2 justify-start"><Plus className="mr-2 h-4 w-4"/>Add task</Button>
                                        </div>
                                    )}
                                </Droppable>
                            );
                        })}
                         <div className="w-72 flex-shrink-0">
                            <div className="flex gap-2">
                                <Textarea value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)} placeholder="New column name" rows={1} />
                                <Button onClick={handleAddColumn}><Plus className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        </div>
                    </DragDropContext>
                )}
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>File Gallery</CardTitle>
                    <CardDescription>All project-related files in one place.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {project.files.map(file => (
                        <div key={file.id} className="flex items-center gap-4 rounded-md border p-3 hover:bg-muted/50">
                            {getFileIcon(file.type)}
                            <div className="flex-1">
                                <p className="font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">Uploaded by {file.user} on {file.date} (v{file.version})</p>
                            </div>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </div>
                    ))}
                     <Button variant="outline" className="w-full mt-2"><Plus className="mr-2 h-4 w-4"/>Upload File</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>Recent changes and updates to the project.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {project.activity.map(act => (
                        <div key={act.id} className="flex items-start gap-3">
                            <Avatar className="h-8 w-8 mt-1">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${act.user}`} />
                                <AvatarFallback>{act.user.substring(0,2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm">
                                    <span className="font-semibold">{act.user}</span> {act.action}
                                </p>
                                <p className="text-xs text-muted-foreground">{act.time}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}

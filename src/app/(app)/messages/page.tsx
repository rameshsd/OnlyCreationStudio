
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, Send, MoreVertical, Star, UserPlus, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Conversation, type Message } from '@/lib/types';
import { format } from 'date-fns';
import { NewConversationDialog } from '@/components/new-conversation-dialog';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';

const ConversationListSkeleton = () => (
    <div className="p-2 space-y-2">
        {[...Array(5)].map((_, i) => (
            <div className="flex items-center gap-3 p-3" key={i}>
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-40" />
                </div>
            </div>
        ))}
    </div>
);

const ChatWindowSkeleton = () => (
    <Card className="w-full lg:w-2/3 flex flex-col h-full">
        <CardHeader className="border-b">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
        </CardContent>
        <div className="p-4 border-t">
            <Skeleton className="h-10 w-full" />
        </div>
    </Card>
);


const ConversationList = ({ conversations, onSelectConvo, selectedConvoId, isLoading, onNewConvoClick }: { conversations: Conversation[], onSelectConvo: (id: string) => void, selectedConvoId: string | null, isLoading: boolean, onNewConvoClick: () => void }) => {
    const { user } = useAuth();
    
    return (
    <Card className="w-full lg:w-1/3 flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <Button variant="ghost" size="icon" onClick={onNewConvoClick}>
            <UserPlus className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search messages..." className="pl-10" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto px-2">
        {isLoading ? (
            <ConversationListSkeleton />
        ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4">
                <MessageSquare className="h-12 w-12" />
                <p className="mt-4">No conversations yet.</p>
                <p className="text-sm">Start a new chat using the '+' button above.</p>
            </div>
        ) : (
            <div className="flex flex-col gap-1">
            {conversations.map((convo: Conversation) => {
                const otherParticipant = convo.participantInfo?.find(p => p.userId !== user?.uid);
                
                // Defensively check for otherParticipant and its username to prevent crashes
                if (!otherParticipant?.username) {
                  return null;
                }

                return (
                <button key={convo.id} onClick={() => onSelectConvo(convo.id)} className={cn("flex items-center gap-3 p-3 rounded-lg text-left transition-colors w-full", selectedConvoId === convo.id ? 'bg-primary/10' : 'hover:bg-accent')}>
                    <div className="relative">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.username} data-ai-hint="user avatar" />
                        <AvatarFallback>{otherParticipant.username.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    </div>
                    <div className="flex-1 truncate">
                    <p className="font-semibold">{otherParticipant.username}</p>
                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessageText}</p>
                    </div>
                </button>
                )
            })}
            </div>
        )}
      </CardContent>
    </Card>
)};

const ChatWindow = ({ conversation, messages, onSendMessage, onBack, isLoadingMessages }: { conversation: Conversation | null, messages: Message[], onSendMessage: (text: string) => void, onBack?: () => void, isLoadingMessages: boolean }) => {
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        onSendMessage(newMessage);
        setNewMessage("");
    }
    
    if (!conversation) {
        return (
            <Card className="w-full lg:w-2/3 flex-col h-full hidden lg:flex">
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground h-full">
                    <MessageSquare className="h-20 w-20" />
                    <p className="mt-4 text-lg">Select a conversation to start chatting</p>
                </div>
            </Card>
        );
    }
    
    if (isLoadingMessages) {
        return <ChatWindowSkeleton />;
    }

    const otherParticipant = conversation.participantInfo?.find(p => p.userId !== user?.uid);

    return (
        <Card className="w-full lg:w-2/3 flex flex-col h-full">
            <>
                <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {onBack && <Button variant="ghost" size="icon" className="lg:hidden" onClick={onBack}>
                            <ArrowLeft className="h-5 w-5"/>
                        </Button>}
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={otherParticipant?.avatarUrl} alt={otherParticipant?.username} data-ai-hint="user avatar" />
                        <AvatarFallback>{otherParticipant?.username.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-bold">{otherParticipant?.username}</p>
                    </div>
                    </div>
                    <div className="flex items-center gap-1">
                    <TooltipProvider>
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon"><Star className="h-5 w-5" /></Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Add to Favorites</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                    </div>
                </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length > 0 ? (
                        <>
                        {messages.map((msg, index) => (
                            <div key={index} className={cn("flex items-end gap-2", msg.senderId === user?.uid ? 'justify-end' : '')}>
                            {msg.senderId !== user?.uid && <Avatar className="h-8 w-8"><AvatarImage src={otherParticipant?.avatarUrl} data-ai-hint="user avatar"/></Avatar>}
                            <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-xl p-3", msg.senderId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                                <p className="text-sm">{msg.text}</p>
                                {msg.createdAt && <p className="text-xs mt-1 text-right opacity-70">{format(msg.createdAt.toDate(), 'p')}</p>}
                            </div>
                            </div>
                        ))}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <p>No messages yet. Say hello!</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>
                <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}><Send className="h-5 w-5" /></Button>
                </form>
                </div>
            </>
        </Card>
    )
}


export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const convoIdFromQuery = searchParams.get('convoId');
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(convoIdFromQuery);
  const [isNewConvoDialogOpen, setIsNewConvoDialogOpen] = useState(false);

  useEffect(() => {
    const convoId = searchParams.get('convoId');
    if (convoId) {
        setSelectedConvoId(convoId);
    }
  }, [searchParams]);

  const conversationsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'conversations'), where('participantIds', 'array-contains', user.uid));
  }, [user]);

  const { data: rawConversations, isLoading: conversationsLoading } = useCollection<Conversation>(conversationsQuery);

  const conversations = useMemo(() => {
    if (!rawConversations) return null;
    return [...rawConversations].sort((a, b) => {
        const timeA = a.lastMessageSentAt?.seconds || 0;
        const timeB = b.lastMessageSentAt?.seconds || 0;
        return timeB - timeA;
    });
  }, [rawConversations]);

  const messagesQuery = useMemo(() => {
    if (!selectedConvoId) return null;
    return query(collection(db, 'conversations', selectedConvoId, 'messages'), orderBy('createdAt', 'asc'));
  }, [selectedConvoId]);

  const { data: messages, isLoading: messagesLoading } = useCollection<Message>(messagesQuery);
  
  const selectedConvoRef = useMemo(() => {
    if (!selectedConvoId) return null;
    return doc(db, 'conversations', selectedConvoId);
  }, [selectedConvoId]);

  const { data: selectedConversation, isLoading: selectedConvoLoading } = useDoc<Conversation>(selectedConvoRef);

  useEffect(() => {
      if (!isMobile && !selectedConvoId && conversations && conversations.length > 0) {
          setSelectedConvoId(conversations[0].id);
      }
  }, [conversations, isMobile, selectedConvoId]);

  const handleSendMessage = async (text: string) => {
    if (!user || !selectedConvoId) return;

    const messagesColRef = collection(db, 'conversations', selectedConvoId, 'messages');
    const convoDocRef = doc(db, 'conversations', selectedConvoId);

    const messageData = {
      senderId: user.uid,
      text,
      createdAt: serverTimestamp(),
    };

    const conversationUpdateData = {
        lastMessageText: text,
        lastMessageSentAt: serverTimestamp(),
    };
    
    addDoc(messagesColRef, messageData).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: messagesColRef.path,
            operation: 'create',
            requestResourceData: messageData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    updateDoc(convoDocRef, conversationUpdateData).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: convoDocRef.path,
            operation: 'update',
            requestResourceData: conversationUpdateData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleConvoSelected = (convoId: string) => {
    setSelectedConvoId(convoId);
  }
  
  if (authLoading) {
      return (
          <div className="h-[calc(100vh-8rem)] flex gap-4">
              <Card className="w-full lg:w-1/3 flex flex-col h-full">
                  <CardHeader><Skeleton className="h-8 w-32"/></CardHeader>
                  <ConversationListSkeleton />
              </Card>
              <div className="w-full lg:w-2/3 flex-col h-full hidden lg:flex">
                  <ChatWindowSkeleton />
              </div>
          </div>
      )
  }

  return (
    <>
      <NewConversationDialog
        open={isNewConvoDialogOpen}
        onOpenChange={setIsNewConvoDialogOpen}
        onConvoSelected={handleConvoSelected}
        existingConversations={conversations || []}
      />
      
      <div className="h-[calc(100vh-8rem)] flex gap-4">
          {isMobile ? (
             <>
                {!selectedConvoId ? (
                    <ConversationList
                        conversations={conversations || []}
                        onSelectConvo={setSelectedConvoId}
                        selectedConvoId={selectedConvoId}
                        isLoading={conversationsLoading}
                        onNewConvoClick={() => setIsNewConvoDialogOpen(true)}
                    />
                ) : (
                    <ChatWindow
                        conversation={selectedConversation}
                        messages={messages || []}
                        onSendMessage={handleSendMessage}
                        onBack={() => setSelectedConvoId(null)}
                        isLoadingMessages={messagesLoading || selectedConvoLoading}
                    />
                )}
             </>
          ) : (
            <>
                <ConversationList
                    conversations={conversations || []}
                    onSelectConvo={setSelectedConvoId}
                    selectedConvoId={selectedConvoId}
                    isLoading={conversationsLoading}
                    onNewConvoClick={() => setIsNewConvoDialogOpen(true)}
                />
                <ChatWindow
                    conversation={selectedConversation}
                    messages={messages || []}
                    onSendMessage={handleSendMessage}
                    isLoadingMessages={messagesLoading || selectedConvoLoading}
                />
            </>
          )}
      </div>
    </>
  );
}

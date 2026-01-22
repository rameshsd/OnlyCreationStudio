
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
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
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin"/>
            </div>
        ) : (
            <div className="flex flex-col gap-1">
            {conversations.map((convo: Conversation) => {
                const otherParticipant = convo.participantInfo?.find(p => p.userId !== user?.uid);
                return (
                <button key={convo.id} onClick={() => onSelectConvo(convo.id)} className={cn("flex items-center gap-3 p-3 rounded-lg text-left transition-colors w-full", selectedConvoId === convo.id ? 'bg-primary/10' : 'hover:bg-accent')}>
                    <div className="relative">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={otherParticipant?.avatarUrl} alt={otherParticipant?.username} data-ai-hint="user avatar" />
                        <AvatarFallback>{otherParticipant?.username.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    </div>
                    <div className="flex-1 truncate">
                    <p className="font-semibold">{otherParticipant?.username}</p>
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

const ChatWindow = ({ conversation, messages, onSendMessage, onBack, isLoadingMessages }: { conversation: Conversation | undefined, messages: Message[], onSendMessage: (text: string) => void, onBack?: () => void, isLoadingMessages: boolean }) => {
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const otherParticipant = conversation?.participantInfo?.find(p => p.userId !== user?.uid);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        onSendMessage(newMessage);
        setNewMessage("");
    }
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <Card className="w-full lg:w-2/3 flex flex-col h-full">
            {conversation ? (
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
                    {isLoadingMessages ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin"/>
                        </div>
                    ) : (
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
                        <div ref={messagesEndRef} />
                        </>
                    )}
                </CardContent>
                <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}><Send className="h-5 w-5" /></Button>
                </form>
                </div>
            </>
            ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground h-full">
                <MessageSquare className="h-20 w-20" />
                <p className="mt-4 text-lg">Select a conversation to start chatting</p>
            </div>
            )}
        </Card>
    )
}


export default function MessagesPage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [isNewConvoDialogOpen, setIsNewConvoDialogOpen] = useState(false);

  const conversationsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'conversations'), where('participantIds', 'array-contains', user.uid), orderBy('lastMessageSentAt', 'desc'));
  }, [user]);

  const { data: conversations, isLoading: conversationsLoading } = useCollection<Conversation>(conversationsQuery);

  const messagesQuery = useMemo(() => {
    if (!selectedConvoId) return null;
    return query(collection(db, 'conversations', selectedConvoId, 'messages'), orderBy('createdAt', 'asc'));
  }, [selectedConvoId]);

  const { data: messages, isLoading: messagesLoading } = useCollection<Message>(messagesQuery);
  
  const selectedConversation = useMemo(() => {
    return conversations?.find(c => c.id === selectedConvoId)
  }, [conversations, selectedConvoId]);

  useEffect(() => {
      if (!selectedConvoId && conversations && conversations.length > 0 && !isMobile) {
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
    
    // These are non-blocking writes for better UI responsiveness
    addDoc(messagesColRef, messageData);
    updateDoc(convoDocRef, {
        lastMessageText: text,
        lastMessageSentAt: serverTimestamp(),
    });
  }

  const handleConvoSelected = (convoId: string) => {
    setSelectedConvoId(convoId);
  }

  const mainContent = (
    <>
      <NewConversationDialog
        open={isNewConvoDialogOpen}
        onOpenChange={setIsNewConvoDialogOpen}
        onConvoSelected={handleConvoSelected}
        existingConversations={conversations || []}
      />
      {isMobile ? (
        <div className="h-[calc(100vh-11rem)]">
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
                    isLoadingMessages={messagesLoading}
                />
            )}
        </div>
      ) : (
        <div className="h-[calc(100vh-8rem)] flex gap-4">
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
            isLoadingMessages={messagesLoading}
          />
        </div>
      )}
    </>
  );
  
  return mainContent;
}

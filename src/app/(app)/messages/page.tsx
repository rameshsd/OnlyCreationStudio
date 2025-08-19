
"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, Send, MoreVertical, Star, UserPlus, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { generateMockMessages } from '@/lib/mock-data';

const { conversations, messages: mockMessages } = generateMockMessages(30);

type Conversation = typeof conversations[0];
type Messages = typeof mockMessages;

export default function MessagesPage() {
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(conversations[0]);
  const [currentMessages, setCurrentMessages] = useState<Messages[keyof Messages]>(mockMessages[1]);
  const [newMessage, setNewMessage] = useState("");

  const handleSelectConvo = (convo: Conversation) => {
    setSelectedConvo(convo);
    setCurrentMessages(mockMessages[convo.id as keyof Messages] || []);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvo) return;
    
    const newMsg = { from: "me", text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setCurrentMessages([...currentMessages, newMsg]);
    setNewMessage("");
  }

  return (
    <div className="h-[calc(100vh-11rem)] flex gap-4">
      <Card className="w-1/3 flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
            <Button variant="ghost" size="icon">
              <UserPlus className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search messages..." className="pl-10" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {conversations.map(convo => (
              <button key={convo.id} onClick={() => handleSelectConvo(convo)} className={cn("flex items-center gap-3 p-3 rounded-lg text-left transition-colors", selectedConvo?.id === convo.id ? 'bg-primary/10' : 'hover:bg-accent')}>
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={convo.avatar} alt={convo.name} data-ai-hint="company logo" />
                    <AvatarFallback>{convo.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  {convo.online && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-background" />}
                </div>
                <div className="flex-1 truncate">
                  <p className="font-semibold">{convo.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                </div>
                {convo.unread > 0 && <div className="h-5 min-w-[1.25rem] rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs px-1">{convo.unread}</div>}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="w-2/3 flex flex-col">
        {selectedConvo ? (
          <>
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConvo.avatar} alt={selectedConvo.name} data-ai-hint="company logo" />
                    <AvatarFallback>{selectedConvo.name.substring(0,2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{selectedConvo.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedConvo.online ? "Online" : "Offline"}</p>
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
              {currentMessages.map((msg, index) => (
                <div key={index} className={cn("flex items-end gap-2", msg.from === 'me' ? 'justify-end' : '')}>
                  {msg.from !== 'me' && <Avatar className="h-8 w-8"><AvatarImage src={selectedConvo.avatar} data-ai-hint="company logo"/></Avatar>}
                  <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-xl p-3", msg.from === 'me' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs mt-1 text-right opacity-70">{msg.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}><Send className="h-5 w-5" /></Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="h-20 w-20" />
            <p className="mt-4 text-lg">Select a conversation to start chatting</p>
          </div>
        )}
      </Card>
    </div>
  );
}

    
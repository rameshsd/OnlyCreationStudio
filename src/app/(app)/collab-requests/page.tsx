
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Briefcase, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const receivedRequests = [
  { id: 1, from: "EcoWear Inc.", project: "Sustainable Fashion Line Launch", status: "pending", avatar: "https://placehold.co/100x100.png?text=EW" },
  { id: 2, from: "Gamer's Galaxy", project: "New Gaming Headset Promotion", status: "pending", avatar: "https://placehold.co/100x100.png?text=GG" },
];

const sentRequests = [
  { id: 3, to: "Digital Nomad", project: "Travel Vlog Sponsorship", status: "accepted", avatar: "https://placehold.co/100x100.png?text=DN" },
  { id: 4, to: "FitFoodie", project: "Healthy Snack Brand Collab", status: "declined", avatar: "https://placehold.co/100x100.png?text=FF" },
  { id: 5, to: "Artisan Creations", project: "Handmade Crafts Showcase", status: "pending", avatar: "https://placehold.co/100x100.png?text=AC" },
];

type RequestStatus = "pending" | "accepted" | "declined";

export default function CollabRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState(receivedRequests);
  const [sent, setSent] = useState(sentRequests);

  const handleRequest = (id: number, action: 'accept' | 'decline') => {
    const request = requests.find(r => r.id === id);
    if (!request) return;

    toast({
      title: `Request ${action === 'accept' ? 'Accepted' : 'Declined'}`,
      description: `You have ${action === 'accept' ? 'accepted' : 'declined'} the collaboration request from ${request.from}.`,
    });
    // In a real app, you'd update the status via an API call.
    // For this demo, we'll just remove it from the pending list.
    setRequests(requests.filter(r => r.id !== id));
  };


  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30">Accepted</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
    }
  }


  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Collaboration Requests</h1>
        <p className="text-muted-foreground">Manage your incoming and outgoing partnership proposals.</p>
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received">
            <Briefcase className="mr-2 h-4 w-4" /> Received ({requests.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            <ArrowRight className="mr-2 h-4 w-4" /> Sent
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="received">
          <Card>
            <CardHeader>
              <CardTitle>Incoming Requests</CardTitle>
              <CardDescription>Review and respond to collaboration proposals from others.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requests.length > 0 ? requests.map(req => (
                <div key={req.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={req.avatar} alt={req.from} data-ai-hint="brand logo" />
                      <AvatarFallback>{req.from.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{req.from}</p>
                      <p className="text-sm text-muted-foreground">{req.project}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleRequest(req.id, 'decline')}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="icon" onClick={() => handleRequest(req.id, 'accept')}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="text-center text-muted-foreground py-12">
                  <Briefcase className="mx-auto h-12 w-12" />
                  <p className="mt-4">No pending requests.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card>
            <CardHeader>
              <CardTitle>Outgoing Requests</CardTitle>
              <CardDescription>Track the status of collaboration requests you have sent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sent.map(req => (
                <div key={req.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                       <AvatarImage src={req.avatar} alt={req.to} data-ai-hint="creator avatar" />
                      <AvatarFallback>{req.to.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{req.to}</p>
                      <p className="text-sm text-muted-foreground">{req.project}</p>
                    </div>
                  </div>
                  {getStatusBadge(req.status as RequestStatus)}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

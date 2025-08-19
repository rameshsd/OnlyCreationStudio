
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Camera, Mic, Lightbulb, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


// This would typically be fetched from an API
const studioData = {
  id: "1",
  name: "Visionary Vibes Studio",
  location: "Brooklyn, NY",
  price: 75,
  rating: 4.9,
  reviewCount: 128,
  images: [
    "https://images.unsplash.com/photo-1554236372-d0e4c7e4a836?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1603484478330-a936c9c3459c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1594223193433-f7129523a5c3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1595152758217-d67b2d5f8a05?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ],
  description: "A state-of-the-art multimedia studio in the heart of Brooklyn. Perfect for photoshoots, video production, and podcasting. Our space is designed to inspire creativity and provide you with all the tools you need to bring your vision to life.",
  amenities: [
    { icon: Camera, text: "Photography Gear" },
    { icon: Mic, text: "Podcast Equipment" },
    { icon: Lightbulb, text: "Professional Lighting" },
    { icon: Users, text: "Client Lounge" },
  ],
  availability: [
    { time: "09:00 AM" }, { time: "10:00 AM" }, { time: "11:00 AM" },
    { time: "12:00 PM", booked: true }, { time: "01:00 PM" }, { time: "02:00 PM" },
    { time: "03:00 PM", booked: true }, { time: "04:00 PM" }, { time: "05:00 PM" },
  ]
};

export default function StudioDetailPage({ params }: { params: { id: string } }) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const { toast } = useToast();

  const handleBooking = () => {
    if (!date || !selectedTime) {
      toast({
        title: "Incomplete Selection",
        description: "Please select a date and time slot to book.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Booking Confirmed!",
      description: `You've booked ${studioData.name} on ${date.toLocaleDateString()} at ${selectedTime}.`,
    });
  };
  
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{studioData.name}</h1>
        <div className="flex items-center gap-4 text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <span className="font-bold">{studioData.rating}</span> ({studioData.reviewCount} reviews)
            </div>
            <div className="flex items-center gap-1">
                <MapPin className="w-5 h-5" />
                <span>{studioData.location}</span>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="col-span-2 row-span-2">
          <Image src={studioData.images[0]} alt={studioData.name} width={1200} height={800} className="rounded-lg object-cover w-full h-full" data-ai-hint="studio interior" />
        </div>
        {studioData.images.slice(1).map((img, i) => (
          <div key={i} className="relative">
             <Image src={img} alt={`${studioData.name} - ${i+1}`} width={600} height={400} className="rounded-lg object-cover w-full h-full" data-ai-hint="studio detail" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>About the Studio</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{studioData.description}</p>
                    <h3 className="font-bold mt-6 mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {studioData.amenities.map(item => (
                            <div key={item.text} className="flex items-center gap-2">
                                <item.icon className="w-5 h-5 text-primary"/>
                                <span className="text-sm">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Book Your Session</CardTitle>
                    <CardDescription>Starting at <span className="font-bold text-primary">${studioData.price}/hour</span></CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                    />
                    <div className="w-full mt-4">
                        <h4 className="font-semibold mb-2 text-center">Available Times for {date ? date.toLocaleDateString() : '...'}</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {studioData.availability.map(slot => (
                                <Button 
                                    key={slot.time} 
                                    variant={selectedTime === slot.time ? "default" : "outline"}
                                    disabled={slot.booked}
                                    onClick={() => setSelectedTime(slot.time)}
                                >
                                    {slot.time}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleBooking} disabled={!date || !selectedTime}>
                       <Clock className="mr-2 h-4 w-4"/> Book Now
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  )
}


"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Camera, Mic, Lightbulb, Users, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// This would typically be fetched from an API
const staticStudioData = {
  availability: [
    { time: "09:00 AM" }, { time: "10:00 AM" }, { time: "11:00 AM" },
    { time: "12:00 PM", booked: true }, { time: "01:00 PM" }, { time: "02:00 PM" },
    { time: "03:00 PM", booked: true }, { time: "04:00 PM" }, { time: "05:00 PM" },
  ]
};

interface FirestoreTimestamp {
    seconds: number;
    nanoseconds: number;
}

export interface StudioProfile {
    id: string;
    studioName: string;
    location: string;
    description: string;
    type: string;
    amenities: string[];
    rentableGear: string[];
    price: number;
    priceUnit: string;
    contactNumber: string;
    isDiscounted: boolean;
    discountPercentage: number;
    photos: string[];
    size: string;
    qualityGrade: string;
    services: string[];
    createdAt?: FirestoreTimestamp;
    rating?: number;
    reviewCount?: number;
}

const StudioDetailSkeleton = () => (
    <div className="flex flex-col gap-8 animate-pulse">
        <div>
            <Skeleton className="h-10 w-3/4 rounded-lg" />
            <div className="flex items-center gap-4 mt-2">
                <Skeleton className="h-5 w-1/4 rounded-md" />
                <Skeleton className="h-5 w-1/4 rounded-md" />
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Skeleton className="col-span-2 row-span-2 h-full min-h-[250px] rounded-lg" />
            <Skeleton className="h-full aspect-square rounded-lg" />
            <Skeleton className="h-full aspect-square rounded-lg" />
            <Skeleton className="h-full aspect-square rounded-lg" />
        </div>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3 rounded-md" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full rounded-md" />
                        <Skeleton className="h-4 w-full rounded-md" />
                        <Skeleton className="h-4 w-3/4 rounded-md" />
                        <Skeleton className="h-6 w-1/4 mt-4 rounded-md" />
                         <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-5 w-full rounded-md" />
                            <Skeleton className="h-5 w-full rounded-md" />
                            <Skeleton className="h-5 w-full rounded-md" />
                            <Skeleton className="h-5 w-full rounded-md" />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2 rounded-md" />
                        <Skeleton className="h-5 w-1/3 rounded-md" />
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <Skeleton className="h-64 w-full rounded-md" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full rounded-md" />
                    </CardFooter>
                </Card>
            </div>
         </div>
    </div>
)


export default function StudioDetailPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const studioId = params.id;

  const [studioData, setStudioData] = useState<StudioProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!studioId) return;
    setIsLoading(true);

    const docRef = doc(db, 'studio_profiles', studioId);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
            setStudioData({ id: snapshot.id, ...snapshot.data() } as StudioProfile);
        } else {
            setStudioData(null);
        }
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching studio profile:", error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'get'
        }));
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [studioId]);


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
      description: `You\'ve booked ${studioData?.studioName} on ${date.toLocaleDateString()} at ${selectedTime}.`,
    });
  };

  if (isLoading) {
      return <StudioDetailSkeleton />;
  }

  if (!studioData) {
      return (
          <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
              <AlertTriangle className="w-16 h-16" />
              <h2 className="mt-4 text-2xl font-bold">Studio Not Found</h2>
              <p>The studio you are looking for does not exist or may have been removed.</p>
          </div>
      );
  }
  
  const amenitiesIcons: { [key: string]: React.ElementType } = {
    "Photography Gear": Camera,
    "Podcast Equipment": Mic,
    "Professional Lighting": Lightbulb,
    "Client Lounge": Users,
    default: Star,
  };


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{studioData.studioName}</h1>
        <div className="flex items-center gap-4 text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <span className="font-bold">4.9</span> (128 reviews)
            </div>
            <div className="flex items-center gap-1">
                <MapPin className="w-5 h-5" />
                <span>{studioData.location}</span>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="col-span-2 row-span-2">
          {studioData.photos?.[0] && <Image src={studioData.photos[0]} alt={studioData.studioName} width={1200} height={800} className="rounded-lg object-cover w-full h-full" data-ai-hint="studio interior" />}
        </div>
        {studioData.photos?.slice(1, 4).map((img, i) => (
          <div key={i} className="relative aspect-square">
             <Image src={img} alt={`${studioData.studioName} - ${i+1}`} fill className="rounded-lg object-cover w-full h-full" data-ai-hint="studio detail" />
          </div>
        ))}
         {studioData.photos.length < 4 && [...Array(4 - studioData.photos.length)].map((_, i) => (
             <div key={`placeholder-${i}`} className="bg-secondary rounded-lg aspect-square" />
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
                        {studioData.amenities?.map(item => {
                            const Icon = amenitiesIcons[item] || amenitiesIcons.default;
                            return (
                                <div key={item} className="flex items-center gap-2">
                                    <Icon className="w-5 h-5 text-primary"/>
                                    <span className="text-sm">{item}</span>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Book Your Session</CardTitle>
                    <CardDescription>Starting at <span className="font-bold text-primary">${studioData.price}/{studioData.priceUnit}</span></CardDescription>
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
                            {staticStudioData.availability.map(slot => (
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

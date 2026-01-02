
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Star, MapPin, Camera, Mic, Lightbulb, Users, Clock, Loader2, AlertTriangle, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useMemoFirebase } from '@/firebase/useMemoFirebase';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { LocationEditor } from './location-editor';

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
    userProfileId?: string;
    studioName: string;
    location: {
        address: string;
        latitude?: number;
        longitude?: number;
    };
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
    userProfileId: string;
}

interface Booking {
    id: string;
    date: string;
    time: string;
}

interface OwnerProfile {
    username: string;
    avatarUrl: string;
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
  const [isLocationEditorOpen, setIsLocationEditorOpen] = useState(false);
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const studioId = params.id;
  const { user } = useAuth();

  const studioDocRef = useMemoFirebase(
    studioId ? doc(db, 'studio_profiles', studioId) : null,
    [studioId]
  );

  const { data: studioData, isLoading, mutate } = useDoc<StudioProfile>(studioDocRef);

  const isOwner = user?.uid === studioData?.userProfileId;

  const handleBooking = async () => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in to book a studio.", variant: "destructive" });
      return;
    }
    if (!date || !selectedTime) {
      toast({ title: "Incomplete Selection", description: "Please select a date and time slot to book.", variant: "destructive" });
      return;
    }
    toast({
      title: "Booking Confirmed!",
      description: `You've booked ${studioData?.studioName} on ${date.toLocaleDateString()} at ${selectedTime}.`,
    });
  };

  const onLocationUpdate = () => {
    toast({
        title: "Location Updated",
        description: "The studio location has been successfully updated.",
    });
    // This will trigger the useDoc hook to refetch the data
    mutate();
  }


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
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <span className="font-bold">{studioData.rating || '4.9'}</span> ({studioData.reviewCount || 128} reviews)
            </div>
            <div className="flex items-center gap-1">
                <MapPin className="w-5 h-5" />
                <span>{studioData.location?.address || 'Location not set'}</span>
            </div>
             {isOwner && (
                <Button variant="outline" size="sm" onClick={() => setIsLocationEditorOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Location
                </Button>
            )}
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

       {studioData.location?.latitude && studioData.location?.longitude && (
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full rounded-lg overflow-hidden">
                <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${studioData.location.latitude},${studioData.location.longitude}`}>
                </iframe>
              </div>
            </CardContent>
          </Card>
        )}

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
                        disabled={(day) => day < new Date(new Date().setDate(new Date().getDate() - 1))}
                    />
                    <div className="w-full mt-4">
                        <h4 className="font-semibold mb-2 text-center">Available Times for {date ? date.toLocaleDateString() : '...'}</h4>
                        {bookingsLoading ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : (
                          <div className="grid grid-cols-3 gap-2">
                              {timeSlots.map(slot => {
                                  const isBooked = bookedTimeSlots.has(slot);
                                  return (
                                      <Button 
                                          key={slot} 
                                          variant={selectedTime === slot ? "default" : "outline"}
                                          disabled={isBooked}
                                          onClick={() => setSelectedTime(slot)}
                                      >
                                          {slot}
                                      </Button>
                                  )
                              })}
                          </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleBooking} disabled={!date || !selectedTime || isBooking || bookingsLoading}>
                       {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       <Clock className="mr-2 h-4 w-4"/> Book Now
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
       {isOwner && studioId && (
        <LocationEditor
          open={isLocationEditorOpen}
          onOpenChange={setIsLocationEditorOpen}
          studioId={studioId}
          currentLocation={studioData.location}
          onLocationUpdate={onLocationUpdate}
        />
      )}
    </div>
  )
}

    
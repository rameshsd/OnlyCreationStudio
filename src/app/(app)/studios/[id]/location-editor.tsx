
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LocateFixed } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

interface LocationEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studioId: string;
  currentLocation: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  onLocationUpdate: () => void;
}

export function LocationEditor({ open, onOpenChange, studioId, currentLocation, onLocationUpdate }: LocationEditorProps) {
  const [address, setAddress] = useState(currentLocation?.address || '');
  const [latitude, setLatitude] = useState(currentLocation?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(currentLocation?.longitude?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setAddress(currentLocation?.address || '');
      setLatitude(currentLocation?.latitude?.toString() || '');
      setLongitude(currentLocation?.longitude?.toString() || '');
    }
  }, [open, currentLocation]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", description: "Your browser doesn't support geolocation.", variant: "destructive" });
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());
        setGeoLoading(false);
        toast({ title: "Location Fetched!", description: "Coordinates have been updated." });
      },
      () => {
        setGeoLoading(false);
        toast({ title: "Geolocation failed", description: "Unable to retrieve your location.", variant: "destructive" });
      }
    );
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lon)) {
        throw new Error("Invalid latitude or longitude.");
      }

      const studioRef = doc(db, 'studio_profiles', studioId);
      const locationData = {
        location: {
          address,
          latitude: lat,
          longitude: lon,
        }
      };

      await updateDoc(studioRef, locationData).catch(serverError => {
        const permissionError = new FirestorePermissionError({
          path: studioRef.path,
          operation: 'update',
          requestResourceData: locationData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });

      onLocationUpdate();
      onOpenChange(false);
    } catch (error: any) {
      if (!(error instanceof FirestorePermissionError)) {
          toast({
            title: "Update Failed",
            description: error.message || "Could not update the location.",
            variant: "destructive",
          });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Studio Location</DialogTitle>
          <DialogDescription>
            You can automatically fetch your coordinates or enter them manually.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., 123 Main St, Anytown" />
          </div>
          <div className="flex justify-end">
             <Button variant="outline" onClick={handleGetCurrentLocation} disabled={geoLoading}>
                {geoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />}
                Use My Current Location
              </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input id="latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="e.g., 40.7128" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input id="longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="e.g., -74.0060" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    
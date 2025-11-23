
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Trash2, Info, Percent, Upload, Plus, X } from 'lucide-react';

const amenitiesList = [
    "High-speed WiFi", "Air Conditioning",
    "Parking Available", "Kitchen/Catering Area",
    "Makeup Station", "Wardrobe/Changing Room",
    "Green Screen", "Cyclorama Wall",
    "Natural Light", "Blackout Curtains",
    "Sound Proofing", "Client Lounge",
    "Equipment Storage", "Loading Dock",
    "Elevator Access", "Wheelchair Accessible",
    "Private Restroom", "Bluetooth Speaker",
    "Backdrops", "Lighting Equipment",
    "Props", "Coffee & Tea",
];

export default function StudioOnboardingPage() {
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    // --- State for all form fields ---
    // Step 1
    const [studioName, setStudioName] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [studioType, setStudioType] = useState('');
    // Step 2
    const [amenities, setAmenities] = useState<string[]>([]);
    // Step 3
    const [equipmentInput, setEquipmentInput] = useState('');
    const [equipment, setEquipment] = useState<string[]>([]);
    // Step 4
    const [price, setPrice] = useState('');
    const [priceUnit, setPriceUnit] = useState('hour');
    const [contactNumber, setContactNumber] = useState('');
    const [isDiscounted, setIsDiscounted] = useState(false);
    const [discountPercentage, setDiscountPercentage] = useState('');
    // Step 5
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [galleryPhotos, setGalleryPhotos] = useState<File[]>([]);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);


    const nextStep = () => setStep(prev => (prev < totalSteps ? prev + 1 : prev));
    const prevStep = () => setStep(prev => (prev > 1 ? prev - 1 : prev));

    const handleAmenityChange = (amenity: string) => {
        setAmenities(prev => 
            prev.includes(amenity) 
                ? prev.filter(item => item !== amenity) 
                : [...prev, amenity]
        );
    };

    const handleAddEquipment = () => {
        if (equipmentInput.trim()) {
            setEquipment(prev => [...prev, equipmentInput.trim()]);
            setEquipmentInput('');
        }
    };

    const handleRemoveEquipment = (itemToRemove: string) => {
        setEquipment(prev => prev.filter(item => item !== itemToRemove));
    };
    
    const calculateDiscountedPrice = () => {
        const originalPrice = parseFloat(price);
        const discount = parseFloat(discountPercentage);
        if (!isNaN(originalPrice) && !isNaN(discount) && isDiscounted) {
            const discounted = originalPrice - (originalPrice * (discount / 100));
            return discounted.toFixed(2);
        }
        return null;
    }
    const discountedPrice = calculateDiscountedPrice();

    const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePhoto(file);
            setProfilePhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleGalleryPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            const combinedFiles = [...galleryPhotos, ...newFiles].slice(0, 5);
            setGalleryPhotos(combinedFiles);

            const newPreviews = combinedFiles.map(file => URL.createObjectURL(file));
            setGalleryPreviews(newPreviews);
        }
    };
    
    const handleRemoveGalleryPhoto = (index: number) => {
        const newPhotos = [...galleryPhotos];
        newPhotos.splice(index, 1);
        setGalleryPhotos(newPhotos);

        const newPreviews = [...galleryPreviews];
        newPreviews.splice(index, 1);
        setGalleryPreviews(newPreviews);
    };


    return (
        <div className="min-h-screen bg-secondary/40 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-bold text-primary">Only Creation</h1>
                    <p className="text-muted-foreground">List your studio space</p>
                </div>
                <Card className="w-full">
                    <CardHeader>
                        <div className="flex justify-between items-center mb-2">
                             <CardTitle className="text-3xl">Studio Setup</CardTitle>
                             <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
                        </div>
                        <Progress value={(step / totalSteps) * 100} className="w-full" />
                    </CardHeader>

                    {step === 1 && (
                         <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="studio-name">Studio Name *</Label>
                                    <Input id="studio-name" placeholder="Enter your studio name" value={studioName} onChange={(e) => setStudioName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address *</Label>
                                    <Textarea id="address" rows={4} value={address} onChange={(e) => setAddress(e.target.value)} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="studio-type">Studio Type *</Label>
                                     <Select value={studioType} onValueChange={setStudioType}>
                                        <SelectTrigger id="studio-type">
                                            <SelectValue placeholder="Select studio type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="photo">Photography Studio</SelectItem>
                                            <SelectItem value="video">Video Production Studio</SelectItem>
                                            <SelectItem value="audio">Audio/Podcast Studio</SelectItem>
                                            <SelectItem value="creative">Creative Space</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    )}

                    {step === 2 && (
                         <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-2">Amenities</h2>
                            <p className="text-muted-foreground mb-6">Select all amenities available at your studio</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {amenitiesList.map(amenity => (
                                    <Label 
                                        key={amenity}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                                            amenities.includes(amenity) ? "bg-primary/10 border-primary" : "hover:bg-accent"
                                        )}
                                    >
                                        <Checkbox 
                                            checked={amenities.includes(amenity)}
                                            onCheckedChange={() => handleAmenityChange(amenity)}
                                        />
                                        <span>{amenity}</span>
                                    </Label>
                                ))}
                            </div>
                            <div className="mt-6 p-3 bg-secondary rounded-md text-sm text-muted-foreground">
                                Selected: {amenities.length} amenities
                            </div>
                        </CardContent>
                    )}
                    
                    {step === 3 && (
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-2">Equipment</h2>
                            <p className="text-muted-foreground mb-6">Add equipment available for use at your studio</p>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="e.g. Canon 5D Mark IV, Softbox Lighting Kit" 
                                        value={equipmentInput}
                                        onChange={(e) => setEquipmentInput(e.target.value)}
                                    />
                                    <Button onClick={handleAddEquipment}>Add</Button>
                                </div>
                                <div className="border rounded-lg p-4 min-h-[150px]">
                                    {equipment.length === 0 ? (
                                        <p className="text-muted-foreground text-center pt-10">No equipment added yet. Add equipment that creators can use at your studio.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {equipment.map((item, index) => (
                                                <li key={index} className="flex justify-between items-center bg-secondary p-2 rounded-md">
                                                    <span>{item}</span>
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveEquipment(item)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    )}
                    
                    {step === 4 && (
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-6">Pricing &amp; Contact</h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price *</Label>
                                        <Input id="price" type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price-unit">Per *</Label>
                                        <Select value={priceUnit} onValueChange={setPriceUnit}>
                                            <SelectTrigger id="price-unit">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="hour">Per Hour</SelectItem>
                                                <SelectItem value="day">Per Day</SelectItem>
                                                <SelectItem value="session">Per Session</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="discount-check" checked={isDiscounted} onCheckedChange={(checked) => setIsDiscounted(checked as boolean)} />
                                        <Label htmlFor="discount-check">Offer a discount</Label>
                                    </div>
                                    {isDiscounted && (
                                        <div className="relative">
                                            <Input 
                                                id="discount" 
                                                type="number" 
                                                placeholder="e.g., 15" 
                                                value={discountPercentage} 
                                                onChange={(e) => setDiscountPercentage(e.target.value)}
                                                className="pl-8"
                                            />
                                            <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="whatsapp-number">WhatsApp Contact Number *</Label>
                                    <Input id="whatsapp-number" placeholder="+91 (555) 123-4567" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
                                    <p className="text-xs text-muted-foreground">This number will be used for direct booking inquiries and communications</p>
                                </div>

                                <div className="bg-secondary rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Info className="h-5 w-5 text-primary" />
                                        <span>Pricing Preview</span>
                                    </div>
                                    {discountedPrice ? (
                                        <div className="mt-2">
                                            <p className="text-xl font-bold text-muted-foreground line-through">
                                                ₹{price || '0'} <span className="text-base font-medium">/ {priceUnit}</span>
                                            </p>
                                            <p className="text-3xl font-bold mt-1 text-primary">
                                                ₹{discountedPrice} <span className="text-xl font-medium">/ {priceUnit}</span>
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-3xl font-bold mt-2 text-primary">
                                            ₹{price || '0'} <span className="text-xl font-medium text-muted-foreground">/ {priceUnit}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    )}

                    {step === 5 && (
                         <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-6">Photos</h2>
                             <div className="space-y-8">
                                <div className="space-y-2">
                                    <Label>Profile Photo *</Label>
                                    <Label 
                                        htmlFor="profile-photo-input"
                                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent"
                                    >
                                        {profilePhotoPreview ? (
                                            <Image src={profilePhotoPreview} alt="Profile preview" width={192} height={192} className="h-full w-full object-contain p-2" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-secondary mb-4">
                                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <p className="mb-2 text-sm font-semibold">Upload Profile Photo</p>
                                                <p className="text-xs text-muted-foreground">This will be the main photo for your studio</p>
                                            </div>
                                        )}
                                        <Input id="profile-photo-input" type="file" className="hidden" accept="image/*" onChange={handleProfilePhotoChange} />
                                    </Label>
                                </div>
                                <div className="space-y-2">
                                    <Label>Gallery Photos (Optional)</Label>
                                    <p className="text-sm text-muted-foreground">Upload up to 5 additional photos showcasing your studio.</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        {galleryPreviews.map((src, index) => (
                                            <div key={index} className="relative aspect-square">
                                                <Image src={src} alt={`Gallery preview ${index + 1}`} fill className="rounded-lg object-cover" />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6"
                                                    onClick={() => handleRemoveGalleryPhoto(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {galleryPhotos.length < 5 && (
                                            <Label 
                                                htmlFor="gallery-photos-input"
                                                className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent"
                                            >
                                                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-secondary mb-2">
                                                    <Plus className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <p className="text-xs text-center">Add Gallery Photos</p>
                                                <Input 
                                                    id="gallery-photos-input" 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*" 
                                                    multiple 
                                                    onChange={handleGalleryPhotosChange}
                                                    disabled={galleryPhotos.length >= 5}
                                                />
                                            </Label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    )}

                    <CardFooter className="flex justify-between">
                        {step > 1 ? (
                            <Button variant="outline" onClick={prevStep}>Previous</Button>
                        ) : (
                            <div></div> // Placeholder to keep "Next" button on the right
                        )}
                        <Button onClick={step === totalSteps ? () => {} : nextStep}>
                            {step === totalSteps ? 'List My Studio' : 'Next Step'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

    
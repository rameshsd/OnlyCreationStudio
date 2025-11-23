
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function StudioOnboardingPage() {
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    // We can add state management for form fields here later

    return (
        <div className="min-h-screen bg-secondary/40 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                <p className="text-center text-muted-foreground mb-4">List your studio space</p>
                <Card className="w-full">
                    <CardHeader>
                        <div className="flex justify-between items-center mb-2">
                             <CardTitle className="text-3xl">Studio Setup</CardTitle>
                             <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
                        </div>
                        <Progress value={(step / totalSteps) * 100} className="w-full" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form>
                            <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="studio-name">Studio Name *</Label>
                                    <Input id="studio-name" placeholder="Enter your studio name" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address *</Label>
                                    <Textarea id="address" rows={4} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea id="description" rows={4} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="studio-type">Studio Type *</Label>
                                     <Select>
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
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button>Next Step</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}


"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({
                title: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }
        setLoading(true);
        try {
            await signup(email, password, username);
            toast({
                title: "Account Created!",
                description: "You have successfully signed up.",
            });
            router.push('/dashboard');
        } catch (error: any) {
            toast({
                title: "Signup Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary/50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Logo className="mx-auto h-12 w-auto mb-4" />
                    <CardTitle className="text-3xl">Create an Account</CardTitle>
                    <CardDescription>Join OnlyCreation today!</CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" type="text" placeholder="yourusername" required value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign Up
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold text-primary hover:underline">
                                Log in
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

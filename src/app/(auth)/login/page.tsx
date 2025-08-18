
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

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message,
                variant: "destructive",
            });
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary/50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Logo className="mx-auto h-12 w-auto mb-4" />
                    <CardTitle className="text-3xl">Welcome Back!</CardTitle>
                    <CardDescription>Sign in to continue to OnlyCreation</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Log In
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link href="/signup" className="font-semibold text-primary hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

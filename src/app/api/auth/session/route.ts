
import { NextResponse, NextRequest } from 'next/server';
import { auth } from 'firebase-admin';
import { adminApp } from '@/lib/firebase-admin'; // Import adminApp for initialization check

export async function POST(request: NextRequest) {
    const authorization = request.headers.get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        // Session cookie expires in 5 days.
        const expiresIn = 60 * 60 * 24 * 5 * 1000;

        try {
            // Ensure admin app is initialized before using auth()
            if (!adminApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }
            const sessionCookie = await auth(adminApp).createSessionCookie(idToken, { expiresIn });
            const options = {
                name: 'session',
                value: sessionCookie,
                maxAge: expiresIn,
                httpOnly: true,
                secure: true, // Set to true for HTTPS environments
            };

            const response = NextResponse.json({}, { status: 200 });
            response.cookies.set(options);
            return response;
            
        } catch (error) {
            console.error('Error creating session cookie:', error);
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
    }

    return NextResponse.json({ message: 'Bad Request: No authorization token.' }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
    const options = {
        name: 'session',
        value: '',
        maxAge: -1, // Expire the cookie immediately
    };

    const response = NextResponse.json({}, { status: 200 });
    response.cookies.set(options);
    return response;
}


import { NextResponse, NextRequest } from 'next/server';
import { auth } from 'firebase-admin';
import { adminDb } from '@/lib/firebase-admin'; // Ensure admin app is initialized

export async function POST(request: NextRequest) {
    const authorization = request.headers.get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

        try {
            const sessionCookie = await auth().createSessionCookie(idToken, { expiresIn });
            const options = {
                name: 'session',
                value: sessionCookie,
                maxAge: expiresIn,
                httpOnly: true,
                secure: true,
            };

            // Set cookie
            const response = NextResponse.json({}, { status: 200 });
            response.cookies.set(options);
            return response;
            
        } catch (error) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
    }

    return NextResponse.json({ message: 'Bad Request' }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
    const options = {
        name: 'session',
        value: '',
        maxAge: -1,
    };

    const response = NextResponse.json({}, { status: 200 });
    response.cookies.set(options);
    return response;
}

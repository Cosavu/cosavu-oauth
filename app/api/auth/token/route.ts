import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, provider } = await request.json();
    
    let userCredential;
    if (provider === 'google') {
      const googleProvider = new GoogleAuthProvider();
      userCredential = await signInWithPopup(auth, googleProvider);
    } else {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    }
    
    const idToken = await userCredential.user.getIdToken();
    
    return NextResponse.json({
      token: idToken,
      user_id: userCredential.user.uid,
      email: userCredential.user.email
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
"use client";

export const dynamic = 'force-dynamic';

import { useState, Suspense } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

function SignUpContent() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");
  const clientId = searchParams.get("client_id");

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    const params = new URLSearchParams();
    params.set("email", email);
    params.set("mode", "signup");
    if (redirectUri) params.set("redirect_uri", redirectUri);
    if (state) params.set("state", state);
    if (clientId) params.set("client_id", clientId);
    
    router.push(`/login/password?${params.toString()}`);
  };

  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      
      if (redirectUri) {
        const params = new URLSearchParams();
        params.set("token", token);
        if (state) params.set("state", state);
        params.set("user_id", result.user.uid);
        params.set("email", result.user.email || "");
        
        window.location.href = `${redirectUri}?${params.toString()}`;
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          <Image src="/tnsa.svg" alt="TNSA" width={60} height={60} />
        </div>
        
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm space-y-8">
            <div className="text-center space-y-8">
              <h1 className="text-3xl font-normal">Create your account</h1>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-full border-gray-300 hover:bg-gray-50 justify-start px-4"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12 rounded-full border-gray-300 hover:bg-gray-50 justify-start px-4"
                  disabled
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Continue with phone
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">OR</span>
                </div>
              </div>

              <form onSubmit={handleEmailContinue} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-full border-gray-300 px-4"
                  required
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button
                  type="submit"
                  className="w-full h-12 rounded-full bg-black hover:bg-gray-800 text-white"
                  disabled={loading}
                >
                  Continue
                </Button>
              </form>

              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 hover:underline">
                  Log in
                </a>
              </p>

              <div className="text-xs text-gray-500 space-x-3">
                <a href="https://legal.tnsaai.com/legal/terms" target="_blank" rel="noopener noreferrer" className="hover:underline">Terms of Use</a>
                <span>|</span>
                <a href="https://legal.tnsaai.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center p-8">
        <Image
          src="/igen1.png"
          alt="TNSA Showcase"
          width={600}
          height={600}
          className="rounded-lg"
        />
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <SignUpContent />
    </Suspense>
  );
}
